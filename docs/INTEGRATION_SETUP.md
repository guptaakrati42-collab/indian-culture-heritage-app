# End-to-End Integration Setup Guide

This guide explains how the frontend and backend are wired together and how to verify the integration.

## Architecture Overview

```
Frontend (React + Vite)          Backend (Express + TypeScript)
Port: 5173                       Port: 3000
│                                │
├─ API Client                    ├─ CORS Configuration
│  └─ Axios Instance             │  └─ Allows localhost:5173
│     └─ Base URL: localhost:3000│
│                                │
├─ Language Context              ├─ Language Middleware
│  └─ Sets Accept-Language       │  └─ Extracts language from query/header
│                                │
└─ React Query                   └─ REST API Endpoints
   └─ Caching & State            └─ /api/v1/*
```

## Configuration

### Backend Configuration

**File: `backend/.env`**
```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_NAME=indian_culture
DB_USER=postgres
DB_PASSWORD=postgres
```

**CORS Setup: `backend/src/config/cors.ts`**
- Allows requests from `http://localhost:5173`
- Supports credentials
- Allows standard HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
- Allows headers: Content-Type, Authorization, Accept-Language

### Frontend Configuration

**File: `frontend/.env`**
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_DEFAULT_LANGUAGE=en
```

**API Client: `frontend/src/services/apiClient.ts`**
- Axios instance configured with base URL
- Request interceptor adds language parameter to all requests
- Response interceptor handles errors consistently
- Singleton pattern for shared state

## API Endpoints

All endpoints are prefixed with `/api/v1`

### 1. Health Check
```
GET /health
Response: { status: "ok", timestamp: "...", database: {...} }
```

### 2. Languages
```
GET /api/v1/languages
Response: { languages: [...] }
```

### 3. Cities
```
GET /api/v1/cities?language={lang}&state={state}&region={region}&search={term}
Response: { cities: [...] }
```

### 4. City Heritage
```
GET /api/v1/cities/:cityId/heritage?language={lang}&category={category}
Response: { city: {...}, heritageItems: [...] }
```

### 5. Heritage Details
```
GET /api/v1/heritage/:heritageId?language={lang}
Response: { id, name, category, summary, detailedDescription, ... }
```

### 6. Heritage Images
```
GET /api/v1/heritage/:heritageId/images
Response: { images: [...] }
```

## Language Switching

### How It Works

1. **Frontend**: User selects language in LanguageSelector component
2. **Context**: Language is stored in LanguageContext and localStorage
3. **API Client**: Language is added to all API requests as query parameter
4. **Backend**: Language middleware extracts language from request
5. **Database**: Translations are fetched based on language code
6. **Fallback**: If translation not found, falls back to English

### Supported Languages

All 23 languages (22 Indian + English):
- English (en)
- Hindi (hi)
- Bengali (bn)
- Telugu (te)
- Marathi (mr)
- Tamil (ta)
- Gujarati (gu)
- Kannada (kn)
- Malayalam (ml)
- Odia (or)
- Punjabi (pa)
- Assamese (as)
- Kashmiri (ks)
- Konkani (kok)
- Manipuri (mni)
- Nepali (ne)
- Sanskrit (sa)
- Sindhi (sd)
- Urdu (ur)
- Bodo (brx)
- Santhali (sat)
- Maithili (mai)
- Dogri (doi)

## Error Handling

### Frontend Error Handling

1. **Network Errors**: Caught by API client, displayed with NetworkError component
2. **404 Errors**: Displayed with NotFound component
3. **Generic Errors**: Caught by ErrorBoundary, displayed with GenericError component
4. **React Query**: Automatic retry logic with exponential backoff

### Backend Error Handling

1. **Validation Errors**: Joi validation returns 400 with error details
2. **Not Found**: Returns 404 with error message
3. **Server Errors**: Returns 500 with generic error message (details logged)
4. **CORS Errors**: Returns 403 if origin not allowed

## Testing Integration

### Manual Verification

Run the verification script:

**Windows (PowerShell):**
```powershell
.\scripts\verify-integration.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/verify-integration.sh
./scripts/verify-integration.sh
```

### Automated Tests

**Backend Integration Tests:**
```bash
cd backend
npm test -- integration.test.ts
```

**Frontend Integration Tests:**
```bash
cd frontend
npm test -- apiClient.integration.test.ts
```

**Note**: Backend must be running for frontend integration tests to work.

## Starting the Application

### 1. Start Database
```bash
docker-compose up -d
```

### 2. Initialize Database
```bash
cd backend
npm run db:init
npm run db:seed
```

### 3. Start Backend
```bash
cd backend
npm run dev
```

Backend will start on http://localhost:3000

### 4. Start Frontend
```bash
cd frontend
npm run dev
```

Frontend will start on http://localhost:5173

## Verification Checklist

- [ ] Backend health check returns 200
- [ ] Frontend can fetch languages
- [ ] Frontend can fetch cities in English
- [ ] Frontend can fetch cities in Hindi
- [ ] Language switching updates all content
- [ ] City selection loads heritage items
- [ ] Heritage card expansion loads details
- [ ] Image gallery displays images
- [ ] Error handling works for invalid IDs
- [ ] CORS headers are present
- [ ] Network errors display user-friendly messages

## Common Issues

### Issue: CORS Error

**Symptom**: Browser console shows "CORS policy" error

**Solution**:
1. Check backend `.env` has correct `CORS_ORIGIN`
2. Verify frontend is running on port 5173
3. Restart backend after changing CORS config

### Issue: Network Error

**Symptom**: Frontend shows "Network error. Please check your connection."

**Solution**:
1. Verify backend is running on port 3000
2. Check `VITE_API_BASE_URL` in frontend `.env`
3. Test backend health endpoint: `curl http://localhost:3000/health`

### Issue: Language Not Switching

**Symptom**: Content stays in English when switching languages

**Solution**:
1. Verify database has translations for selected language
2. Check browser console for API errors
3. Verify language code is valid (2-3 letter code)

### Issue: Images Not Loading

**Symptom**: Placeholder images shown instead of actual images

**Solution**:
1. Check `IMAGE_BASE_URL` in backend `.env`
2. Verify image URLs in database are correct
3. Check browser console for 404 errors

## Performance Considerations

### Caching

**Frontend (React Query)**:
- Cities: 5 minute stale time
- Heritage: 10 minute stale time
- Languages: Cached indefinitely

**Backend (Node-cache)**:
- TTL: 15 minutes
- Cached: City lists, language lists
- Invalidated: On data updates

### Optimization

1. **Lazy Loading**: Images load only when visible
2. **Code Splitting**: Routes loaded on demand
3. **Compression**: API responses compressed with gzip
4. **CDN**: Images served from CDN (when configured)

## Security

### CORS

- Only allows requests from configured origins
- Credentials support enabled for future authentication
- Preflight requests handled correctly

### Input Validation

- All API inputs validated with Joi schemas
- SQL injection prevented with parameterized queries
- XSS prevented with proper escaping

### Headers

- Helmet.js adds security headers
- Content-Type validation
- Rate limiting (to be implemented)

## Next Steps

After verifying integration:

1. Deploy to staging environment
2. Run end-to-end tests in staging
3. Performance testing with load
4. Security audit
5. Production deployment

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in `backend/logs/`
3. Check browser console for frontend errors
4. Review API responses in Network tab
