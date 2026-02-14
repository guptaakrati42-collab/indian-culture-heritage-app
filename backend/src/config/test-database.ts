// Mock Database for Testing
// This provides a mock database that doesn't require PostgreSQL

export interface MockDatabase {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
  connect: () => Promise<MockClient>;
  end: () => Promise<void>;
}

export interface MockClient {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
  release: () => void;
}

// Mock data for testing
const mockLanguages = [
  { code: 'en', native_name: 'English', english_name: 'English', is_active: true },
  { code: 'hi', native_name: 'हिन्दी', english_name: 'Hindi', is_active: true },
  { code: 'ta', native_name: 'தமிழ்', english_name: 'Tamil', is_active: true },
  // Add more languages as needed for tests
];

const mockCities = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    slug: 'mumbai',
    state: 'Maharashtra',
    region: 'West',
    preview_image_url: 'https://example.com/mumbai.jpg'
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    slug: 'delhi',
    state: 'Delhi',
    region: 'North',
    preview_image_url: 'https://example.com/delhi.jpg'
  }
];

const mockTranslations = [
  {
    entity_type: 'city',
    entity_id: '123e4567-e89b-12d3-a456-426614174000',
    language_code: 'en',
    field_name: 'name',
    content: 'Mumbai'
  },
  {
    entity_type: 'city',
    entity_id: '123e4567-e89b-12d3-a456-426614174000',
    language_code: 'hi',
    field_name: 'name',
    content: 'मुंबई'
  },
  {
    entity_type: 'city',
    entity_id: '123e4567-e89b-12d3-a456-426614174001',
    language_code: 'en',
    field_name: 'name',
    content: 'Delhi'
  }
];

const mockHeritageItems = [
  {
    id: '223e4567-e89b-12d3-a456-426614174000',
    city_id: '123e4567-e89b-12d3-a456-426614174000',
    category: 'monuments',
    historical_period: '19th century',
    thumbnail_image_url: 'https://example.com/heritage1.jpg'
  }
];

const mockImages = [
  {
    id: '323e4567-e89b-12d3-a456-426614174000',
    heritage_id: '223e4567-e89b-12d3-a456-426614174000',
    url: 'https://example.com/image1.jpg',
    thumbnail_url: 'https://example.com/thumb1.jpg',
    display_order: 1
  }
];

class MockClient implements MockClient {
  async query(text: string, params: any[] = []): Promise<{ rows: any[] }> {
    // Simple query parsing for common test queries
    const queryLower = text.toLowerCase();
    
    if (queryLower.includes('select 1')) {
      return { rows: [{ '?column?': 1 }] };
    }
    
    if (queryLower.includes('from languages')) {
      return { rows: mockLanguages };
    }
    
    if (queryLower.includes('from cities')) {
      let results = mockCities;
      
      // Apply filters based on parameters
      if (params && params.length > 0) {
        // Simple filtering logic for tests
        if (queryLower.includes('where')) {
          // This is a simplified filter - in real tests you'd want more sophisticated parsing
          results = mockCities.filter(city => 
            params.some(param => 
              city.state.toLowerCase().includes(param?.toLowerCase?.() || '') ||
              city.region.toLowerCase().includes(param?.toLowerCase?.() || '')
            )
          );
        }
      }
      
      return { rows: results };
    }
    
    if (queryLower.includes('from translations')) {
      let results = mockTranslations;
      
      if (params && params.length > 0) {
        results = mockTranslations.filter(translation => {
          return params.some(param => 
            translation.entity_id === param ||
            translation.language_code === param ||
            translation.entity_type === param ||
            translation.field_name === param
          );
        });
      }
      
      return { rows: results };
    }
    
    if (queryLower.includes('from heritage_items')) {
      return { rows: mockHeritageItems };
    }
    
    if (queryLower.includes('from images')) {
      return { rows: mockImages };
    }
    
    // Default empty result for unknown queries
    return { rows: [] };
  }
  
  release(): void {
    // Mock release - no-op
  }
}

class MockDatabase implements MockDatabase {
  async query(text: string, params?: any[]): Promise<{ rows: any[] }> {
    const client = new MockClient();
    return client.query(text, params);
  }
  
  async connect(): Promise<MockClient> {
    return new MockClient();
  }
  
  async end(): Promise<void> {
    // Mock end - no-op
  }
}

// Create and export the mock database instance
export const createMockDatabase = (): MockDatabase => {
  return new MockDatabase();
};

// Mock pool for tests
export const createMockPool = () => {
  const mockDb = createMockDatabase();
  
  return {
    connect: () => mockDb.connect(),
    query: (text: string, params?: any[]) => mockDb.query(text, params),
    end: () => mockDb.end(),
    totalCount: 10,
    idleCount: 8,
    waitingCount: 0
  };
};