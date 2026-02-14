import { Pool, PoolConfig, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig extends PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

const config: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'indian_culture',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
};

class Database {
  private pool: Pool;
  private isConnected: boolean = false;
  private maxRetries: number = 3;
  private retryDelay: number = 2000; // 2 seconds

  constructor() {
    this.pool = new Pool(config);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle pool errors
    this.pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
      this.isConnected = false;
    });

    // Handle successful connections
    this.pool.on('connect', () => {
      this.isConnected = true;
    });

    // Handle client removal
    this.pool.on('remove', () => {
      console.log('Client removed from pool');
    });
  }

  /**
   * Initialize database connection with retry logic
   */
  async initialize(): Promise<void> {
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        // Test the connection
        const client = await this.pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        
        this.isConnected = true;
        console.log('Database connection established successfully');
        return;
      } catch (error) {
        retries++;
        console.error(`Database connection attempt ${retries} failed:`, error);

        if (retries >= this.maxRetries) {
          throw new Error(
            `Failed to connect to database after ${this.maxRetries} attempts: ${error}`
          );
        }

        // Wait before retrying
        await this.sleep(this.retryDelay * retries);
      }
    }
  }

  /**
   * Execute a query with automatic retry on connection errors
   */
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        const result = await this.pool.query(text, params);
        return result.rows;
      } catch (error: any) {
        retries++;
        
        // Check if it's a connection error
        if (this.isConnectionError(error) && retries < this.maxRetries) {
          console.error(`Query failed (attempt ${retries}), retrying...`, error.message);
          await this.sleep(this.retryDelay);
          continue;
        }

        // If not a connection error or max retries reached, throw
        throw error;
      }
    }

    throw new Error('Query failed after maximum retries');
  }

  /**
   * Get a client from the pool for transactions
   */
  async getClient(): Promise<PoolClient> {
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        return await this.pool.connect();
      } catch (error: any) {
        retries++;
        
        if (retries >= this.maxRetries) {
          throw new Error(`Failed to get database client after ${this.maxRetries} attempts: ${error}`);
        }

        console.error(`Failed to get client (attempt ${retries}), retrying...`, error.message);
        await this.sleep(this.retryDelay);
      }
    }

    throw new Error('Failed to get database client after maximum retries');
  }

  /**
   * Execute a transaction with automatic rollback on error
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if the database is connected
   */
  isHealthy(): boolean {
    return this.isConnected;
  }

  /**
   * Get pool statistics
   */
  getPoolStats() {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
    };
  }

  /**
   * Close all connections in the pool
   */
  async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      console.log('Database connection pool closed');
    } catch (error) {
      console.error('Error closing database connection pool:', error);
      throw error;
    }
  }

  /**
   * Check if an error is a connection-related error
   */
  private isConnectionError(error: any): boolean {
    const connectionErrorCodes = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNRESET',
      '57P01', // PostgreSQL: terminating connection due to administrator command
      '57P02', // PostgreSQL: terminating connection due to crash
      '57P03', // PostgreSQL: cannot connect now
      '08000', // PostgreSQL: connection exception
      '08003', // PostgreSQL: connection does not exist
      '08006', // PostgreSQL: connection failure
    ];

    return (
      connectionErrorCodes.includes(error.code) ||
      error.message?.includes('connection') ||
      error.message?.includes('Connection')
    );
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const db = new Database();

// Export types
export type { PoolClient };
