import { Pool } from 'pg';
import { db } from './database';

// Mock pg Pool
jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
    totalCount: 10,
    idleCount: 5,
    waitingCount: 0,
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('Database Connection Module', () => {
  let mockPool: any;

  beforeEach(() => {
    // Get the mocked pool instance
    mockPool = new Pool();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should successfully connect to database', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      await db.initialize();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('SELECT NOW()');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should retry on connection failure and eventually succeed', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };

      // Fail twice, then succeed
      mockPool.connect
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockResolvedValueOnce(mockClient);

      await db.initialize();

      expect(mockPool.connect).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      mockPool.connect.mockRejectedValue(new Error('Connection refused'));

      await expect(db.initialize()).rejects.toThrow(
        'Failed to connect to database after 3 attempts'
      );

      expect(mockPool.connect).toHaveBeenCalledTimes(3);
    });
  });

  describe('query', () => {
    it('should execute query successfully', async () => {
      const mockResult = { rows: [{ id: 1, name: 'Test' }] };
      mockPool.query.mockResolvedValue(mockResult);

      const result = await db.query('SELECT * FROM test WHERE id = $1', [1]);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test WHERE id = $1', [1]);
      expect(result).toEqual(mockResult.rows);
    });

    it('should retry on connection error', async () => {
      const connectionError = new Error('Connection lost');
      (connectionError as any).code = 'ECONNRESET';

      const mockResult = { rows: [{ id: 1 }] };

      mockPool.query
        .mockRejectedValueOnce(connectionError)
        .mockResolvedValueOnce(mockResult);

      const result = await db.query('SELECT * FROM test');

      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResult.rows);
    });

    it('should throw non-connection errors immediately', async () => {
      const syntaxError = new Error('Syntax error');
      (syntaxError as any).code = '42601';

      mockPool.query.mockRejectedValue(syntaxError);

      await expect(db.query('SELECT * FORM test')).rejects.toThrow('Syntax error');

      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries on connection errors', async () => {
      const connectionError = new Error('Connection timeout');
      (connectionError as any).code = 'ETIMEDOUT';

      mockPool.query.mockRejectedValue(connectionError);

      await expect(db.query('SELECT * FROM test')).rejects.toThrow(
        'Query failed after maximum retries'
      );

      expect(mockPool.query).toHaveBeenCalledTimes(3);
    });
  });

  describe('getClient', () => {
    it('should return a client from the pool', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const client = await db.getClient();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(client).toBe(mockClient);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      mockPool.connect
        .mockRejectedValueOnce(new Error('Pool exhausted'))
        .mockResolvedValueOnce(mockClient);

      const client = await db.getClient();

      expect(mockPool.connect).toHaveBeenCalledTimes(2);
      expect(client).toBe(mockClient);
    });

    it('should throw after max retries', async () => {
      mockPool.connect.mockRejectedValue(new Error('Pool exhausted'));

      await expect(db.getClient()).rejects.toThrow(
        'Failed to get database client after 3 attempts'
      );

      expect(mockPool.connect).toHaveBeenCalledTimes(3);
    });
  });

  describe('transaction', () => {
    it('should execute transaction and commit on success', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const callback = jest.fn().mockResolvedValue('success');

      const result = await db.transaction(callback);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(callback).toHaveBeenCalledWith(mockClient);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toBe('success');
    });

    it('should rollback transaction on error', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const error = new Error('Transaction failed');
      const callback = jest.fn().mockRejectedValue(error);

      await expect(db.transaction(callback)).rejects.toThrow('Transaction failed');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(callback).toHaveBeenCalledWith(mockClient);
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release client even if rollback fails', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockRejectedValueOnce(new Error('Rollback failed')), // ROLLBACK
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const callback = jest.fn().mockRejectedValue(new Error('Transaction failed'));

      await expect(db.transaction(callback)).rejects.toThrow();

      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('isHealthy', () => {
    it('should return connection status', () => {
      // Initially false until initialized
      expect(typeof db.isHealthy()).toBe('boolean');
    });
  });

  describe('getPoolStats', () => {
    it('should return pool statistics', () => {
      const stats = db.getPoolStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('idle');
      expect(stats).toHaveProperty('waiting');
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.idle).toBe('number');
      expect(typeof stats.waiting).toBe('number');
    });
  });

  describe('close', () => {
    it('should close the connection pool', async () => {
      mockPool.end.mockResolvedValue(undefined);

      await db.close();

      expect(mockPool.end).toHaveBeenCalled();
    });

    it('should throw error if closing fails', async () => {
      const error = new Error('Failed to close');
      mockPool.end.mockRejectedValue(error);

      await expect(db.close()).rejects.toThrow('Failed to close');
    });
  });
});
