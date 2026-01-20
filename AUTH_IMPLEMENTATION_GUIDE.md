# Implementation Guide - Auth System Fixes

Quick reference for implementing recommended improvements to the auth system.

---

## 1. Update Backend Response to Include Missing Fields

### File: `backend/src/controllers/auth.controller.ts`

**Change 1: Update Signup Response**

```typescript
// BEFORE (line ~35-42)
res.status(201).json({
  user: {
    id: user._id,
    email: user.email,
    name: user.name,
  },
  token,
});

// AFTER
res.status(201).json({
  user: {
    id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar || null,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  },
  token,
});
```

**Change 2: Update Login Response**

```typescript
// BEFORE (line ~78-84)
res.json({
  user: {
    id: user._id,
    email: user.email,
    name: user.name,
  },
  token,
});

// AFTER
res.json({
  user: {
    id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar || null,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  },
  token,
});
```

**Change 3: Update Google Auth Response**

```typescript
// BEFORE (line ~152)
res.json({
  user: {
    id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
  },
  token,
});

// AFTER
res.json({
  user: {
    id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar || null,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  },
  token,
});
```

---

## 2. Add Email & Password Validation

### File: `backend/src/controllers/auth.controller.ts`

**Add Validation Function at Top**

```typescript
// Add after imports
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return "Password must contain at least one special character (!@#$%^&*)";
  }
  return null;
};
```

**Update Signup Validation**

```typescript
// BEFORE (line ~12-16)
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

// AFTER
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }
```

**Update Login Validation**

```typescript
// BEFORE (line ~59-63)
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

// AFTER
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
```

---

## 3. Add Rate Limiting

### File: `backend/src/routes/auth.routes.ts`

**Install Package First**
```bash
npm install express-rate-limit
```

**Update Auth Routes**

```typescript
// BEFORE
import { Router } from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
  googleAuth,
} from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.post("/google", googleAuth);

export default router;

// AFTER
import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  signup,
  login,
  logout,
  refreshToken,
  googleAuth,
} from "../controllers/auth.controller";

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Don't count successful logins
  message: "Too many failed login attempts",
});

const router = Router();

router.post("/signup", authLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.post("/refresh", authLimiter, refreshToken);
router.post("/google", authLimiter, googleAuth);

export default router;
```

---

## 4. Add Frontend Token Expiry Check & Auto-Refresh

### File: `frontend/src/lib/api.ts`

**Install JWT Decode Package First**
```bash
npm install jwt-decode
```

**Update API Client**

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiError } from '@/types';
import { jwtDecode } from 'jwt-decode'; // Add import

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests + check expiry
    this.client.interceptors.request.use(async (config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        // Check if token is expired
        try {
          const decoded: any = jwtDecode(token);
          const expiryTime = decoded.exp * 1000; // Convert to milliseconds
          const now = Date.now();
          
          // If token expires in less than 5 minutes, refresh it
          if (expiryTime - now < 5 * 60 * 1000) {
            const newToken = await this.refreshToken();
            config.headers.Authorization = `Bearer ${newToken}`;
          } else {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (err) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message,
          code: error.code || 'UNKNOWN',
          statusCode: error.response?.status || 0,
        };
        return Promise.reject(apiError);
      }
    );
  }

  // ... rest of methods remain the same
}

export const apiClient = new ApiClient();
```

**Alternative: Add Token Check Hook**

```typescript
// File: frontend/src/hooks/useTokenRefresh.ts
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { jwtDecode } from 'jwt-decode';

export const useTokenRefresh = () => {
  const { token, setToken } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    const checkAndRefresh = async () => {
      try {
        const decoded: any = jwtDecode(token);
        const expiryTime = decoded.exp * 1000;
        const now = Date.now();
        
        if (expiryTime - now < 5 * 60 * 1000) {
          const newToken = await apiClient.refreshToken();
          setToken(newToken);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    };

    // Check on mount and every 5 minutes
    checkAndRefresh();
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [token, setToken]);
};

// Usage in layout or root component:
// const Layout = () => {
//   useTokenRefresh();
//   return <>{children}</>;
// }
```

---

## 5. Implement Proper Logout

### File: `backend/src/controllers/auth.controller.ts`

**Update Logout Endpoint**

```typescript
// BEFORE
export const logout = async (req: Request, res: Response) => {
  res.json({ message: "Logout successful" });
};

// AFTER
export const logout = async (req: Request, res: Response) => {
  try {
    // If using session-based tokens, invalidate here
    // For JWT, client-side cleanup is sufficient
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
```

---

## 6. Update Frontend Logout Flow

### File: `frontend/src/app/layout.tsx` or wherever logout is called

```typescript
const handleLogout = async () => {
  try {
    await apiClient.logout();
  } catch (error) {
    console.error('Logout API failed:', error);
  } finally {
    // Always logout locally even if API fails
    logout();
    router.push('/auth/login');
  }
};
```

---

## 7. Environment Variables Checklist

### Backend `.env` File
```env
# Database
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/chatbot
REDIS_URL=redis://<host>:6379

# JWT
JWT_SECRET=your-very-secret-key-change-this-in-production

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback

# Server
NODE_ENV=production
PORT=3000
```

### Frontend `.env.local` File
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/v1
```

---

## 8. Testing Commands

### Test Signup with Validation
```bash
curl -X POST http://localhost:3000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Weak",
    "name": "Test User"
  }'

# Expected: 400 error for weak password
```

### Test Login with Valid Credentials
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "StrongPass123!"
  }'

# Expected: 200 with user + token
```

### Test Rate Limiting
```bash
# Run 6 times in quick succession
for i in {1..6}; do
  curl -X POST http://localhost:3000/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "wrong"}'
done

# 6th request should get 429 (Too Many Requests)
```

---

## 9. Implementation Priority & Timeline

### Phase 1 (Day 1) - Critical
- [ ] Update response fields (1 hour)
- [ ] Add email/password validation (1 hour)
- [ ] Add rate limiting (30 min)
- [ ] Test all endpoints (1 hour)

### Phase 2 (Day 2) - Important
- [ ] Add frontend token refresh check (1 hour)
- [ ] Test token expiry scenarios (30 min)
- [ ] Update environment variables (30 min)

### Phase 3 (Day 3) - Polish
- [ ] Add error logging (1 hour)
- [ ] Security review (1 hour)
- [ ] Performance testing (1 hour)

---

## 10. Validation Checklist Before Deployment

- [ ] All auth endpoints return complete user object
- [ ] Password validation enforced
- [ ] Email validation enforced
- [ ] Rate limiting enabled
- [ ] Token refresh working
- [ ] Logout clears tokens
- [ ] Error messages user-friendly
- [ ] All environment variables set
- [ ] HTTPS enabled in production
- [ ] CORS configured correctly
- [ ] Tests passing
- [ ] No console errors
- [ ] No API key exposure in logs

---

## Quick Reference: Response Format

After implementing changes, all auth endpoints should return:

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "isVerified": false,
    "createdAt": "2026-01-20T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2NDY2NTUyMDAsImV4cCI6MTY0NzI2MDAwMH0.signature"
}
```

