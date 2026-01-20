# Authentication System - Visual Architecture Guide

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────┐         ┌──────────────────────┐              │
│  │  Login Page          │         │  Signup Page         │              │
│  │  /auth/login         │         │  /auth/signup        │              │
│  │  ✓ Email input       │         │  ✓ Name input        │              │
│  │  ✓ Password input    │         │  ✓ Email input       │              │
│  │  ✓ Error display     │         │  ✓ Password input    │              │
│  │  ✓ Demo creds        │         │  ✓ Confirm password  │              │
│  └──────────┬───────────┘         └──────────┬───────────┘              │
│             │                                 │                         │
│             └─────────────────┬───────────────┘                         │
│                               │                                         │
│                     ┌─────────▼────────┐                                │
│                     │   API Client     │                                │
│                     │  lib/api.ts      │                                │
│                     │  ✓ signup()      │                                │
│                     │  ✓ login()       │                                │
│                     │  ✓ logout()      │                                │
│                     │  ✓ refreshToken()│                                │
│                     │  ✓ Interceptors  │                                │
│                     └────────┬─────────┘                                │
│                              │                                          │
│                    ┌─────────▼────────────┐                             │
│                    │   Zustand Store      │                             │
│                    │   store/auth.ts      │                             │
│                    │  ✓ user state        │                             │
│                    │  ✓ token state       │                             │
│                    │  ✓ localStorage      │                             │
│                    └─────────────────────┘                              │
│                                                                          │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                    HTTP / REST API
                           │
┌──────────────────────────▼──────────────────────────────────────────────┐
│                         BACKEND (Express)                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │              Routes & Middleware Layer                        │        │
│  │  ┌───────────────────────────────────────────────────────┐   │        │
│  │  │  POST /auth/signup  ──┐                              │   │        │
│  │  │  POST /auth/login   ──┼─→ authMiddleware()         │   │        │
│  │  │  POST /auth/logout  ──┤   optionalAuthMiddleware() │   │        │
│  │  │  POST /auth/refresh ──┤   (Rate limiting)           │   │        │
│  │  │  POST /auth/google  ──┘                              │   │        │
│  │  └───────────────────────────────────────────────────────┘   │        │
│  └────────────────────────┬─────────────────────────────────────┘        │
│                           │                                              │
│  ┌────────────────────────▼─────────────────────────────────┐            │
│  │          Auth Controller Layer                            │            │
│  │  ┌─────────────────────────────────────────────────────┐ │            │
│  │  │  signup(req, res)                                   │ │            │
│  │  │  ✓ Validate email & password                        │ │            │
│  │  │  ✓ Check user exists                                │ │            │
│  │  │  ✓ Hash password (bcrypt)                           │ │            │
│  │  │  ✓ Create user in MongoDB                           │ │            │
│  │  │  ✓ Generate JWT token                               │ │            │
│  │  │  ✓ Return { user, token }                           │ │            │
│  │  └─────────────────────────────────────────────────────┘ │            │
│  │                                                            │            │
│  │  ┌─────────────────────────────────────────────────────┐ │            │
│  │  │  login(req, res)                                    │ │            │
│  │  │  ✓ Validate email & password                        │ │            │
│  │  │  ✓ Find user in MongoDB                             │ │            │
│  │  │  ✓ Compare password (bcrypt)                        │ │            │
│  │  │  ✓ Generate JWT token                               │ │            │
│  │  │  ✓ Return { user, token }                           │ │            │
│  │  └─────────────────────────────────────────────────────┘ │            │
│  │                                                            │            │
│  │  ┌─────────────────────────────────────────────────────┐ │            │
│  │  │  logout(req, res) & refreshToken(req, res)         │ │            │
│  │  │  ✓ Token validation                                │ │            │
│  │  │  ✓ Generate new token                              │ │            │
│  │  │  ✓ Session cleanup (if needed)                     │ │            │
│  │  └─────────────────────────────────────────────────────┘ │            │
│  │                                                            │            │
│  │  ┌─────────────────────────────────────────────────────┐ │            │
│  │  │  googleAuth(req, res)                               │ │            │
│  │  │  ✓ Verify Google token                              │ │            │
│  │  │  ✓ Create or update user                            │ │            │
│  │  │  ✓ Generate JWT token                               │ │            │
│  │  │  ✓ Return { user, token }                           │ │            │
│  │  └─────────────────────────────────────────────────────┘ │            │
│  └──────────────────────┬──────────────────────────────────┘             │
│                         │                                                │
│  ┌──────────────────────▼──────────────────────────────────┐             │
│  │          Data Layer                                      │             │
│  │  ┌──────────────────┐       ┌──────────────────┐        │             │
│  │  │   User Model     │       │   Config         │        │             │
│  │  │   user.model.ts  │       │   config/index.ts│        │             │
│  │  │  ✓ email         │       │  ✓ JWT_SECRET    │        │             │
│  │  │  ✓ password      │       │  ✓ TOKEN_EXPIRY  │        │             │
│  │  │  ✓ name          │       │  ✓ DB_URI        │        │             │
│  │  │  ✓ avatar        │       │  ✓ OAUTH_CONFIG  │        │             │
│  │  │  ✓ isVerified    │       └──────────────────┘        │             │
│  │  │  ✓ timestamps    │                                    │             │
│  │  └──────────┬───────┘                                    │             │
│  │             │                                            │             │
│  │             │                                            │             │
│  │  ┌──────────▼─────────────┐                              │             │
│  │  │     MongoDB            │                              │             │
│  │  │  collections/users     │                              │             │
│  │  │  (Persistent Storage)  │                              │             │
│  │  └────────────────────────┘                              │             │
│  └──────────────────────────────────────────────────────────┘             │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Signup Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND: User fills signup form                                     │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ Name: John Doe                                                 │  │
│ │ Email: john@example.com                                        │  │
│ │ Password: SecurePass123!                                       │  │
│ │ Confirm: SecurePass123!                                        │  │
│ │ [Create Account]                                               │  │
│ └────────────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────────────────┘
                     │
                     ▼
        Frontend Validation (HTML5 + JS)
        ✓ All fields required
        ✓ Passwords match
        ✓ Email format
        │
        ├─ Error? → Display in Alert
        └─ OK? → Continue
                     │
                     ▼
        setIsLoading(true)
        apiClient.signup(email, password, name)
                     │
                     ▼
        ┌─────────────────────────────────────────────┐
        │         HTTP Request to Backend              │
        │  POST /v1/auth/signup                        │
        │  Content-Type: application/json              │
        │  {                                           │
        │    "email": "john@example.com",              │
        │    "password": "SecurePass123!",             │
        │    "name": "John Doe"                        │
        │  }                                           │
        └────────────────────┬────────────────────────┘
                             │
                             ▼
        ┌─────────────────────────────────────────────────────────┐
        │ BACKEND: signup controller                              │
        │                                                         │
        │ 1. Validate input                                       │
        │    ✓ email and password present?                        │
        │    ✓ email format valid?                                │
        │    ✓ password strong enough?                            │
        │                                                         │
        │    → If error, return 400                              │
        │                                                         │
        │ 2. Check if user exists                                 │
        │    User.findOne({ email })                              │
        │                                                         │
        │    → If found, return 409                              │
        │                                                         │
        │ 3. Hash password                                        │
        │    await bcrypt.hash(password, 10)                      │
        │                                                         │
        │ 4. Create user in MongoDB                               │
        │    await User.create({                                  │
        │      email,                                             │
        │      password: hash,                                    │
        │      name,                                              │
        │      isVerified: false,                                 │
        │      avatar: null                                       │
        │    })                                                   │
        │                                                         │
        │ 5. Generate JWT token                                   │
        │    jwt.sign(                                            │
        │      { userId: user._id, email: user.email },          │
        │      JWT_CONFIG.secret,                                │
        │      { expiresIn: "7d" }                                │
        │    )                                                    │
        │                                                         │
        │ 6. Return response                                      │
        └────────────────────┬─────────────────────────────────┘
                             │
                             ▼
        ┌─────────────────────────────────────────────┐
        │    HTTP Response to Frontend                 │
        │  Status: 201 Created                         │
        │  {                                           │
        │    "user": {                                 │
        │      "id": "507f1f77bcf86cd799439011",      │
        │      "email": "john@example.com",            │
        │      "name": "John Doe",                     │
        │      "avatar": null,                         │
        │      "isVerified": false,                    │
        │      "createdAt": "2026-01-20T12:00:00Z"    │
        │    },                                        │
        │    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..." │
        │  }                                           │
        └────────────────────┬────────────────────────┘
                             │
                             ▼
        ┌─────────────────────────────────────────────┐
        │ FRONTEND: Handle response                    │
        │                                             │
        │ setUser(response.user)                       │
        │ setToken(response.token)                     │
        │ → Saves to Zustand store                    │
        │ → Saves token to localStorage                │
        │                                             │
        │ toast.success('Account created!')            │
        │ router.push('/dashboard')                    │
        │                                             │
        │ setIsLoading(false)                          │
        └────────────────────┬────────────────────────┘
                             │
                             ▼
        ┌─────────────────────────────────────────────┐
        │ User redirected to dashboard                 │
        │ App layout loads                             │
        │ Token auto-added to future requests:         │
        │  Authorization: Bearer {token}               │
        └─────────────────────────────────────────────┘
```

---

## Data Flow: Login Journey

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: User fills login form                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Email: john@example.com                                     │ │
│ │ Password: SecurePass123!                                    │ │
│ │ [Login]                                                     │ │
│ └──────────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
        setIsLoading(true)
        apiClient.login(email, password)
                     │
                     ▼
        ┌─────────────────────────────────────────────┐
        │         HTTP Request to Backend              │
        │  POST /v1/auth/login                         │
        │  Content-Type: application/json              │
        │  {                                           │
        │    "email": "john@example.com",              │
        │    "password": "SecurePass123!"              │
        │  }                                           │
        └────────────────────┬────────────────────────┘
                             │
                             ▼
        ┌─────────────────────────────────────────────────────────┐
        │ BACKEND: login controller                               │
        │                                                         │
        │ 1. Validate input                                       │
        │    ✓ email and password present?                        │
        │                                                         │
        │    → If error, return 400                              │
        │                                                         │
        │ 2. Find user by email                                   │
        │    const user = await User.findOne({ email })          │
        │                                                         │
        │    → If not found, return 401 Invalid                  │
        │                                                         │
        │ 3. Compare password                                     │
        │    const valid = await bcrypt.compare(                  │
        │      password,                                         │
        │      user.password                                     │
        │    )                                                    │
        │                                                         │
        │    → If invalid, return 401 Invalid                    │
        │                                                         │
        │ 4. Generate JWT token                                   │
        │    jwt.sign(                                            │
        │      { userId: user._id, email: user.email },          │
        │      JWT_CONFIG.secret,                                │
        │      { expiresIn: "7d" }                                │
        │    )                                                    │
        │                                                         │
        │ 5. Return response                                      │
        └────────────────────┬─────────────────────────────────┘
                             │
                             ▼
        ┌─────────────────────────────────────────────┐
        │    HTTP Response to Frontend                 │
        │  Status: 200 OK                              │
        │  {                                           │
        │    "user": {                                 │
        │      "id": "507f1f77bcf86cd799439011",      │
        │      "email": "john@example.com",            │
        │      "name": "John Doe",                     │
        │      "avatar": null,                         │
        │      "isVerified": false,                    │
        │      "createdAt": "2026-01-20T11:00:00Z"    │
        │    },                                        │
        │    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..." │
        │  }                                           │
        └────────────────────┬────────────────────────┘
                             │
                             ▼
        ┌─────────────────────────────────────────────┐
        │ FRONTEND: Handle response                    │
        │                                             │
        │ setUser(response.user)                       │
        │ setToken(response.token)                     │
        │ → Saves to Zustand store                    │
        │ → Saves token to localStorage                │
        │                                             │
        │ toast.success('Login successful!')           │
        │ router.push('/dashboard')                    │
        │                                             │
        │ setIsLoading(false)                          │
        └────────────────────┬────────────────────────┘
                             │
                             ▼
        ┌─────────────────────────────────────────────┐
        │ User redirected to dashboard                 │
        │ Auth middleware protects routes               │
        │ Token auto-added to protected requests:       │
        │  Authorization: Bearer {token}                │
        └─────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
FRONTEND ERROR SCENARIOS:
═════════════════════════════════════════════════════════════════

Scenario 1: Signup - Email Already Exists
────────────────────────────────────────
User Input: email@example.com (already exists)
    ↓
Frontend sends: POST /auth/signup
    ↓
Backend returns: 409 Conflict
  { error: "User already exists" }
    ↓
apiClient receives error
    ↓
Frontend catch block:
  setError("User already exists")
  toast.error("User already exists")
    ↓
Alert displays: ⚠ User already exists
User remains on signup page


Scenario 2: Login - Invalid Credentials
─────────────────────────────────────────
User Input: wrong@example.com / wrongpassword
    ↓
Frontend sends: POST /auth/login
    ↓
Backend returns: 401 Unauthorized
  { error: "Invalid credentials" }
    ↓
Frontend catch block:
  setError("Invalid credentials")
  toast.error("Invalid credentials")
    ↓
Alert displays: ⚠ Invalid credentials
User remains on login page
Can retry


Scenario 3: Missing Fields
───────────────────────────
User Input: (empty email) / (empty password)
    ↓
Frontend HTML5 validation:
  <Input required />
    ↓
Browser blocks submission
Message: "Please fill out this field"
    ↓
User prompted to fill required fields


Scenario 4: Network Error
──────────────────────────
Frontend sends: POST /auth/signup
    ↓
Network fails / timeout
    ↓
axios throws error
    ↓
Frontend catch block:
  err.message = "Network Error"
  setError("Network Error")
    ↓
Alert displays: ⚠ Network Error
User remains on form
Can retry
```

---

## Token Flow Diagram

```
INITIAL LOGIN:
══════════════════════════════════════════════════════════════

1. User logs in
   POST /auth/login → { user, token }

2. Frontend receives token: "eyJhbGciOiJIUzI1NiIs..."
   
3. Zustand store action:
   setToken(token) {
     set({ token })
     localStorage.setItem('token', token)  ← Persisted
   }

4. Token payload (decoded):
   {
     userId: "507f1f77bcf86cd799439011",
     email: "john@example.com",
     iat: 1674302400,     ← Issued at (Jan 20, 2025)
     exp: 1674907200      ← Expires (Jan 27, 2025)
   }

5. Every API request includes:
   GET /bots
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
     ↓
     Backend auth middleware:
       ├─ Extract token from header
       ├─ Verify with JWT secret
       ├─ Extract userId
       └─ Attach to req.userId
     ↓
     Route handler can access req.userId


PAGE REFRESH:
════════════════════════════════════════════════════════════════

1. User refreshes page (F5)
   → React app re-initializes

2. Layout/Root component loads
   useAuthStore.hydrate() is called
     ├─ Check localStorage.getItem('token')
     ├─ Find token: "eyJhbGciOiJIUzI1NiIs..."
     └─ set({ token })

3. Token restored in Zustand store
   → User remains logged in
   → Token auto-added to next requests


TOKEN EXPIRY SCENARIO (After 7 days):
═════════════════════════════════════════════════════════════════

Day 7 (Today):
User tries to make API request
  GET /conversations
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    ↓
Backend auth middleware checks:
  jwt.verify(token, secret)
    ├─ Check exp timestamp: 1674907200
    ├─ Current time: 1674921600 (newer)
    └─ Token EXPIRED! ✗
    ↓
Backend returns: 401 Unauthorized
  { error: "Token expired" }
    ↓
Frontend receives 401 in interceptor
  ├─ Try to refresh: POST /auth/refresh
  ├─ Get new token
  ├─ Retry original request
  └─ Success! (if refresh works)
    
OR

  ├─ Refresh fails
  ├─ Clear auth store
  ├─ Clear localStorage
  └─ Redirect to /auth/login


LOGOUT SCENARIO:
════════════════════════════════════════════════════════════════

1. User clicks logout button
   handleLogout()
    ├─ Call: await apiClient.logout()
    └─ Backend: POST /auth/logout → { message: "OK" }

2. Clear Zustand state:
   logout() {
     set({ user: null, token: null })
     localStorage.removeItem('token')  ← Clear persisted token
   }

3. Redirect:
   router.push('/auth/login')

4. Token is no longer attached to requests
   Next API call: No Authorization header
   → Protected routes return 401
   → User forced to login again
```

---

## Request/Response Cycle

```
COMPLETE REQUEST FLOW WITH MIDDLEWARE:
═══════════════════════════════════════════════════════════════

Frontend Request (with Token):
┌─────────────────────────────────────────────────────┐
│ GET /bots                                            │
│                                                      │
│ Step 1: axios interceptor adds token                 │
│  const token = localStorage.getItem('token')        │
│  config.headers.Authorization = Bearer ${token}     │
│                                                      │
│ Step 2: Send request                                │
│  Headers: {                                          │
│    Content-Type: application/json                    │
│    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...    │
│  }                                                   │
└────────────────────┬────────────────────────────────┘
                     │ HTTP
                     ▼
Backend Request Handling:
┌─────────────────────────────────────────────────────┐
│ Step 1: Express middleware stack                     │
│  app.use(bodyParser.json())                         │
│  app.use(authMiddleware)  ← Token validation        │
│                                                      │
│ Step 2: authMiddleware executes                      │
│  const token = req.headers.authorization            │
│           .split(' ')[1]                            │
│  jwt.verify(token, JWT_SECRET)                      │
│    → Success: Extract userId                        │
│    → Error: Return 401                              │
│                                                      │
│ Step 3: Route handler executes                       │
│  getBots(req, res)                                  │
│  const bots = await Bot.find({                      │
│    ownerId: req.userId  ← From middleware           │
│  })                                                  │
│  res.json(bots)                                     │
└────────────────────┬────────────────────────────────┘
                     │ HTTP
                     ▼
Frontend Response Handling:
┌─────────────────────────────────────────────────────┐
│ axios.interceptors.response                         │
│                                                      │
│ Step 1: Receive response                             │
│  Status: 200 OK                                      │
│  { bots: [...] }                                    │
│                                                      │
│ Step 2: Success interceptor                          │
│  return response                                     │
│                                                      │
│ Step 3: Caller receives data                         │
│  const bots = await apiClient.getBots()             │
│  → Works with state/components                       │
│                                                      │
│ OR if error:                                         │
│                                                      │
│ Status: 401 Unauthorized                             │
│ { error: "Invalid token" }                          │
│                                                      │
│ Error interceptor catches it                         │
│ → Attempts token refresh                             │
│ → Or redirects to login                              │
└─────────────────────────────────────────────────────┘
```

---

## State Management Lifecycle

```
APP INITIALIZATION:
═══════════════════════════════════════════════════════════════

1. App loads in browser
   <Root> component mounts

2. layout.tsx loads
   useAuthStore.hydrate()
     └─ Get token from localStorage
        ├─ Found: Set in store
        └─ Not found: Store remains null

3. User state:
   ├─ Logged in: has token + user
   ├─ Logged out: null + null
   └─ Partial: has token but not user


STATE TRANSITIONS:
═══════════════════════════════════════════════════════════════

Initial State:
  { user: null, token: null }
           │
           ├─ (Page refresh)
           │  └─ localStorage has token
           │     → set({ token: "..." })
           │        { user: null, token: "..." }
           │
           └─ (User signup/login)
              └─ setUser(user)
                 setToken(token)
                 { user: {...}, token: "..." }
                           │
                           ├─ (Page refresh)
                           │  └─ hydrate() restores token
                           │     but user is lost
                           │     → Refetch user from API
                           │
                           └─ (User logout)
                              logout()
                              { user: null, token: null }
                              localStorage cleared


ZUSTAND STORE STRUCTURE:
═══════════════════════════════════════════════════════════════

export const useAuthStore = create<AuthStore>((set) => ({
  
  // State
  user: null,           ← Current authenticated user
  token: null,          ← JWT token
  isLoading: false,     ← Request in progress
  error: null,          ← Error message
  
  // Actions
  setUser: (user) => set({ user }),
  
  setToken: (token) => {
    set({ token })
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token)  ← Persist
      } else {
        localStorage.removeItem('token')      ← Remove
      }
    }
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  logout: () => {
    set({ user: null, token: null })
    localStorage.removeItem('token')
  },
  
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) set({ token })
    }
  }
}))


USING IN COMPONENTS:
═══════════════════════════════════════════════════════════════

const { user, token, isLoading, setUser, setToken } = useAuthStore()

// In form:
const handleSubmit = async () => {
  try {
    const response = await apiClient.signup(...)
    setUser(response.user)
    setToken(response.token)
  } catch (error) {
    setError(error.message)
  }
}

// Outside form:
if (token) {
  return <Dashboard />
} else {
  return <Redirect to="/auth/login" />
}
```

---

This visual guide should help you understand the complete authentication flow from both backend and frontend perspectives!

