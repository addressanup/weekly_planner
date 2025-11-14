# Weekly Planner API Documentation

Base URL: `http://localhost:3000` (Development)

## Table of Contents
- [Authentication](#authentication)
- [Tasks](#tasks)
- [Weeks](#weeks)
- [Error Handling](#error-handling)

---

## Authentication

All authenticated endpoints require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### Register

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Validation Rules:**
- `email`: Valid email format
- `password`: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- `name`: Minimum 2 characters, maximum 100 characters

**Success Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": null,
    "createdAt": "2024-11-14T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `409 Conflict`: User with this email already exists
- `400 Bad Request`: Validation errors

---

### Login

Authenticate existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "createdAt": "2024-11-14T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials

---

### Get Profile

Get current user's profile.

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "name": "John Doe",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2024-11-14T10:00:00.000Z",
  "updatedAt": "2024-11-14T12:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: User not found

---

### Update Profile

Update current user's profile.

**Endpoint:** `PATCH /auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**Success Response (200 OK):**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "name": "Jane Doe",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "createdAt": "2024-11-14T10:00:00.000Z",
  "updatedAt": "2024-11-14T13:00:00.000Z"
}
```

---

### Logout

Invalidate current session.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Tasks

### Create Task

Create a new task.

**Endpoint:** `POST /tasks`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Complete project proposal",
  "category": "WORK",
  "energy": "HIGH",
  "durationMinutes": 90,
  "notes": "Include budget and timeline sections",
  "targetOccurrencesPerWeek": 1,
  "dayId": "day-uuid-here",
  "swimlane": "FOCUS"
}
```

**Field Options:**
- `category`: WORK, HEALTH, PERSONAL, LEARNING, ADMIN
- `energy`: HIGH, MEDIUM, LOW
- `swimlane`: FOCUS, COLLABORATION, SELF_CARE, LIFE_ADMIN
- `durationMinutes`: 5-480 (5 minutes to 8 hours)

**Success Response (201 Created):**
```json
{
  "id": "task-uuid-here",
  "userId": "user-uuid",
  "title": "Complete project proposal",
  "category": "WORK",
  "energy": "HIGH",
  "status": "PLANNED",
  "durationMinutes": 90,
  "notes": "Include budget and timeline sections",
  "targetOccurrencesPerWeek": 1,
  "dayId": "day-uuid-here",
  "swimlane": "FOCUS",
  "order": 0,
  "completedAt": null,
  "createdAt": "2024-11-14T10:00:00.000Z",
  "updatedAt": "2024-11-14T10:00:00.000Z"
}
```

---

### Get All Tasks

Get all tasks for the current user.

**Endpoint:** `GET /tasks`

**Query Parameters:**
- `dayId` (optional): Filter tasks by day
- `swimlane` (optional): Filter tasks by swimlane (FOCUS, COLLABORATION, SELF_CARE, LIFE_ADMIN)
- `unassigned` (optional): Set to "true" to get only unassigned tasks (backlog)

**Examples:**
```
GET /tasks                      # All tasks
GET /tasks?dayId=day-uuid       # Tasks for specific day
GET /tasks?swimlane=FOCUS       # Tasks in FOCUS swimlane
GET /tasks?unassigned=true      # Backlog tasks
```

**Success Response (200 OK):**
```json
[
  {
    "id": "task-1",
    "title": "Morning workout",
    "category": "HEALTH",
    "energy": "HIGH",
    "status": "COMPLETED",
    "durationMinutes": 45,
    "completedAt": "2024-11-14T07:30:00.000Z",
    ...
  },
  {
    "id": "task-2",
    "title": "Code review",
    "category": "WORK",
    "energy": "MEDIUM",
    "status": "IN_PROGRESS",
    "durationMinutes": 60,
    ...
  }
]
```

---

### Get Task Statistics

Get task completion statistics.

**Endpoint:** `GET /tasks/statistics`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "total": 25,
  "completed": 18,
  "inProgress": 3,
  "planned": 3,
  "skipped": 1,
  "completionRate": 72
}
```

---

### Get Single Task

Get a specific task by ID.

**Endpoint:** `GET /tasks/:id`

**Success Response (200 OK):**
```json
{
  "id": "task-uuid",
  "title": "Complete project proposal",
  "category": "WORK",
  "energy": "HIGH",
  "status": "PLANNED",
  ...
}
```

**Error Responses:**
- `404 Not Found`: Task does not exist
- `403 Forbidden`: Task belongs to another user

---

### Update Task

Update a task.

**Endpoint:** `PATCH /tasks/:id`

**Request Body:**
```json
{
  "status": "COMPLETED",
  "notes": "Updated notes"
}
```

**Status Options:** PLANNED, IN_PROGRESS, COMPLETED, SKIPPED

**Success Response (200 OK):**
```json
{
  "id": "task-uuid",
  "status": "COMPLETED",
  "completedAt": "2024-11-14T15:30:00.000Z",
  ...
}
```

---

### Assign Task to Swimlane

Assign a task to a specific swimlane and day.

**Endpoint:** `PATCH /tasks/:id/assign`

**Request Body:**
```json
{
  "swimlane": "FOCUS",
  "dayId": "day-uuid",
  "order": 2
}
```

**Success Response (200 OK):**
```json
{
  "id": "task-uuid",
  "swimlane": "FOCUS",
  "dayId": "day-uuid",
  "order": 2,
  ...
}
```

---

### Reorder Task

Change task position within its swimlane.

**Endpoint:** `PATCH /tasks/:id/reorder`

**Request Body:**
```json
{
  "position": 3
}
```

**Success Response (200 OK):**
```json
{
  "id": "task-uuid",
  "order": 3,
  ...
}
```

**Error Responses:**
- `400 Bad Request`: Position must be non-negative

---

### Delete Task

Delete a task.

**Endpoint:** `DELETE /tasks/:id`

**Success Response:** `204 No Content`

**Error Responses:**
- `404 Not Found`: Task does not exist
- `403 Forbidden`: Task belongs to another user

---

## Weeks

### Create Week

Create a new week with automatically generated days.

**Endpoint:** `POST /weeks`

**Request Body:**
```json
{
  "startDate": "2024-11-11",
  "endDate": "2024-11-17",
  "theme": "Focus on Product Launch"
}
```

**Success Response (201 Created):**
```json
{
  "id": "week-uuid",
  "userId": "user-uuid",
  "weekNumber": 202446,
  "startDate": "2024-11-11T00:00:00.000Z",
  "endDate": "2024-11-17T23:59:59.999Z",
  "theme": "Focus on Product Launch",
  "reflection": null,
  "isArchived": false,
  "createdAt": "2024-11-14T10:00:00.000Z",
  "updatedAt": "2024-11-14T10:00:00.000Z",
  "days": [
    {
      "id": "day-1-uuid",
      "date": "2024-11-11T00:00:00.000Z",
      "dayOfWeek": 1,
      "theme": null,
      "focusMetric": null,
      ...
    },
    // ... 6 more days
  ]
}
```

**Validation:**
- Start date must be before end date
- Automatically generates 7 days

**Error Responses:**
- `400 Bad Request`: Invalid date range

---

### Get All Weeks

Get all weeks for the current user.

**Endpoint:** `GET /weeks`

**Query Parameters:**
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Examples:**
```
GET /weeks                                      # All weeks
GET /weeks?startDate=2024-11-01&endDate=2024-11-30  # November weeks
```

**Success Response (200 OK):**
```json
[
  {
    "id": "week-1",
    "weekNumber": 202446,
    "startDate": "2024-11-11T00:00:00.000Z",
    "endDate": "2024-11-17T23:59:59.999Z",
    "theme": "Product Launch Week",
    "days": [...],
    ...
  },
  ...
]
```

---

### Get Current Week

Get the week containing today's date.

**Endpoint:** `GET /weeks/current`

**Success Response (200 OK):**
```json
{
  "id": "week-uuid",
  "weekNumber": 202446,
  "startDate": "2024-11-11T00:00:00.000Z",
  "endDate": "2024-11-17T23:59:59.999Z",
  "theme": "Current Week",
  "days": [
    {
      "id": "day-uuid",
      "date": "2024-11-14T00:00:00.000Z",
      "dayOfWeek": 4,
      "tasks": [...]
    },
    ...
  ]
}
```

**Response:** `null` if no current week exists

---

### Get Week by ID

Get a specific week.

**Endpoint:** `GET /weeks/:id`

**Success Response (200 OK):**
```json
{
  "id": "week-uuid",
  "weekNumber": 202446,
  "theme": "Product Launch",
  "days": [...],
  ...
}
```

**Error Responses:**
- `404 Not Found`: Week does not exist
- `403 Forbidden`: Week belongs to another user

---

### Get Week with Statistics

Get a week with task statistics.

**Endpoint:** `GET /weeks/:id/stats`

**Success Response (200 OK):**
```json
{
  "id": "week-uuid",
  "weekNumber": 202446,
  "theme": "Productive Week",
  "days": [...],
  "statistics": {
    "totalTasks": 35,
    "completedTasks": 28,
    "inProgressTasks": 4,
    "plannedTasks": 2,
    "totalDuration": 1560,
    "completionRate": 80
  }
}
```

---

### Update Week

Update week details.

**Endpoint:** `PATCH /weeks/:id`

**Request Body:**
```json
{
  "theme": "Updated Theme",
  "reflection": "Great week, accomplished all major goals"
}
```

**Success Response (200 OK):**
```json
{
  "id": "week-uuid",
  "theme": "Updated Theme",
  "reflection": "Great week, accomplished all major goals",
  ...
}
```

---

### Delete Week

Delete a week (cascades to days and tasks).

**Endpoint:** `DELETE /weeks/:id`

**Success Response:** `204 No Content`

**Error Responses:**
- `404 Not Found`: Week does not exist
- `403 Forbidden`: Week belongs to another user

---

### Get Day

Get a specific day by ID.

**Endpoint:** `GET /weeks/days/:dayId`

**Success Response (200 OK):**
```json
{
  "id": "day-uuid",
  "weekId": "week-uuid",
  "date": "2024-11-14T00:00:00.000Z",
  "dayOfWeek": 4,
  "theme": "Deep Work Day",
  "focusMetric": "Complete 3 major tasks",
  "tasks": [...]
}
```

---

### Update Day

Update day details.

**Endpoint:** `PATCH /weeks/days/:dayId`

**Request Body:**
```json
{
  "theme": "Deep Work Thursday",
  "focusMetric": "Ship feature X"
}
```

**Success Response (200 OK):**
```json
{
  "id": "day-uuid",
  "theme": "Deep Work Thursday",
  "focusMetric": "Ship feature X",
  ...
}
```

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200 OK`: Success
- `201 Created`: Resource created successfully
- `204 No Content`: Success with no response body
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required or token invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

### Validation Errors

Validation errors include detailed field-level messages:

```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email address",
    "password must be at least 8 characters long"
  ],
  "error": "Bad Request"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Changelog

### v1.0.0 (2024-11-14)
- Initial API release
- Authentication endpoints
- Task management CRUD
- Week and day management
- Task statistics and analytics
