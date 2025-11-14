# Backend API Integration Guide

This document explains how the Weekly Planner integrates with the backend API and how to enable full backend persistence.

## Overview

The Weekly Planner now supports two modes of operation:

1. **Local Storage Mode** (Current Default): Uses browser localStorage for persistence
2. **Backend API Mode**: Syncs all data with the NestJS backend API

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

## Switching to Backend Mode

### Option 1: Replace Existing Store

To enable backend persistence app-wide:

1. **Update imports** in components:
   ```typescript
   // Before
   import { usePlannerStore } from '../state/usePlannerStore';

   // After
   import { usePlannerStoreWithApi as usePlannerStore } from '../state/usePlannerStoreWithApi';
   ```

2. **Update hook initialization**:
   ```typescript
   // In hooks/usePlannerBootstrap.ts or similar
   const { loadInitialSnapshot, loadCurrentWeekFromApi } = usePlannerStore();

   useEffect(() => {
     if (isAuthenticated) {
       loadCurrentWeekFromApi();
     } else {
       loadInitialSnapshot();
     }
   }, [isAuthenticated]);
   ```

### Option 2: Feature Flag

Create a configuration option to switch between modes:

```typescript
// config.ts
export const USE_BACKEND_API = import.meta.env.VITE_USE_BACKEND_API === 'true';

// In components
const usePlannerStore = USE_BACKEND_API
  ? usePlannerStoreWithApi
  : usePlannerStoreLocal;
```

### Option 3: Gradual Migration

Keep both stores and migrate features incrementally:

1. Start with read-only backend data
2. Add create/update operations
3. Finally enable full sync
4. Remove local storage fallback

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

### Phase 1: Current State ✅

- API client infrastructure
- Authentication flow
- API service layer
- Type mappers
- API-integrated store (parallel implementation)

### Phase 2: Integration (Next Steps)

1. Update `App.tsx` to use API-integrated store when authenticated
2. Update `usePlannerBootstrap` hook
3. Add loading spinners for async operations
4. Test with real backend

### Phase 3: Optimization

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
