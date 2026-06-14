# Orvix IMS Frontend

Clean React + Vite + MUI starter migrated from the old VMS Pro frontend concept.

## What changed

- Removed Redux, Redux Toolkit, Redux Persist and React Redux.
- Replaced authentication state with `AuthContext`.
- Replaced settings loading with TanStack Query through `useSettings`.
- Added central Axios client with `withCredentials: true` and automatic 401 cleanup.
- Added client cache cleanup on logout: React Query cache, local storage keys, session storage and browser Cache API when available.
- Converted project from Create React App to Vite.
- Kept the useful MUI theme/login direction and layout approach, but removed VMS-specific modules.

## Stack

- React JS
- Vite
- MUI
- React Router
- Axios
- TanStack Query
- Context API

## Setup

```bash
npm install
npm run dev
```

Set the backend URL in `.env.development` or `.env.production`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Main files

```text
src/context/AuthContext.jsx
src/context/ToastContext.jsx
src/hooks/useSettings.js
src/services/apiClient.js
src/services/authService.js
src/services/sessionCache.js
src/MasterRoute.jsx
src/pages/Login/Login.jsx
```

## Notes

The current pages are clean Orvix IMS starter pages. Companies, Users and Inventory Tasks are already wired to service files and TanStack Query. Adjust endpoint paths in `src/util/constant.js` if backend controller paths differ.
