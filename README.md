# Indian Culture App

A full-stack application for exploring India's rich cultural heritage through an interactive, city-based experience. Users can discover cultural facts about monuments, temples, festivals, traditions, cuisine, art forms, historical events, and local customs across Indian cities, with support for 23 languages.

## Features

- **Multi-Language Support**: 22 official Indian languages plus English
- **City Exploration**: Browse all major Indian cities with cultural content
- **Cultural Heritage**: Discover monuments, temples, festivals, traditions, cuisine, art forms, and more
- **Image Galleries**: View multiple images for each cultural heritage aspect
- **Expandable Details**: Read amazing facts with detailed historical context
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching and caching
- i18next for internationalization

### Backend
- Node.js 18+ with TypeScript
- Express.js for REST API
- PostgreSQL 15+ for database
- Joi for validation
- Winston for logging
- Node-cache for caching

### Infrastructure
- Docker & Docker Compose for containerization
- PostgreSQL database

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd indian-culture-app
```

### 2. Set Up Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start the Database

```bash
# From the root directory
npm run db:up
```

This will start a PostgreSQL container using Docker Compose.

### 4. Install Dependencies

```bash
# From the root directory
npm run install:all
```

This installs dependencies for both frontend and backend.

### 5. Run Database Migrations

```bash
cd backend
# Run migration scripts (to be implemented in task 2)
```

### 6. Start Development Servers

**Option 1: Start both frontend and backend together**
```bash
# From the root directory
npm run dev
```

**Option 2: Start separately**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Project Structure

```
indian-culture-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── i18n/            # Internationalization files
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx          # Root component
│   ├── public/              # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic services
│   │   ├── models/          # Data models
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── config/          # Configuration files
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Entry point
│   ├── migrations/          # Database migrations
│   ├── seeds/               # Database seed data
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml        # Docker services configuration
├── package.json              # Root package.json for workspace
├── .prettierrc               # Prettier configuration
├── .eslintrc.json            # ESLint configuration
├── .gitignore
└── README.md
```

## Available Scripts

### Root Directory

- `npm run install:all` - Install all dependencies
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build both frontend and backend
- `npm run test` - Run tests for both frontend and backend
- `npm run lint` - Lint both frontend and backend
- `npm run format` - Format code with Prettier
- `npm run db:up` - Start PostgreSQL database
- `npm run db:down` - Stop PostgreSQL database

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Lint code

### Backend

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Lint code

## API Documentation

The backend provides a REST API at `/api/v1` with the following endpoints:

- `GET /api/v1/cities` - Get all cities
- `GET /api/v1/cities/:cityId/heritage` - Get heritage items for a city
- `GET /api/v1/heritage/:heritageId` - Get detailed heritage information
- `GET /api/v1/heritage/:heritageId/images` - Get images for heritage item
- `GET /api/v1/languages` - Get supported languages

All endpoints support a `language` query parameter for localization.

## Database

The application uses PostgreSQL with the following main tables:

- `cities` - City information
- `heritage_items` - Cultural heritage content
- `translations` - Multi-language translations
- `images` - Image metadata
- `languages` - Supported languages

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add comments for complex logic

### Testing

- Write unit tests for services and utilities
- Write integration tests for API endpoints
- Write component tests for React components
- Aim for good test coverage

### Git Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Commit with descriptive messages
5. Create a pull request

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:
1. Ensure Docker is running
2. Check if PostgreSQL container is up: `docker ps`
3. Verify environment variables in `backend/.env`
4. Check database logs: `docker logs indian-culture-db`

### Port Conflicts

If ports 3000 or 5173 are already in use:
1. Change the port in respective `.env` files
2. Update proxy configuration in `frontend/vite.config.ts`

### Module Not Found Errors

If you encounter module errors:
1. Delete `node_modules` folders
2. Delete `package-lock.json` files
3. Run `npm run install:all` again

## Contributing

Contributions are welcome! Please follow the development guidelines and submit pull requests for any enhancements.

## License

This project is licensed under the MIT License.

## Deployment

For production deployment, see our comprehensive deployment documentation:

- **[Quick Start Deployment](./docs/QUICK_START_DEPLOYMENT.md)** - Get running in under 30 minutes
- **[Full Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Environment Variables Reference](./docs/ENVIRONMENT_VARIABLES.md)** - All configuration options
- **[Database Migration Guide](./docs/DATABASE_MIGRATION_GUIDE.md)** - Managing database changes
- **[Troubleshooting Guide](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

### Quick Production Deployment

```bash
# 1. Configure environment
cp .env.production.example .env.production
# Edit .env.production with your values

# 2. Start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# 3. Verify deployment
curl http://localhost:3000/health
curl http://localhost/health
```

See [Quick Start Deployment](./docs/QUICK_START_DEPLOYMENT.md) for detailed instructions.

## Support

For issues and questions:
- Check the [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
- Review deployment documentation
- Open an issue on the repository
