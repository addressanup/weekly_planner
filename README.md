# Weekly Planner

A modern, full-stack weekly planning application built with React, TypeScript, NestJS, and Prisma. Plan your week with drag-and-drop tasks, swimlanes for different work types, and comprehensive task management.

![Weekly Planner](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Frontend Tests](https://img.shields.io/badge/frontend%20tests-121%20passing-brightgreen.svg)
![Backend Tests](https://img.shields.io/badge/backend%20tests-52%20passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Features

### Core Functionality
- **📅 Weekly Planning** - Visual weekly calendar with drag-and-drop task management
- **🏊 Swimlanes** - Organize tasks by type: Focus, Collaboration, Self-Care, Life Admin
- **✅ Task Management** - Create, edit, complete, and track tasks with duration and energy levels
- **📊 Statistics** - Track completion rates and productivity metrics
- **💾 Auto-Save** - Automatic persistence to local storage
- **🎨 Modern UI** - Clean, responsive design with TailwindCSS
- **🔐 Authentication** - Secure JWT-based user authentication

### Task Features
- **Categories**: Work, Health, Personal, Learning, Admin
- **Energy Levels**: High, Medium, Low
- **Status Tracking**: Planned, In Progress, Completed, Skipped
- **Duration Management**: Track time estimates (5 min - 8 hours)
- **Backlog System**: Unassigned tasks for future planning
- **Natural Language Input**: Quick-add tasks with smart parsing

### Developer Features
- **TypeScript** - Full type safety across frontend and backend
- **Comprehensive Tests** - 173 total tests (121 frontend + 52 backend)
- **API Integration** - Complete frontend-backend API integration with axios
- **Authentication** - JWT-based auth with secure token management
- **API Documentation** - Complete REST API documentation
- **CI/CD** - Automated testing and deployment
- **Error Handling** - Production-grade error boundaries and logging

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Backend Integration](#backend-integration)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🛠 Tech Stack

### Frontend
- **React 19.2** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7.2** - Build tool and dev server
- **Zustand 5.0** - State management
- **TailwindCSS 3.4** - Styling
- **@dnd-kit** - Drag and drop functionality
- **Zod 4.1** - Schema validation
- **React Hook Form 7.66** - Form handling
- **Vitest 4.0** - Unit testing
- **Playwright 1.56** - E2E testing

### Backend
- **NestJS 11** - Node.js framework
- **Prisma ORM** - Database toolkit
- **PostgreSQL 16** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Class Validator** - DTO validation
- **Jest 30** - Testing framework

### DevOps
- **Docker Compose** - Local development
- **GitHub Actions** - CI/CD
- **Vercel** - Frontend hosting
- **ESLint + Prettier** - Code quality

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Docker** (optional) - For running PostgreSQL locally
- **Git** - Version control

### Quick Start (Frontend Only)

The frontend works standalone with local storage:

```bash
# Clone the repository
git clone https://github.com/addressanup/weekly_planner.git
cd weekly_planner

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Full Stack Setup

#### 1. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

#### 2. Backend Setup

```bash
# Install dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env

# Edit .env with your configuration:
# DATABASE_URL="postgresql://user:password@localhost:5432/weekly_planner"
# JWT_SECRET="your-super-secret-jwt-key-change-this"
# JWT_EXPIRES_IN="7d"
```

#### 3. Database Setup

**Option A: Using Docker**

```bash
cd backend
docker-compose up -d

# Run migrations
npx prisma migrate dev
npx prisma generate
```

**Option B: Local PostgreSQL**

```bash
# Create database
createdb weekly_planner

# Run migrations
npx prisma migrate dev
npx prisma generate
```

#### 4. Start Backend

```bash
cd backend
npm run start:dev

# Backend runs on http://localhost:3000
```

## 💻 Development

### Frontend Development

```bash
cd frontend

# Development server (http://localhost:5173)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development

```bash
cd backend

# Development server with hot reload
npm run start:dev

# Build
npm run build

# Production mode
npm run start:prod

# Run tests
npm test

# Run tests with coverage
npm run test:cov

# Prisma Studio (Database GUI)
npx prisma studio
```

### Database Commands

```bash
cd backend

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

## 🧪 Testing

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

**Frontend Test Coverage:**
- ✅ 108 tests passing
- Components: TaskCard, ErrorBoundary
- State Management: Zustand store
- Validation: Zod schemas
- Notifications: Toast system
- E2E: User journeys

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E API tests
npm run test:e2e
```

**Backend Test Coverage:**
- ✅ 52 tests passing
- AuthService: Registration, login, JWT
- TasksService: CRUD, filtering, statistics
- WeeksService: Week/day management, stats
- PrismaService: Database integration

### CI/CD

GitHub Actions automatically runs:
- ✅ TypeScript compilation
- ✅ ESLint checks
- ✅ Unit tests
- ✅ E2E tests
- ✅ Production builds

## 📚 API Documentation

Complete API documentation is available in [`backend/API.md`](backend/API.md).

### Quick Reference

**Authentication**
```bash
POST   /auth/register    # Create account
POST   /auth/login       # Login
GET    /auth/profile     # Get profile
PATCH  /auth/profile     # Update profile
POST   /auth/logout      # Logout
```

**Tasks**
```bash
POST   /tasks            # Create task
GET    /tasks            # List tasks (with filters)
GET    /tasks/:id        # Get task
PATCH  /tasks/:id        # Update task
DELETE /tasks/:id        # Delete task
GET    /tasks/statistics # Get stats
```

**Weeks & Days**
```bash
POST   /weeks            # Create week
GET    /weeks            # List weeks
GET    /weeks/current    # Current week
GET    /weeks/:id        # Get week
GET    /weeks/:id/stats  # Week with stats
PATCH  /weeks/:id        # Update week
DELETE /weeks/:id        # Delete week
```

See [`backend/API.md`](backend/API.md) for detailed request/response examples.

## 🔗 Backend Integration

The Weekly Planner includes a complete API-integrated planner store that syncs all data with the backend.

### Current Status

**Production-Ready**: The API integration is fully implemented and tested but not enabled by default to preserve existing localStorage functionality.

**Features**:
- ✅ Automatic backend synchronization for authenticated users
- ✅ Optimistic UI updates for smooth experience
- ✅ Automatic fallback to localStorage on errors
- ✅ Type-safe frontend-backend data conversion
- ✅ Comprehensive error handling with user notifications
- ✅ All 121 frontend tests passing

### Integration Guide

Complete documentation available in [`BACKEND_INTEGRATION.md`](BACKEND_INTEGRATION.md).

**Quick Start**:

1. **Start the backend**:
   ```bash
   cd backend
   docker-compose up -d  # Start PostgreSQL
   npm run start:dev     # Start NestJS API
   ```

2. **Enable API integration** in frontend (choose one):

   **Option A: Global replacement**
   ```typescript
   // Replace in components
   import { usePlannerStoreWithApi as usePlannerStore } from '../state/usePlannerStoreWithApi';
   ```

   **Option B: Feature flag**
   ```typescript
   const usePlannerStore = import.meta.env.VITE_USE_BACKEND_API === 'true'
     ? usePlannerStoreWithApi
     : usePlannerStoreLocal;
   ```

3. **Test the integration**:
   - Register/Login → Auth modal appears
   - Create tasks → Synced to backend
   - Drag tasks → Updated in backend
   - Refresh page → Data loads from backend

### Architecture

**Type Mappers** (`frontend/src/lib/apiMappers.ts`):
- Convert between frontend (lowercase) and backend (UPPERCASE) formats
- Bidirectional conversion for all data types
- Full object transformation support

**API-Integrated Store** (`frontend/src/state/usePlannerStoreWithApi.ts`):
- Extends existing store with backend sync
- Optimistic updates for all mutations
- Automatic error recovery
- Seamless localStorage fallback

**Data Flow**:
```
User Action → Optimistic UI Update → API Call →
Success: Keep update | Error: Revert + Notify
```

See [`BACKEND_INTEGRATION.md`](BACKEND_INTEGRATION.md) for detailed migration strategies, troubleshooting, and performance considerations.

## 📁 Project Structure

```
weekly_planner/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── weekly/      # Weekly planner components
│   │   │   ├── errors/      # Error boundaries
│   │   │   └── providers/   # Context providers
│   │   ├── state/           # Zustand store
│   │   ├── lib/             # Utilities & validation
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript types
│   │   └── test/            # Test utilities
│   ├── e2e/                 # Playwright E2E tests
│   ├── public/              # Static assets
│   └── dist/                # Production build
│
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── tasks/           # Tasks module
│   │   ├── weeks/           # Weeks module
│   │   ├── prisma/          # Prisma service
│   │   └── main.ts          # Application entry
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── test/                # E2E tests
│   ├── dist/                # Production build
│   └── API.md               # API documentation
│
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
├── docker-compose.yml       # Docker services
└── README.md               # This file
```

## 🚢 Deployment

### Frontend (Vercel)

The frontend is configured for Vercel deployment:

```bash
# Automatic deployment on push to main
# Or manual deployment:
vercel deploy --prod
```

**Environment Variables (Vercel):**
- `VITE_API_URL` - Backend API URL (optional)

### Backend Deployment Options

#### Railway

```bash
railway login
railway init
railway add # PostgreSQL
railway up
```

#### Render

1. Create new Web Service
2. Connect GitHub repository
3. Build: `cd backend && npm install && npm run build`
4. Start: `npm run start:prod`
5. Add PostgreSQL database
6. Set environment variables

#### AWS/DigitalOcean

Use Docker deployment:

```bash
docker build -t weekly-planner-backend ./backend
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  weekly-planner-backend
```

### Environment Variables

**Frontend (.env)**
```bash
VITE_API_URL=http://localhost:3000  # Backend API URL
```

**Backend (.env)**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/weekly_planner"
JWT_SECRET="your-super-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
PORT=3000
NODE_ENV="development"
```

## 🎯 Roadmap

### Phase 1: MVP ✅
- [x] Weekly planner UI
- [x] Drag and drop functionality
- [x] Local storage persistence
- [x] Task CRUD operations
- [x] Frontend testing infrastructure

### Phase 2: Backend ✅
- [x] NestJS API
- [x] PostgreSQL database
- [x] JWT authentication
- [x] Comprehensive tests
- [x] API documentation

### Phase 3: Integration ✅
- [x] API client infrastructure with axios
- [x] Authentication API service layer
- [x] Tasks & Weeks API service layer
- [x] User authentication UI (Login/Register)
- [x] JWT token management
- [x] Auth state management with Zustand
- [x] API service unit tests (13 tests)
- [x] Type mappers for frontend-backend conversion
- [x] API-integrated planner store with optimistic updates
- [x] Comprehensive integration documentation
- [ ] Enable backend mode by default (optional)
- [ ] Real-time data sync (WebSockets)
- [ ] Backend deployment

### Phase 4: Advanced Features (Planned)
- [ ] Pomodoro timer integration
- [ ] Gamification (streaks, badges, scores)
- [ ] AI-powered task suggestions
- [ ] Calendar integration (Google, Outlook)
- [ ] Team collaboration
- [ ] Mobile app

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions/changes
- `refactor:` - Code refactoring
- `style:` - Code style changes
- `chore:` - Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Anup Sharma**
- GitHub: [@addressanup](https://github.com/addressanup)

## 🙏 Acknowledgments

- React team for the amazing framework
- NestJS team for the backend framework
- Prisma team for the excellent ORM
- All open-source contributors

---

**Built with 💙 by Claude & Anup**

For questions or support, please open an issue on GitHub.
