# Backend API Integration Guide

This document explains how the Weekly Planner integrates with the backend API.

## Current Status

✅ **Backend integration is ENABLED** for authenticated users as of Phase 2 completion.

The app automatically switches between modes based on authentication:
- **Authenticated users**: All data syncs with the NestJS backend API
- **Unauthenticated users**: Data persists in browser localStorage

## Overview

The Weekly Planner supports two modes of operation:

1. **Local Storage Mode**: Uses browser localStorage for persistence (unauthenticated users)
2. **Backend API Mode**: Syncs all data with the NestJS backend API (authenticated users)

## Architecture

### Type Mappers

**File**: `frontend/src/lib/apiMappers.ts`

Converts between frontend and backend data formats:
- Frontend uses lowercase string literals (`'work'`, `'high'`, `'planned'`)
- Backend uses uppercase enums (`'WORK'`, `'HIGH'`, `'PLANNED'`)

Key functions:
- `toApiCategory()`, `fromApiCategory()` - Category conversion
- `toApiEnergy()`, `fromApiEnergy()` - Energy level conversion
- `toApiStatus()`, `fromApiStatus()` - Status conversion
- `toApiSwimlane()`, `fromApiSwimlane()` - Swimlane conversion
- `taskFromApi()`, `taskToApiCreate()` - Full task conversion
- `weekFromApi()` - Week conversion

### API-Integrated Planner Store

**File**: `frontend/src/state/usePlannerStoreWithApi.ts`

Enhanced Zustand store with backend synchronization:

#### New Features

**Loading States**:
```typescript
const { isLoading, error } = usePlannerStoreWithApi();
```

**Backend Persistence**:
- `loadCurrentWeekFromApi()` - Loads week and tasks from backend
- All mutations automatically sync with backend
- Optimistic updates for smooth UX
- Automatic fallback to localStorage on errors

**Enhanced Methods**:
- `setTheme()` - Now syncs theme changes to backend
- `setFocusMetric()` - Syncs focus metrics to backend
- `moveTask()` - Syncs drag-and-drop changes
- `createFloatingTask()` - Creates tasks in backend, returns backend ID
- `scheduleFloatingTask()` - Syncs task scheduling
- `unscheduleTask()` - Syncs task unscheduling
- `updateTaskStatus()` - New method for status updates
- `deleteTask()` - New method for task deletion

#### Data Flow

1. **On App Init**:
   ```
   User authenticated → loadCurrentWeekFromApi() →
   Fetch current week (or create) → Fetch all tasks →
   Separate assigned/floating → Update state
   ```

2. **On Task Creation**:
   ```
   User creates task → Optimistic UI update →
   API call → Replace temp ID with backend ID
   ```

3. **On Task Move**:
   ```
   User drags task → Optimistic UI update →
   API call → On error: revert
   ```

4. **On Week Navigation**:
   ```
   User clicks next/prev → Update active week →
   loadCurrentWeekFromApi() → Fetch data
   ```

## How Backend Mode is Enabled

✅ **Already Implemented**: The app uses a unified `usePlanner` hook that automatically selects the appropriate store.

### Implementation Details

The `usePlanner` hook (`frontend/src/hooks/usePlanner.ts`) provides a seamless interface:

```typescript
// Components use the unified hook
import { usePlanner } from '../../hooks/usePlanner';

export const MyComponent = () => {
  const tasks = usePlanner((state) => state.tasks);
  const createTask = usePlanner((state) => state.createFloatingTask);
  // ... component logic
};
```

### Automatic Store Selection

The hook automatically selects the right store:

```typescript
export function usePlanner<T>(selector: (state: PlannerState) => T): T {
  const { isAuthenticated } = useAuthStore();

  // Authenticated: use API-integrated store
  if (isAuthenticated) {
    return usePlannerStoreWithApi(selector);
  }

  // Unauthenticated: use localStorage store
  return usePlannerStore(selector);
}
```

### Bootstrap Logic

The `usePlannerBootstrap` hook loads data based on authentication:

```typescript
// frontend/src/hooks/usePlannerBootstrap.ts
useEffect(() => {
  if (!authInitialized) return;

  if (isAuthenticated && !apiIsHydrated) {
    // Load from backend API
    void apiLoadWeek();
  } else if (!isAuthenticated && !localIsHydrated) {
    // Load from localStorage
    void localLoadSnapshot();
  }
}, [isAuthenticated, authInitialized, ...]);
```

## API Requirements

### Backend Must Be Running

The backend API must be accessible at the URL specified in `VITE_API_URL` (default: `http://localhost:3000`).

### Authentication Required

All API operations require a valid JWT token. The token is automatically injected by the API client from localStorage (`auth_token` key).

### CORS Configuration

Ensure backend CORS settings allow requests from the frontend origin.

## Error Handling

The API-integrated store includes comprehensive error handling:

### Automatic Fallbacks

- **Load Error**: Falls back to localStorage if backend unavailable
- **Save Error**: Shows toast notification, reverts optimistic update
- **Network Error**: Retains local state, allows offline work

### User Notifications

All errors show user-friendly toast notifications using `react-hot-toast`:
- ❌ "Failed to save task move"
- ❌ "Failed to load planning data"
- ❌ "Failed to save task"

### Error State

```typescript
const { error, isLoading } = usePlannerStoreWithApi();

if (error) {
  return <ErrorMessage message={error} />;
}

if (isLoading) {
  return <LoadingSpinner />;
}
```

## Testing

### Unit Tests

The API integration uses mocked API calls in tests. To test with real API:

```bash
# Start backend
cd backend && npm run start:dev

# Start frontend with API enabled
cd frontend && VITE_USE_BACKEND_API=true npm run dev
```

### Manual Testing Checklist

- [ ] Load week from backend on app start
- [ ] Create new task (check backend receives correct format)
- [ ] Drag task to different day/swimlane (verify sync)
- [ ] Update task status (check backend update)
- [ ] Delete task (verify removal from backend)
- [ ] Navigate between weeks (verify data loads)
- [ ] Test offline behavior (disconnect network)
- [ ] Test error recovery (stop backend mid-operation)

## Performance Considerations

### Optimistic Updates

All mutations update the UI immediately before API calls complete, providing instant feedback.

### Batching

Currently, each action triggers an individual API call. Future optimization could batch related operations.

### Caching

Week and task data is cached in Zustand state. No additional caching layer is implemented.

## Migration Path

### Phase 1: Infrastructure ✅

- API client infrastructure
- Authentication flow
- API service layer
- Type mappers
- API-integrated store (parallel implementation)

### Phase 2: Integration ✅

1. ✅ Created unified `usePlanner` hook that selects store based on authentication
2. ✅ Updated all components to use unified hook
3. ✅ Updated `usePlannerBootstrap` to load from API when authenticated
4. ✅ Backend integration now enabled by default for authenticated users
5. ✅ Loading spinners already implemented in `App.tsx`
6. ✅ All tests passing (173 total: 121 frontend + 52 backend)

**Status**: Backend synchronization is now fully enabled for authenticated users. The app automatically switches between localStorage mode (unauthenticated) and backend API mode (authenticated).

### Phase 3: Optimization (Future)

1. Add request batching
2. Implement optimistic reconciliation
3. Add offline queue for failed requests
4. Implement real-time sync with WebSockets

## Troubleshooting

### "Failed to load planning data"

**Cause**: Backend not running or CORS error

**Solution**:
```bash
# Check backend is running
curl http://localhost:3000/health

# Check CORS configuration in backend/.env
CORS_ORIGIN=http://localhost:5173
```

### Tasks not syncing

**Cause**: Authentication token expired or invalid

**Solution**: Check browser console for 401 errors. Log out and log back in.

### Optimistic updates reverting

**Cause**: Backend validation failed or network error

**Solution**: Check browser console for specific error. Update data to match backend validation rules.

## Related Files

- `frontend/src/api/` - API client and services
- `frontend/src/lib/apiMappers.ts` - Type conversion utilities
- `frontend/src/state/usePlannerStoreWithApi.ts` - API-integrated store
- `frontend/src/state/useAuthStore.ts` - Authentication state
- `backend/API.md` - Backend API documentation

## Future Enhancements

- **Real-time Sync**: WebSocket support for multi-device sync
- **Conflict Resolution**: Handle concurrent edits
- **Offline Mode**: Queue operations when offline
- **Request Batching**: Combine multiple operations
- **Optimistic Reconciliation**: Smart merge of local/remote changes
- **Undo/Redo**: History management with backend sync
