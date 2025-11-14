# Troubleshooting Guide

This guide helps you diagnose and fix common issues with the Weekly Planner application.

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Installation Issues](#installation-issues)
3. [Database Issues](#database-issues)
4. [Authentication Issues](#authentication-issues)
5. [API Connection Issues](#api-connection-issues)
6. [Frontend Issues](#frontend-issues)
7. [Performance Issues](#performance-issues)
8. [Build & Deployment Issues](#build--deployment-issues)
9. [Development Environment Issues](#development-environment-issues)
10. [Getting Help](#getting-help)

---

## Quick Diagnostics

### Health Check Commands

Run these commands to quickly diagnose issues:

```bash
# 1. Check Node.js version (should be 18+)
node --version

# 2. Check npm version (should be 9+)
npm --version

# 3. Check PostgreSQL is running
psql --version
pg_isready

# 4. Check if ports are available
lsof -i :3000  # Backend port
lsof -i :5173  # Frontend dev server port

# 5. Check environment variables
cd backend && cat .env
cd frontend && cat .env

# 6. Test database connection
cd backend && npx prisma db pull

# 7. Check backend health
curl http://localhost:3000

# 8. View backend logs
cd backend && npm run start:dev
# Check for errors in output
```

### Common Quick Fixes

Before diving into specific issues, try these:

1. **Restart everything**
   ```bash
   # Stop all running processes (Ctrl+C)
   # Clear npm cache
   npm cache clean --force
   # Restart PostgreSQL
   sudo systemctl restart postgresql
   # Restart backend and frontend
   ```

2. **Reinstall dependencies**
   ```bash
   cd backend && rm -rf node_modules package-lock.json && npm install
   cd frontend && rm -rf node_modules package-lock.json && npm install
   ```

3. **Check for port conflicts**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   # Kill process on port 5173
   lsof -ti:5173 | xargs kill -9
   ```

---

## Installation Issues

### Error: `npm install` fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache and retry:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use correct Node.js version:**
   ```bash
   node --version  # Should be 18+
   # If wrong version, install nvm:
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

3. **Try legacy peer deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

### Error: `Cannot find module 'X'`

**Symptoms:**
```
Error: Cannot find module '@nestjs/core'
```

**Solutions:**

1. **Install missing dependencies:**
   ```bash
   npm install
   ```

2. **Specific dependency missing:**
   ```bash
   npm install @nestjs/core @nestjs/common
   ```

3. **Prisma client not generated:**
   ```bash
   cd backend
   npx prisma generate
   ```

### Error: Permission denied

**Symptoms:**
```
EACCES: permission denied
```

**Solutions:**

1. **Fix npm permissions:**
   ```bash
   sudo chown -R $USER:$USER ~/.npm
   sudo chown -R $USER:$USER ./node_modules
   ```

2. **Don't use sudo with npm:**
   ```bash
   # Wrong:
   sudo npm install

   # Correct:
   npm install
   ```

---

## Database Issues

### Error: Connection refused

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Can't reach database server at `localhost:5432`
```

**Solutions:**

1. **Start PostgreSQL:**
   ```bash
   # macOS with Homebrew
   brew services start postgresql

   # Linux
   sudo systemctl start postgresql

   # Check status
   sudo systemctl status postgresql
   ```

2. **Check PostgreSQL is listening:**
   ```bash
   pg_isready
   # Should output: /tmp:5432 - accepting connections
   ```

3. **Verify connection string:**
   ```bash
   # In backend/.env, check DATABASE_URL format:
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

   # Example:
   DATABASE_URL="postgresql://postgres:password@localhost:5432/weekly_planner_dev"
   ```

4. **Test connection manually:**
   ```bash
   psql -h localhost -U postgres -d weekly_planner_dev
   # Should prompt for password and connect
   ```

### Error: Database does not exist

**Symptoms:**
```
database "weekly_planner_dev" does not exist
```

**Solutions:**

1. **Create the database:**
   ```bash
   # Using createdb command
   createdb weekly_planner_dev

   # Or using psql
   psql -U postgres
   CREATE DATABASE weekly_planner_dev;
   \q
   ```

2. **Run migrations:**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

### Error: Authentication failed

**Symptoms:**
```
password authentication failed for user "postgres"
```

**Solutions:**

1. **Check password in DATABASE_URL:**
   ```bash
   # backend/.env
   DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/weekly_planner_dev"
   ```

2. **Reset PostgreSQL password (macOS):**
   ```bash
   psql -U postgres
   ALTER USER postgres WITH PASSWORD 'newpassword';
   \q
   ```

3. **Reset PostgreSQL password (Linux):**
   ```bash
   sudo -u postgres psql
   ALTER USER postgres WITH PASSWORD 'newpassword';
   \q
   ```

### Error: Migrations fail

**Symptoms:**
```
Migration failed to apply cleanly to the shadow database
```

**Solutions:**

1. **Reset database (development only!):**
   ```bash
   cd backend
   npx prisma migrate reset
   # This will delete ALL data!
   ```

2. **Deploy migrations:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

3. **Generate Prisma client:**
   ```bash
   cd backend
   npx prisma generate
   ```

---

## Authentication Issues

### Error: JWT token invalid

**Symptoms:**
- Logged out unexpectedly
- 401 Unauthorized errors
- "Invalid token" message

**Solutions:**

1. **Clear localStorage and re-login:**
   ```javascript
   // In browser console:
   localStorage.clear();
   // Then refresh page and log in again
   ```

2. **Check JWT_SECRET matches:**
   ```bash
   # backend/.env
   JWT_SECRET="your-secret-key"
   # This must not change after users have logged in
   ```

3. **Check token expiration:**
   ```bash
   # backend/.env
   JWT_EXPIRATION="7d"  # Tokens expire after 7 days
   # Users need to log in again after expiration
   ```

### Error: Cannot register/login

**Symptoms:**
- Registration form doesn't submit
- Login always fails
- No error message shown

**Solutions:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:3000
   # Should return: {"message":"Weekly Planner API"}
   ```

2. **Check CORS configuration:**
   ```bash
   # backend/.env
   CORS_ORIGIN="http://localhost:5173"
   # Must match frontend URL exactly
   ```

3. **Check browser console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

4. **Check password requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character (@$!%*?&)

### Error: Password validation fails

**Symptoms:**
```
Password must contain uppercase, lowercase, number, and special character
```

**Solution:**

Use a password that meets requirements:
- ✅ Good: `MyPass123!`
- ❌ Bad: `password` (no uppercase, number, special char)
- ❌ Bad: `PASSWORD` (no lowercase, number, special char)
- ❌ Bad: `Pass123` (no special character)

---

## API Connection Issues

### Error: Network Error / Cannot connect to backend

**Symptoms:**
```
Network Error
Failed to fetch
ERR_CONNECTION_REFUSED
```

**Solutions:**

1. **Verify backend is running:**
   ```bash
   curl http://localhost:3000
   # Should see: {"message":"Weekly Planner API"}
   ```

2. **Check API URL in frontend:**
   ```bash
   # frontend/.env
   VITE_API_URL=http://localhost:3000
   # No trailing slash!
   ```

3. **Restart development servers:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run start:dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

4. **Check for firewall blocking:**
   ```bash
   # Test connection
   telnet localhost 3000
   # Should connect successfully
   ```

### Error: CORS policy blocking requests

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
No 'Access-Control-Allow-Origin' header is present
```

**Solutions:**

1. **Check CORS origin matches:**
   ```bash
   # backend/.env
   CORS_ORIGIN="http://localhost:5173"

   # Must match the URL in your browser exactly:
   # - Same protocol (http/https)
   # - Same host (localhost)
   # - Same port (5173)
   ```

2. **Multiple origins (if needed):**
   ```bash
   # backend/.env
   CORS_ORIGIN="http://localhost:5173,http://localhost:4173"
   ```

3. **Check NestJS CORS configuration:**
   ```typescript
   // backend/src/main.ts
   app.enableCors({
     origin: process.env.CORS_ORIGIN,
     credentials: true,
   });
   ```

---

## Frontend Issues

### Error: Blank page / White screen

**Symptoms:**
- Page loads but shows nothing
- React app doesn't render

**Solutions:**

1. **Check browser console:**
   - Press F12 to open DevTools
   - Look for errors in Console tab
   - Common errors:
     - "Unexpected token <" → Build issue
     - "Cannot read property of undefined" → State issue

2. **Hard refresh:**
   ```
   # Windows/Linux: Ctrl + Shift + R
   # macOS: Cmd + Shift + R
   # Or: Clear browser cache
   ```

3. **Rebuild frontend:**
   ```bash
   cd frontend
   rm -rf dist node_modules
   npm install
   npm run dev
   ```

4. **Check for JavaScript errors:**
   - Open DevTools Console
   - Look for red error messages
   - Check stack trace for file causing error

### Error: Tasks not loading

**Symptoms:**
- App loads but tasks don't appear
- Loading spinner forever
- Empty planner view

**Solutions:**

1. **Check authentication:**
   ```javascript
   // Browser console:
   localStorage.getItem('auth_token')
   // Should show a JWT token or null
   ```

2. **Check network requests:**
   - Open DevTools → Network tab
   - Look for failed requests to /tasks or /weeks
   - Check response status codes

3. **Check localStorage:**
   ```javascript
   // Browser console:
   localStorage.getItem('planner-storage')
   // Should show stored planner data
   ```

4. **Clear state and reload:**
   ```javascript
   // Browser console:
   localStorage.clear();
   location.reload();
   ```

### Error: Drag and drop not working

**Symptoms:**
- Cannot drag tasks
- Drag doesn't move tasks
- Drop doesn't register

**Solutions:**

1. **Check browser compatibility:**
   - Use modern browser (Chrome, Firefox, Safari, Edge)
   - Update browser to latest version

2. **Check for JavaScript errors:**
   - Open Console in DevTools
   - Look for @dnd-kit errors

3. **Disable browser extensions:**
   - Some extensions interfere with drag-and-drop
   - Try in incognito/private mode

4. **Restart frontend dev server:**
   ```bash
   cd frontend
   npm run dev
   ```

---

## Performance Issues

### Issue: Slow page load

**Symptoms:**
- App takes long to load
- White screen for several seconds

**Solutions:**

1. **Check bundle size:**
   ```bash
   cd frontend
   npm run build
   # Check dist/assets/*.js file sizes
   # Large files (>500KB) indicate bundling issues
   ```

2. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
   - Or clear cache in browser settings

3. **Check network speed:**
   - Slow WiFi can cause delays
   - Test on different network

### Issue: Laggy UI

**Symptoms:**
- Animations stutter
- Typing is slow
- Drag-and-drop is jerky

**Solutions:**

1. **Close other tabs:**
   - Free up browser memory
   - Close unused applications

2. **Check system resources:**
   ```bash
   # Check memory usage
   top
   # Look for high CPU/memory processes
   ```

3. **Disable browser extensions:**
   - Extensions can slow down page
   - Test in incognito mode

4. **Reduce number of tasks:**
   - Many tasks (>100) can slow UI
   - Archive completed tasks

---

## Build & Deployment Issues

### Error: TypeScript compilation fails

**Symptoms:**
```
error TS2322: Type 'X' is not assignable to type 'Y'
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```

**Solutions:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Clear TypeScript cache:**
   ```bash
   rm -rf node_modules/.cache
   npx tsc --build --clean
   ```

3. **Check tsconfig.json:**
   ```bash
   # frontend/tsconfig.json should have:
   {
     "compilerOptions": {
       "strict": true,
       // ...
     }
   }
   ```

4. **Fix type errors:**
   - Read error message carefully
   - Add proper type annotations
   - Use `as` type assertions if needed (sparingly)

### Error: Vite build fails

**Symptoms:**
```
[vite]: Rollup failed to resolve import
Failed to parse source
```

**Solutions:**

1. **Clear Vite cache:**
   ```bash
   cd frontend
   rm -rf node_modules/.vite
   npm run dev
   ```

2. **Check imports:**
   ```typescript
   // Make sure all imports exist:
   import { Component } from './Component'
   // File must exist at that path
   ```

3. **Rebuild:**
   ```bash
   cd frontend
   npm run build
   ```

### Error: NestJS build fails

**Symptoms:**
```
Error: Cannot find module
nest build failed
```

**Solutions:**

1. **Generate Prisma client:**
   ```bash
   cd backend
   npx prisma generate
   ```

2. **Clean build:**
   ```bash
   cd backend
   rm -rf dist
   npm run build
   ```

3. **Check dependencies:**
   ```bash
   cd backend
   npm install
   ```

---

## Development Environment Issues

### Error: Port already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
Port 5173 is in use, trying another one...
```

**Solutions:**

1. **Kill process on port:**
   ```bash
   # Find process using port 3000
   lsof -i :3000

   # Kill process
   kill -9 <PID>

   # Or one-liner:
   lsof -ti:3000 | xargs kill -9
   ```

2. **Change port:**
   ```bash
   # Backend: Edit backend/.env
   PORT=3001

   # Frontend: Run with different port
   npm run dev -- --port 5174
   ```

### Error: Hot reload not working

**Symptoms:**
- Changes to code don't reflect in browser
- Need to manually refresh

**Solutions:**

1. **Restart dev server:**
   ```bash
   # Stop with Ctrl+C, then:
   npm run dev
   ```

2. **Check file watcher limits (Linux):**
   ```bash
   # Increase limit:
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

3. **Check Vite config:**
   ```typescript
   // frontend/vite.config.ts
   export default defineConfig({
     server: {
       watch: {
         usePolling: true, // If on WSL or network drive
       },
     },
   });
   ```

### Error: Environment variables not loading

**Symptoms:**
- `process.env.VARIABLE` is undefined
- Configuration not applying

**Solutions:**

1. **Check .env file exists:**
   ```bash
   ls -la backend/.env
   ls -la frontend/.env
   ```

2. **Restart dev servers:**
   - Changes to .env require restart
   - Stop (Ctrl+C) and start again

3. **Frontend env variables:**
   ```bash
   # Must be prefixed with VITE_:
   VITE_API_URL=http://localhost:3000  # ✅ Correct
   API_URL=http://localhost:3000        # ❌ Won't work
   ```

4. **Check .env.example:**
   ```bash
   # Compare with .env.example
   cat backend/.env.example
   cat backend/.env
   ```

---

## Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Search existing issues** on GitHub
3. **Check documentation:**
   - [README.md](./README.md)
   - [DEPLOYMENT.md](./DEPLOYMENT.md)
   - [ARCHITECTURE.md](./ARCHITECTURE.md)

### When Asking for Help

Include this information:

1. **Environment details:**
   ```bash
   node --version
   npm --version
   psql --version
   # OS and version
   ```

2. **Complete error message:**
   - Full stack trace
   - Error code
   - Line numbers

3. **Steps to reproduce:**
   - What you did
   - What you expected
   - What actually happened

4. **What you've tried:**
   - Solutions from this guide
   - Other troubleshooting steps

### Where to Get Help

- **GitHub Issues**: https://github.com/yourusername/weekly_planner/issues
- **Discussions**: https://github.com/yourusername/weekly_planner/discussions
- **Documentation**: Check docs/ folder

### Reporting Bugs

Use this template:

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., macOS 14, Ubuntu 22.04]
- Node.js: [version]
- npm: [version]
- Browser: [e.g., Chrome 120]

## Error Messages
```
[Paste full error message]
```

## Screenshots
[If applicable]

## Additional Context
[Any other information]
```

---

## Appendix: Useful Commands

### Development Commands

```bash
# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run tests
npm run lint         # Lint code
npm run type-check   # Check TypeScript

# Backend
cd backend
npm run start:dev    # Start dev server (watch mode)
npm run start:prod   # Start production server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Lint code

# Database
npx prisma studio    # Database GUI
npx prisma migrate dev # Create migration
npx prisma migrate deploy # Apply migrations
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema without migration
npx prisma db pull   # Pull schema from database
```

### Diagnostic Commands

```bash
# Check running processes
ps aux | grep node

# Check open ports
lsof -i :3000
lsof -i :5173
netstat -an | grep LISTEN

# Check disk space
df -h

# Check memory usage
free -h  # Linux
vm_stat  # macOS

# View logs
tail -f backend.log
journalctl -u weekly-planner

# Test API endpoint
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Commands

```bash
# Connect to database
psql -U postgres -d weekly_planner_dev

# Common SQL queries
\dt                  # List tables
\d tasks             # Describe tasks table
SELECT COUNT(*) FROM users;
SELECT * FROM tasks WHERE userId = 'user-id';

# Backup and restore
pg_dump weekly_planner_dev > backup.sql
psql weekly_planner_dev < backup.sql
```

---

## Still Having Issues?

If you've tried everything in this guide and still have problems:

1. **Check for updates:**
   ```bash
   git pull origin main
   npm install  # In both frontend and backend
   ```

2. **Try clean install:**
   ```bash
   # Remove everything and start fresh
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Ask for help:**
   - Open an issue on GitHub
   - Include all diagnostic information
   - Be specific about what you've tried

4. **Check system requirements:**
   - Node.js 18+ installed
   - PostgreSQL 14+ installed
   - Sufficient disk space (2GB+)
   - Sufficient memory (4GB+ RAM)

---

## License

MIT License - see [LICENSE](./LICENSE) file.
