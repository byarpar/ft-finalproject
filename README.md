# A Modern Discussion Forum (AMDF) - Frontend

> Final Year Project - BSc Computer Science

| Name | Student ID | Role |
|------|------------|------|
| Yuya Moe Thet | THE24639283 | Security - Fail2Ban Brute Force Protection |
| Byar Par | PAR24639286 | Full Stack Development |

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.18-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Overview

AMDF frontend is a React single-page application that provides the forum UI for authentication, discussion threads, replies, mentions, notifications, direct messages, and admin management.

The app uses React Router for navigation, Axios for API calls, Tailwind CSS for styling, and context-driven auth state. Public, private, and admin-only routes are enforced through route wrappers.

---

## Tech Stack

- React 18.3.1
- React Router 6.26.2
- Axios 1.7.7
- Tailwind CSS 3.4.18 (+ forms plugin)
- Heroicons 2.1.5
- React Hot Toast
- Google OAuth client

---

## Quick Start

### Prerequisites

- Node.js 18+
- Backend running at `http://localhost:3001`

### Installation

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Dev server: `http://localhost:3000`

### Scripts

```bash
npm start
npm run build
npm test
```

### Environment Variables

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Routing (Actual App.js behavior)

Key routes:

- Public: `/`, `/discussions`, `/users`, `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/restore-account`, `/auth/callback`
- Private: `/discussions/new`, `/discussions/:id`, `/users/:userId`, `/profile/:username`, `/settings`, `/notifications`, `/messages`, `/chat`
- Admin: `/admin/*`
- Errors: `/500`, `*` (not found)

Auth pages list used by app logic:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/restore-account`
- `/auth/callback`

For these auth pages, navbar/footer are hidden for focused full-screen forms.

---

## Authentication Behavior (Actual code)

From `AuthContext` + Axios interceptors:

- Token is stored in localStorage.
- On app boot, token is verified through `/auth/verify`.
- If verification fails, token is cleared and user becomes unauthenticated.
- On API `401` (except login/register), interceptor clears token and redirects to `/login`.
- There is no implemented silent refresh retry pipeline in the current frontend context logic.

---

## API Client Modules

`src/services/api.js` exports:

- `authAPI`
- `wordsAPI`
- `discussionsAPI`
- `answersAPI`
- `usersAPI`
- `notificationsAPI`
- `messagesAPI`

`src/services/adminAPI.js` exports admin operations:

- dashboard stats
- users management (role/status/delete)
- reports and moderation
- analytics/system info
- categories/tags and discussion stats
- word import/export/template endpoints

---

## Core UI Structure

- `LayoutComponents.js`: Navbar, Footer, PageLayout, mobile menu, user action menu
- `AuthComponents.js`: PrivateRoute, AdminRoute, auth field helpers
- `DiscussionComponents.js`: voting controls, discussion status actions, answer helpers
- `UI/MentionInput.js`: debounced `@mention` suggestions + keyboard navigation

Reusable hooks:

- `useAuthForm`
- `useClickOutside`
- `useDiscussionThread`
- `useMobileDetect`

---

## Security Notes

- Markdown/user content rendering is sanitized with DOMPurify.
- API auth uses Bearer tokens in `Authorization` header.
- Route-level protection via `PrivateRoute` and `AdminRoute`.
- Validation helpers are used client-side and mirrored by backend Joi schemas.

---

## Project Structure

```text
frontend/
  public/
  src/
    App.js
    components/
    contexts/
    hooks/
    pages/
    services/
    utils/
  tailwind.config.js
  package.json
```

---

## License

MIT
