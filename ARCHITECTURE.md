# Architecture Documentation

This document provides an overview of the Weekly Planner application architecture, design decisions, and key components.

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Data Flow](#data-flow)
7. [Authentication & Authorization](#authentication--authorization)
8. [State Management](#state-management)
9. [API Design](#api-design)
10. [Database Schema](#database-schema)
11. [Security Architecture](#security-architecture)
12. [Performance Considerations](#performance-considerations)
13. [Scalability](#scalability)

---

## System Overview

The Weekly Planner is a full-stack web application designed to help users plan their weekly tasks with energy-based scheduling and swimlane organization.

### Key Features

- **Drag-and-drop** task management
- **Energy-based scheduling** (high/medium/low energy tasks)
- **Swimlane organization** (Focus, Collaboration, Self-care, Life Admin)
- **Floating task bucket** for unscheduled items
- **User authentication** with JWT
- **Real-time synchronization** with backend API
- **Offline-capable** with localStorage fallback

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **TypeScript** | 5.9.0 | Type safety |
| **Vite** | 7.2.2 | Build tool & dev server |
| **Zustand** | 5.0.2 | State management |
| **TailwindCSS** | 3.4.20 | Styling |
| **dnd-kit** | 6.3.1 | Drag-and-drop |
| **axios** | 1.9.0 | HTTP client |
| **Zod** | 4.1.0 | Schema validation |
| **Vitest** | 4.0.8 | Unit testing |
| **React Hook Form** | 7.66.0 | Form management |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | 11.0.0 | Node.js framework |
| **TypeScript** | 5.8.0 | Type safety |
| **Prisma** | 6.2.1 | ORM |
| **PostgreSQL** | 16+ | Database |
| **Passport** | 0.7.0 | Authentication |
| **JWT** | 10.2.0 | Token-based auth |
| **bcrypt** | 5.1.1 | Password hashing |
| **class-validator** | 0.15.0 | DTO validation |
| **Jest** | 29.7.0 | Unit testing |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                     React App                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  Components  │  │    Hooks     │  │   Services   │  │  │
│  │  │              │  │              │  │              │  │  │
│  │  │ • WeeklyView │  │• usePlanner  │  │ • authAPI    │  │  │
│  │  │ • TaskCards  │  │• useAuth     │  │ • tasksAPI   │  │  │
│  │  │ • DayColumns │  │• Bootstrap   │  │ • weeksAPI   │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │         State Management (Zustand)              │   │  │
│  │  │                                                  │   │  │
│  │  │  • usePlannerStore (localStorage mode)          │   │  │
│  │  │  • usePlannerStoreWithApi (API mode)            │   │  │
│  │  │  • useAuthStore (authentication state)          │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / REST API
                              │ (axios)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API LAYER                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    NestJS Backend                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ Controllers  │  │   Services   │  │   Guards     │  │  │
│  │  │              │  │              │  │              │  │  │
│  │  │ • AuthCtrl   │  │ • AuthSvc    │  │ • JwtGuard   │  │  │
│  │  │ • TasksCtrl  │  │ • TasksSvc   │  │              │  │  │
│  │  │ • WeeksCtrl  │  │ • WeeksSvc   │  │              │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ Middleware   │  │   Pipes      │  │  Filters     │  │  │
│  │  │              │  │              │  │              │  │  │
│  │  │ • CORS       │  │ • Validation │  │ • Exception  │  │  │
│  │  │ • Logging    │  │ • Transform  │  │ • HTTP       │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma ORM
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   PostgreSQL 16                         │  │
│  │                                                          │  │
│  │  Tables:                                                 │  │
│  │  • users     (authentication, profiles)                 │  │
│  │  • weeks     (weekly planning periods)                  │  │
│  │  • days      (individual days with themes)              │  │
│  │  • tasks     (planner tasks with assignments)           │  │
│  │                                                          │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Structure

```
frontend/src/
├── components/
│   ├── auth/                   # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthModal.tsx
│   ├── errors/                 # Error handling components
│   │   └── ErrorBoundary.tsx
│   ├── providers/              # Context providers
│   │   └── ToastProvider.tsx
│   └── weekly/                 # Main planner components
│       ├── WeeklyCanvas.tsx    # Main container
│       ├── WeekHeader.tsx      # Week navigation
│       ├── DayColumn.tsx       # Individual day view
│       ├── TaskCard.tsx        # Task display
│       ├── LaneColumn.tsx      # Swimlane sections
│       ├── FloatingTaskShelf.tsx
│       ├── QuickAddBar.tsx
│       └── PlannerStatusBar.tsx
├── hooks/
│   ├── usePlanner.ts           # Unified store hook
│   ├── usePlannerBootstrap.ts  # Data initialization
│   └── useToast.ts             # Toast notifications
├── state/
│   ├── usePlannerStore.ts      # localStorage store
│   ├── usePlannerStoreWithApi.ts # API-integrated store
│   └── useAuthStore.ts         # Authentication state
├── api/
│   ├── client.ts               # Axios configuration
│   ├── auth.service.ts         # Auth API calls
│   ├── tasks.service.ts        # Tasks API calls
│   └── weeks.service.ts        # Weeks API calls
├── lib/
│   ├── apiMappers.ts           # Type conversion
│   ├── time.ts                 # Date utilities
│   └── validation/             # Zod schemas
└── types/
    ├── planner.ts              # Core domain types
    ├── plannerStore.ts         # Store interfaces
    └── persistence.ts          # Persistence types
```

### Key Design Patterns

#### 1. Unified Store Pattern

**Problem**: Need to switch between localStorage and API storage based on authentication.

**Solution**: `usePlanner` hook that automatically selects the appropriate store.

```typescript
// Components use one interface
const tasks = usePlanner((state) => state.tasks);

// Hook selects store based on auth
export function usePlanner<T>(selector: (state: BasePlannerStore) => T): T {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return usePlannerStoreWithApi(selector);
  }

  return usePlannerStore(selector);
}
```

**Benefits**:
- ✅ Components don't need to know about authentication
- ✅ Easy to switch storage implementations
- ✅ Type-safe across all components
- ✅ Single source of truth for store selection

#### 2. Optimistic UI Updates

**Problem**: Need instant feedback while syncing with backend.

**Solution**: Update UI immediately, then sync with backend.

```typescript
moveTask: async ({ taskId, dayId, swimlaneId, index }) => {
  const state = get();

  // 1. Optimistic update (instant)
  set({ tasks: optimisticUpdate(state.tasks, taskId, dayId) });

  // 2. Backend sync (background)
  try {
    await tasksService.assign(taskId, { dayId, swimlane, order });
  } catch (error) {
    // 3. Revert on error
    toast.error('Failed to save task move');
    set({ tasks: state.tasks });
  }
}
```

**Benefits**:
- ✅ Instant user feedback
- ✅ Smooth UX even with slow network
- ✅ Automatic error recovery
- ✅ No blocking operations

#### 3. Type Mappers

**Problem**: Frontend uses lowercase enums (`'work'`), backend uses uppercase (`'WORK'`).

**Solution**: Bidirectional type conversion functions.

```typescript
// lib/apiMappers.ts
export function toApiCategory(category: PlannerCategory): ApiCategory {
  const map = {
    work: ApiCategory.WORK,
    health: ApiCategory.HEALTH,
    // ...
  };
  return map[category];
}

export function fromApiCategory(apiCategory: ApiCategory): PlannerCategory {
  const map = {
    [ApiCategory.WORK]: 'work',
    [ApiCategory.HEALTH]: 'health',
    // ...
  };
  return map[apiCategory];
}
```

**Benefits**:
- ✅ Single source of truth for conversions
- ✅ Type-safe at compile time
- ✅ Easy to maintain
- ✅ Prevents conversion bugs

---

## Backend Architecture

### Module Structure

```
backend/src/
├── main.ts                     # Application entry point
├── app.module.ts               # Root module
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts      # Auth endpoints
│   ├── auth.service.ts         # Auth business logic
│   ├── dto/                    # Data transfer objects
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   └── update-profile.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts   # Route protection
│   └── strategies/
│       └── jwt.strategy.ts      # JWT validation
├── tasks/
│   ├── tasks.module.ts
│   ├── tasks.controller.ts     # Task endpoints
│   ├── tasks.service.ts        # Task business logic
│   └── dto/                    # DTOs for tasks
│       ├── create-task.dto.ts
│       ├── update-task.dto.ts
│       └── assign-task.dto.ts
├── weeks/
│   ├── weeks.module.ts
│   ├── weeks.controller.ts     # Week endpoints
│   ├── weeks.service.ts        # Week business logic
│   └── dto/                    # DTOs for weeks
│       ├── create-week.dto.ts
│       └── update-day.dto.ts
└── prisma/
    ├── schema.prisma           # Database schema
    └── migrations/             # Schema migrations
```

### Key Design Patterns

#### 1. Dependency Injection

NestJS uses dependency injection for loose coupling:

```typescript
@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,  // Injected
  ) {}

  async create(userId: string, createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: { ...createTaskDto, userId },
    });
  }
}
```

**Benefits**:
- ✅ Easy to test (mock dependencies)
- ✅ Loose coupling
- ✅ Clear dependencies
- ✅ Reusable services

#### 2. DTO Validation

All input is validated using class-validator:

```typescript
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(PlannerCategory)
  category: PlannerCategory;

  @IsInt()
  @Min(1)
  durationMinutes: number;
}
```

**Benefits**:
- ✅ Type-safe validation
- ✅ Automatic error responses
- ✅ Clear API contracts
- ✅ Prevents invalid data

#### 3. Guard-Based Authorization

Routes are protected with guards:

```typescript
@Controller('tasks')
@UseGuards(JwtAuthGuard)  // All routes require auth
export class TasksController {
  @Get()
  findAll(@Request() req) {
    return this.tasksService.findAll(req.user.id);
  }
}
```

**Benefits**:
- ✅ Declarative authorization
- ✅ Reusable across routes
- ✅ Clear security boundaries
- ✅ Easy to audit

---

## Data Flow

### Authentication Flow

```
┌────────┐                           ┌────────┐                           ┌──────────┐
│ Client │                           │  API   │                           │ Database │
└───┬────┘                           └───┬────┘                           └────┬─────┘
    │                                    │                                     │
    │ POST /auth/register                │                                     │
    │ { name, email, password }          │                                     │
    ├──────────────────────────────────► │                                     │
    │                                    │                                     │
    │                                    │ Hash password (bcrypt)              │
    │                                    │                                     │
    │                                    │ INSERT INTO users                   │
    │                                    ├────────────────────────────────────►│
    │                                    │                                     │
    │                                    │ ◄───────────────────────────────────┤
    │                                    │ User created                        │
    │                                    │                                     │
    │                                    │ Generate JWT token                  │
    │                                    │ (sign with JWT_SECRET)              │
    │                                    │                                     │
    │ ◄──────────────────────────────────┤                                     │
    │ 201 { accessToken, user }          │                                     │
    │                                    │                                     │
    │ Store token in localStorage        │                                     │
    │                                    │                                     │
    │ GET /tasks                         │                                     │
    │ Authorization: Bearer <token>      │                                     │
    ├──────────────────────────────────► │                                     │
    │                                    │                                     │
    │                                    │ Verify JWT token                    │
    │                                    │ (verify signature, expiration)      │
    │                                    │                                     │
    │                                    │ SELECT * FROM tasks                 │
    │                                    │ WHERE userId = :id                  │
    │                                    ├────────────────────────────────────►│
    │                                    │                                     │
    │                                    │ ◄───────────────────────────────────┤
    │                                    │ Tasks                               │
    │                                    │                                     │
    │ ◄──────────────────────────────────┤                                     │
    │ 200 [tasks...]                     │                                     │
    │                                    │                                     │
```

### Task Creation Flow (Authenticated User)

```
┌────────┐                           ┌────────┐                           ┌──────────┐
│ Client │                           │  API   │                           │ Database │
└───┬────┘                           └───┬────┘                           └────┬─────┘
    │                                    │                                     │
    │ User creates task in UI            │                                     │
    │ (QuickAddBar)                      │                                     │
    │                                    │                                     │
    │ createFloatingTask()               │                                     │
    │ (usePlannerStoreWithApi)           │                                     │
    │                                    │                                     │
    │ 1. Optimistic update               │                                     │
    │    (add to tasks immediately)      │                                     │
    │                                    │                                     │
    │ POST /tasks                        │                                     │
    │ { title, category, energy, ... }   │                                     │
    ├──────────────────────────────────► │                                     │
    │                                    │                                     │
    │                                    │ Validate DTO                        │
    │                                    │ (class-validator)                   │
    │                                    │                                     │
    │                                    │ INSERT INTO tasks                   │
    │                                    ├────────────────────────────────────►│
    │                                    │                                     │
    │                                    │ ◄───────────────────────────────────┤
    │                                    │ Task created                        │
    │                                    │                                     │
    │ ◄──────────────────────────────────┤                                     │
    │ 201 { id, title, ... }             │                                     │
    │                                    │                                     │
    │ 2. Update optimistic task with     │                                     │
    │    real ID from backend            │                                     │
    │                                    │                                     │
    │ 3. Show success toast              │                                     │
    │                                    │                                     │
```

### Task Move Flow (Drag & Drop)

```
┌────────┐                           ┌────────┐                           ┌──────────┐
│ Client │                           │  API   │                           │ Database │
└───┬────┘                           └───┬────┘                           └────┬─────┘
    │                                    │                                     │
    │ User drags task to new day         │                                     │
    │ (WeeklyCanvas)                     │                                     │
    │                                    │                                     │
    │ moveTask()                         │                                     │
    │ (usePlannerStoreWithApi)           │                                     │
    │                                    │                                     │
    │ 1. Optimistic update               │                                     │
    │    (move task in UI immediately)   │                                     │
    │                                    │                                     │
    │ PATCH /tasks/:id/assign            │                                     │
    │ { dayId, swimlane, order }         │                                     │
    ├──────────────────────────────────► │                                     │
    │                                    │                                     │
    │                                    │ UPDATE tasks                        │
    │                                    │ SET dayId = :dayId,                 │
    │                                    │     swimlane = :swimlane,           │
    │                                    │     order = :order                  │
    │                                    │ WHERE id = :id AND userId = :userId │
    │                                    ├────────────────────────────────────►│
    │                                    │                                     │
    │                                    │ ◄───────────────────────────────────┤
    │                                    │ Task updated                        │
    │                                    │                                     │
    │ ◄──────────────────────────────────┤                                     │
    │ 200 { id, dayId, swimlane, ... }   │                                     │
    │                                    │                                     │
    │ 2. Keep optimistic update          │                                     │
    │    (already in correct position)   │                                     │
    │                                    │                                     │
```

---

## Authentication & Authorization

### JWT Token Flow

```typescript
// 1. User Registration/Login
POST /auth/register or POST /auth/login
{
  email: "user@example.com",
  password: "securePassword123"
}

// 2. Server Response
{
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "user-uuid",
    email: "user@example.com",
    name: "John Doe"
  }
}

// 3. Client stores token
localStorage.setItem('auth_token', accessToken);

// 4. Client sends token with requests
GET /tasks
Headers: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// 5. Server validates token
- Verify signature with JWT_SECRET
- Check expiration
- Extract user ID from payload
- Attach user to request object
```

### Token Structure

```javascript
// JWT Payload
{
  sub: "user-uuid",        // Subject (user ID)
  email: "user@example.com",
  iat: 1700000000,         // Issued at
  exp: 1700604800          // Expires at (7 days later)
}
```

### Security Measures

1. **Password Hashing**: bcrypt with 10 rounds
2. **Token Expiration**: 7 days (configurable)
3. **HTTPS Only**: Production uses HTTPS
4. **CORS**: Restricts origins
5. **Input Validation**: All DTOs validated
6. **SQL Injection Protection**: Prisma parameterized queries

---

## State Management

### Store Architecture

The application uses two parallel Zustand stores that share the same interface:

#### 1. usePlannerStore (localStorage mode)

- **Purpose**: Offline-first storage
- **Use case**: Unauthenticated users
- **Storage**: Browser localStorage
- **Sync**: Synchronous operations
- **Performance**: Instant (no network calls)

#### 2. usePlannerStoreWithApi (API mode)

- **Purpose**: Backend synchronization
- **Use case**: Authenticated users
- **Storage**: PostgreSQL via REST API
- **Sync**: Asynchronous operations
- **Performance**: Optimistic updates for smooth UX

#### 3. useAuthStore

- **Purpose**: Authentication state
- **Storage**: localStorage for token
- **State**: user, isAuthenticated, isLoading, error
- **Actions**: login, logout, register, updateProfile

### State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Component Layer                           │
│                                                               │
│  Components use usePlanner() hook                            │
│  (Don't know which store is being used)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   usePlanner Hook                            │
│                                                               │
│  if (isAuthenticated) {                                      │
│    return usePlannerStoreWithApi(selector);                 │
│  } else {                                                    │
│    return usePlannerStore(selector);                        │
│  }                                                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
┌──────────────────┐         ┌──────────────────┐
│ usePlannerStore  │         │ usePlannerStore  │
│  (localStorage)  │         │   WithApi        │
│                  │         │  (backend sync)  │
│ • Sync ops       │         │ • Async ops      │
│ • No network     │         │ • Optimistic UI  │
│ • Instant        │         │ • Error handling │
└──────────────────┘         └──────────────────┘
```

---

## API Design

### REST Principles

- **Resource-based URLs**: `/tasks`, `/weeks`, `/auth`
- **HTTP Methods**: GET, POST, PATCH, DELETE
- **Status Codes**: 200, 201, 400, 401, 404, 500
- **JSON Format**: All requests/responses use JSON

### API Endpoints

#### Authentication

```
POST   /auth/register       # Create new user
POST   /auth/login          # Authenticate user
GET    /auth/profile        # Get current user
PATCH  /auth/profile        # Update user profile
POST   /auth/logout         # Logout user
```

#### Tasks

```
POST   /tasks               # Create task
GET    /tasks               # Get all user tasks
GET    /tasks/:id           # Get specific task
PATCH  /tasks/:id           # Update task
DELETE /tasks/:id           # Delete task
PATCH  /tasks/:id/assign    # Assign task to day/swimlane
GET    /tasks/day/:dayId    # Get tasks for specific day
GET    /tasks/statistics    # Get task statistics
```

#### Weeks

```
POST   /weeks               # Create week
GET    /weeks               # Get all user weeks
GET    /weeks/current       # Get current week
GET    /weeks/:id           # Get specific week
PATCH  /weeks/:id           # Update week
DELETE /weeks/:id           # Delete week
PATCH  /weeks/days/:dayId   # Update day (theme, etc.)
```

### Error Responses

```json
{
  "statusCode": 400,
  "message": ["title should not be empty", "category must be a valid enum value"],
  "error": "Bad Request"
}
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────┐
│       User          │
│─────────────────────│
│ id: UUID (PK)       │
│ email: String       │
│ password: String    │
│ name: String        │
│ createdAt: DateTime │
│ updatedAt: DateTime │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│       Week          │
│─────────────────────│
│ id: UUID (PK)       │
│ userId: UUID (FK)   │
│ startDate: Date     │
│ endDate: Date       │
│ createdAt: DateTime │
│ updatedAt: DateTime │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│        Day          │
│─────────────────────│
│ id: UUID (PK)       │
│ weekId: UUID (FK)   │
│ date: Date          │
│ theme: String?      │
│ focusMetric: String?│
│ dayOfWeek: Int      │
│ createdAt: DateTime │
│ updatedAt: DateTime │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│       Task          │
│─────────────────────│
│ id: UUID (PK)       │
│ userId: UUID (FK)   │
│ dayId: UUID? (FK)   │
│ title: String       │
│ category: Enum      │
│ energy: Enum        │
│ status: Enum        │
│ swimlane: Enum      │
│ durationMinutes: Int│
│ order: Int          │
│ createdAt: DateTime │
│ updatedAt: DateTime │
└─────────────────────┘
```

### Key Relationships

- **User ↔ Week**: One-to-Many (user owns many weeks)
- **Week ↔ Day**: One-to-Many (week contains 7 days)
- **Day ↔ Task**: One-to-Many (day has many tasks)
- **User ↔ Task**: One-to-Many (user owns many tasks)

### Indexes

```sql
-- Performance optimization indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_day_id ON tasks(day_id);
CREATE INDEX idx_weeks_user_id ON weeks(user_id);
CREATE INDEX idx_days_week_id ON days(week_id);
CREATE INDEX idx_users_email ON users(email);
```

---

## Security Architecture

### Defense in Depth

1. **Application Layer**
   - Input validation (class-validator)
   - DTO sanitization
   - Rate limiting (future)

2. **Authentication Layer**
   - JWT tokens with expiration
   - Password hashing (bcrypt)
   - Secure secret management

3. **Authorization Layer**
   - Route guards (@UseGuards)
   - User context in requests
   - Row-level security (userId checks)

4. **Database Layer**
   - Parameterized queries (Prisma)
   - Connection pooling
   - Encrypted connections (production)

5. **Network Layer**
   - HTTPS only (production)
   - CORS configuration
   - Security headers (Helmet)

### Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with expiration
- ✅ Input validation on all DTOs
- ✅ SQL injection protection (Prisma)
- ✅ CORS configured properly
- ✅ XSS protection headers
- ✅ Secure cookie flags (if using cookies)
- ✅ Environment variables for secrets
- ⚠️ Rate limiting (to be implemented)
- ⚠️ Refresh tokens (to be implemented)

---

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**
   - Vite automatic chunking
   - Lazy loading routes (future)

2. **State Optimization**
   - Zustand selective subscriptions
   - Memoization with React.memo
   - useMemo for expensive computations

3. **Network Optimization**
   - Optimistic UI updates (no loading states)
   - Request deduplication (future)
   - Response caching (future)

4. **Rendering Optimization**
   - Virtual scrolling for long lists (if needed)
   - Debounced input handlers
   - RequestAnimationFrame for drag operations

### Backend Optimization

1. **Database Optimization**
   - Indexes on foreign keys
   - Selective field fetching (Prisma select)
   - Connection pooling

2. **Query Optimization**
   - N+1 query prevention (include relations)
   - Pagination for large datasets
   - Efficient filtering

3. **Caching** (future)
   - Redis for session storage
   - Query result caching
   - CDN for static assets

---

## Scalability

### Current Architecture Limits

- **Single server**: Can handle ~1000 concurrent users
- **Single database**: Can handle ~10,000 users
- **localStorage**: Limited by browser (5-10MB)

### Scaling Options

#### Horizontal Scaling

1. **Load Balancer** (Nginx/AWS ALB)
   - Distribute traffic across multiple backend instances
   - Session sticky routing if needed

2. **Database Read Replicas**
   - Read from replicas, write to primary
   - Reduce database load

3. **CDN** (Cloudflare/CloudFront)
   - Serve static frontend assets
   - Reduce origin server load

#### Vertical Scaling

1. **Increase server resources**
   - More CPU/RAM for backend
   - Faster database instance

2. **Database optimization**
   - Connection pooling tuning
   - Query optimization
   - Materialized views

#### Future Enhancements

1. **WebSocket for real-time sync**
   - Instant updates across devices
   - Collaborative features

2. **Message Queue** (Redis/RabbitMQ)
   - Async task processing
   - Email notifications
   - Analytics processing

3. **Microservices** (if needed)
   - Separate auth service
   - Separate tasks service
   - Better scalability

---

## Monitoring and Observability

### Logging

```typescript
// NestJS built-in logger
this.logger.log('Task created', { userId, taskId });
this.logger.error('Failed to create task', error.stack);
```

### Metrics (Future)

- Request rate
- Response time
- Error rate
- Database query time
- Memory usage
- CPU usage

### Tools (Recommendations)

- **Sentry**: Error tracking
- **New Relic**: APM
- **Datadog**: Infrastructure monitoring
- **Grafana**: Visualization
- **Prometheus**: Metrics collection

---

## Testing Strategy

### Frontend Tests

1. **Unit Tests** (Vitest)
   - Components
   - Hooks
   - Utilities
   - Type mappers

2. **Integration Tests** (Future)
   - Component integration
   - API mocking
   - Store testing

3. **E2E Tests** (Future - Playwright)
   - User flows
   - Authentication
   - Task management

### Backend Tests

1. **Unit Tests** (Jest)
   - Services
   - Controllers
   - Guards
   - Pipes

2. **Integration Tests** (Future)
   - Database operations
   - API endpoints
   - Authentication flows

### Current Coverage

- Frontend: 147 tests
- Backend: 52 tests
- Total: 199 tests
- All passing ✅

---

## Future Improvements

1. **Real-time Sync** (WebSockets)
2. **Offline Support** (Service Workers)
3. **Mobile Apps** (React Native)
4. **Analytics Dashboard**
5. **Team Collaboration**
6. **Calendar Integration**
7. **Pomodoro Timer**
8. **Gamification**

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](./LICENSE) file.
