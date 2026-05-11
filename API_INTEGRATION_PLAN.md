# ERP API Integration Blueprint (Frontend + Backend)

## Summary

This document covers both sides of the integration — the **backend REST API** (Node.js + Express) and the **frontend API layer** (React + Axios + TanStack Query).

Both follow the same 3-layer pattern so every module is consistent:

```
Backend:   Route  →  Controller  →  Service  →  Data
Frontend:  Page   →  Hook        →  Service  →  HTTP Client
```

---

## Backend Architecture

### Layer Responsibilities

| Layer | File | Job |
|---|---|---|
| **Route** | `routes/auth.routes.js` | Declare HTTP verb + path, attach middleware |
| **Controller** | `controllers/auth.controller.js` | Read `req`, call service, write `res` |
| **Service** | `services/auth.service.js` | All business logic, no HTTP knowledge |
| **Data** | `data/users.js` | Seed / data access (swap for DB later) |
| **Middleware** | `middleware/authMiddleware.js` | JWT guard — populates `req.user` |

### Database

The backend uses **PostgreSQL 17** via `pg` (node-postgres).  
Database: `moif_inventory` (existing — no migration scripts needed, tables already exist).

| Layer | File | Job |
|---|---|---|
| Connection pool | `src/config/db.js` | Single shared `pg.Pool`, reads from `.env` |
| `user.repository.js` | `src/repositories/` | Queries `StaffRegistry` — login credentials |
| `company.repository.js` | `src/repositories/` | Queries `CompanyDetails` — station/branch info |
| `parameter.repository.js` | `src/repositories/` | Queries `ParameterTable` — app-wide settings |
| Service | `src/services/auth.service.js` | Calls repositories, maps rows to API models |

**Table name reference (VB → New):**

| VB System Table | New Table Name | Purpose |
|---|---|---|
| `StaffRegistry` | `StaffRegistry` | *(unchanged)* User credentials & staff info |
| `INVStationMaster` | `CompanyDetails` | Branch/station name, address, contact |
| `INVParameterTable` | `ParameterTable` | Global system parameters (heading, tax, etc.) |


---

### Module System

The backend uses **ES Modules** (`"type": "module"` in `package.json`).

- All files use `import` / `export` syntax — no `require` or `module.exports`
- Local imports must include the `.js` extension (e.g. `import x from './service.js'`)
- `dotenv` is loaded via `import 'dotenv/config'` at the top of `src/index.js`
- Named exports for functions, default export for single-value modules (router, middleware)

This matches the frontend (Vite/React) which is also ESM, keeping the codebase consistent.

### Backend Folder Structure

```text
ERP_backend/
  src/
    index.js                    ← Express app, CORS, global error handler

    routes/
      auth.routes.js            ← POST /login, POST /refresh, POST /logout, GET /me

    controllers/
      auth.controller.js        ← Thin HTTP layer, delegates to service

    services/
      auth.service.js           ← loginUser (fetches user + company + params), refreshAccessToken, getCurrentUser

    repositories/
      user.repository.js        ← SQL for StaffRegistry (login credentials)
      company.repository.js     ← SQL for CompanyDetails (branch/station info)
      parameter.repository.js   ← SQL for ParameterTable (app-wide settings)

    middleware/
      authMiddleware.js         ← Verifies Bearer JWT, sets req.user

  .env                          ← JWT_SECRET, PORT, FRONTEND_URL (never commit)
  .env.example                  ← Safe copy to share
  package.json
```

### Backend Example Patterns

#### Route (declare only — no logic)

```js
// src/routes/auth.routes.js
router.post('/login', login);
router.get('/me', authMiddleware, me);
```

#### Controller (HTTP only — read req, call service, write res)

```js
// src/controllers/auth.controller.js
async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: '...' });
  try {
    const result = await authService.loginUser(username, password);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
}
```

#### Service (business logic — no req/res knowledge)

```js
// src/services/auth.service.js
async function loginUser(username, password) {
  const user = findUserByUsername(username);
  if (!user) throw Object.assign(new Error('Invalid username or password.'), { status: 401 });

  const isMatch = await validatePassword(password, user.passwordHash);
  if (!isMatch) throw Object.assign(new Error('Invalid username or password.'), { status: 401 });

  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    user: formatUser(user),
  };
}
```

### Auth API Contract

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| `POST` | `/api/auth/login` | Public | `{ username, password }` | `{ success, accessToken, refreshToken, user }` |
| `POST` | `/api/auth/refresh` | Public | `{ refreshToken }` | `{ success, accessToken }` |
| `POST` | `/api/auth/logout` | Public | — | `{ success, message }` |
| `GET`  | `/api/auth/me` | Bearer | — | `{ success, user }` |

---

## Frontend Architecture

Create the frontend API layer around:

- REST
- JWT + refresh token
- Axios for HTTP
- TanStack Query for server state
- a typed adapter layer between backend DTOs and UI models

Recommended first slice:

- authentication
- dashboard

This is the right foundation for a large ERP because it keeps backend instability isolated, scales well across modules, and avoids spreading raw API logic into pages and components.

## Estimated Implementation Time

### Phase 1. Foundation

Time: `1.5 to 2.5 days`

Deliverables:

- environment config strategy
- Axios client
- auth token and refresh strategy
- TanStack Query setup
- shared error handling
- base API folder structure

### Phase 2. Auth Integration

Time: `2 to 4 days`

Deliverables:

- login flow
- refresh flow
- logout flow
- current user bootstrap
- protected routes
- permission-aware app shell and menu behavior

### Phase 3. Dashboard Integration

Time: `1 to 2 days`

Deliverables:

- dashboard summary queries
- loading, empty, and error states
- cache and refetch behavior
- role-aware widget visibility

### Phase 4. First Real ERP Module

Recommended module: `Products`

Time: `4 to 8 days`

Deliverables:

- list API
- filters
- detail API
- create and update mutation pattern
- table state and query key conventions
- mutation invalidation conventions

### Phase 5. Reusable ERP Module Pattern

Time: `2 to 3 days`

Deliverables:

- module template pattern
- standard query keys
- standard form submit and error mapping
- common table and list integration conventions

### Total Realistic First Milestone

Time: `10 to 19 working days`

This covers:

- base architecture
- auth
- dashboard
- first business module done properly

## Planned Folder and File Structure

Use this structure so all future ERP modules follow the same pattern.

```text
src/
  app/
    providers/
      QueryProvider.jsx
      AuthProvider.jsx
    router/
      ProtectedRoute.jsx
    config/
      env.js
    store/
      sessionStore.js

  api/
    client/
      httpClient.js
      tokenManager.js
      errorNormalizer.js
    query/
      queryClient.js
      queryKeys.js
    auth/
      auth.service.js
      auth.adapter.js
      auth.types.js
      useAuthQueries.js
      useAuthMutations.js
    dashboard/
      dashboard.service.js
      dashboard.adapter.js
      dashboard.types.js
      useDashboardQueries.js
    products/
      products.service.js
      products.adapter.js
      products.types.js
      useProductsQueries.js
      useProductsMutations.js

  hooks/
    useCurrentUser.js
    usePermissions.js

  features/
    auth/
      pages/
        LoginPage.jsx
      components/
        LoginForm.jsx
    dashboard/
      components/
        SummaryCards.jsx
        AlertsPanel.jsx
    products/
      pages/
        ProductListPage.jsx
        ProductDetailsPage.jsx
      components/
        ProductTable.jsx
        ProductFilters.jsx
        ProductForm.jsx

  utils/
    formatters.js
    mappers.js

  constants/
    theme.js

  pages/
    Dashboard.jsx
    ProductList.jsx

  components/
    layouts/
      Layout.jsx
      Header.jsx
      Sidebar.jsx

  Routes.jsx
  main.jsx
```

## File Responsibilities

### `api/client/httpClient.js`

- create Axios instance
- attach base URL
- attach auth token
- handle 401 refresh flow
- normalize errors before UI sees them

### `api/query/queryClient.js`

- global TanStack Query config
- retry rules
- stale time defaults
- mutation cache behavior

### `api/auth/*`

- login, refresh, logout, me/current-user
- map backend auth payload to frontend session model
- expose hooks for login, logout, and bootstrap

### `api/dashboard/*`

- fetch dashboard widgets and summary metrics
- map backend response to stable frontend dashboard model

### `api/products/*`

- fetch product list
- fetch product details
- create product
- update product
- convert backend list and detail payloads into UI-friendly models

### `app/router/ProtectedRoute.jsx`

- block unauthorized routes
- redirect on missing or expired session
- optionally check permissions

## Recommended Implementation Order

1. Create environment config and API base URL handling.
2. Create Axios client and token manager.
3. Add TanStack Query provider at app root.
4. Build auth service, adapter, and session bootstrap.
5. Add protected route handling.
6. Connect dashboard APIs.
7. Add products module as the first full CRUD module.
8. Generalize the module pattern for inventory, sales, procurement, and reports.

## Example Implementation Patterns

These are reference patterns only. They are not final production code and do not mean the APIs are already implemented.

### Example 1. Environment config

```js
// src/app/config/env.js
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appEnv: import.meta.env.VITE_APP_ENV ?? 'development',
  requestTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT ?? 15000),
};
```

### Example 2. Axios client pattern

```js
// src/api/client/httpClient.js
import axios from 'axios';
import { env } from '../../app/config/env';

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.requestTimeoutMs,
});

httpClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Example 3. Query client pattern

```js
// src/api/query/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### Example 4. Service + adapter split

```js
// src/api/products/products.service.js
import { httpClient } from '../client/httpClient';

export async function getProducts(params) {
  const { data } = await httpClient.get('/products', { params });
  return data;
}
```

```js
// src/api/products/products.adapter.js
export function mapProductsListResponse(dto) {
  return {
    items: dto.items.map((item) => ({
      id: item.productId,
      code: item.productCode,
      name: item.description,
      stock: item.availableQty,
      status: item.isActive ? 'active' : 'inactive',
    })),
    total: dto.totalCount,
  };
}
```

### Example 5. Query hook pattern

```js
// src/api/products/useProductsQueries.js
import { useQuery } from '@tanstack/react-query';
import { getProducts } from './products.service';
import { mapProductsListResponse } from './products.adapter';

export function useProductsQuery(filters) {
  return useQuery({
    queryKey: ['products', 'list', filters],
    queryFn: async () => mapProductsListResponse(await getProducts(filters)),
  });
}
```

### Example 6. Page usage pattern

```jsx
// src/pages/ProductList.jsx
import { useProductsQuery } from '../api/products/useProductsQueries';

export default function ProductList() {
  const { data, isLoading, error } = useProductsQuery({ page: 1 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load products.</div>;

  return <div>{data.items.length} products</div>;
}
```

## API Contract Rules

- pages and components must not call Axios directly
- backend DTOs must not be used directly in UI
- every module must have:
  - service
  - adapter
  - query hooks
  - mutation hooks
- auth refresh logic must be centralized
- permissions must be checked at route and action level
- query keys must be consistent across all modules
- critical ERP mutations should prefer server-confirmed updates over optimistic updates

## Acceptance Criteria

The future implementation should be considered correct when:

- frontend can authenticate with backend
- expired access token refreshes automatically
- protected routes redirect correctly
- dashboard loads from real APIs
- one ERP module uses full service, adapter, and query-hook pattern
- no page imports Axios directly
- API base URL is fully environment-driven
- query cache invalidation works after mutations
- common loading, empty, and error states are visible and reusable

## Full Stack Flow — Auth Login (End to End)

This shows exactly how a login call travels through both stacks.

```
LoginPage.jsx
  → calls useLoginMutation()                    [frontend hook]
    → calls authService.login(username, password) [frontend service]
      → calls httpClient.post('/api/auth/login')  [axios]
        → Express route POST /api/auth/login
          → auth.controller login()               [reads req, calls service]
            → authService.loginUser()             [validates, generates tokens]
              ← returns { accessToken, refreshToken, user }
          ← res.json({ success: true, ... })
        ← axios response
      ← { accessToken, refreshToken, user }
    ← stores tokens in sessionStorage
  ← mutation success → navigate to /dashboard
```

### Frontend Auth Service Example

```js
// src/api/auth/auth.service.js
import { httpClient } from '../client/httpClient';

export async function loginRequest(username, password) {
  const { data } = await httpClient.post('/api/auth/login', { username, password });
  return data;
}

export async function refreshRequest(refreshToken) {
  const { data } = await httpClient.post('/api/auth/refresh', { refreshToken });
  return data;
}

export async function logoutRequest() {
  await httpClient.post('/api/auth/logout');
}

export async function getMeRequest() {
  const { data } = await httpClient.get('/api/auth/me');
  return data;
}
```

### Frontend Auth Mutation Hook Example

```js
// src/api/auth/useAuthMutations.js
import { useMutation } from '@tanstack/react-query';
import { loginRequest } from './auth.service';

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ username, password }) => loginRequest(username, password),
    onSuccess: (data) => {
      sessionStorage.setItem('access_token', data.accessToken);
      sessionStorage.setItem('refresh_token', data.refreshToken);
    },
  });
}
```

---

## Assumptions and Defaults

- backend remains REST-based
- backend auth will use JWT + refresh token
- current frontend remains React + Vite
- first integration focus is auth + dashboard
- next major business module is products
- online-first is enough for now
- examples in this document are reference patterns only, not final implementation code
- planned file path for this document is `ERP_frontend/API_INTEGRATION_PLAN.md`
