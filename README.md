# A Modern Discussion Forum — Frontend

> **Final Year Project** — BSc Computer Science

| Presenter | Student ID | Role |
|-----------|------------|------|
| Yuya Moe Thet | THE24639283 | Security & Backend Development |
| Byar Par | PAR24639286 | Front & Backend Development |

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.18-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Problem Statement

Developer communities are scattered across multiple platforms, making it difficult to find reliable programming discussions in one place. Many existing forums have outdated interfaces and poor user experience. Login systems are also vulnerable to brute force attacks, putting user accounts at risk.

**Who benefits:** Developers · Computer Science Students · Tech Communities · Website Administrators

---

## Project Aim

To develop a modern and secure online discussion forum where developers can share knowledge, ask questions, and collaborate safely.

### Objectives

- Develop a responsive web forum using modern technologies
- Implement user registration and login authentication
- Enable users to create and interact with discussion posts
- Provide Google OAuth login functionality
- Protect the login system using Fail2Ban to prevent brute force attacks
- Monitor and block malicious IP addresses automatically

---

## Role Allocation

**Yuya Moe Thet (THE24639283) — Security & Backend Development**
- Configure Fail2Ban for brute force protection
- Setup and manage server security
- Assist with backend API development

**Byar Par (PAR24639286) — Front & Backend Development**
- Develop user interface using React.js
- Design responsive layout with Tailwind CSS
- Implement login and forum pages
- Connect frontend to backend APIs

---

## Overview

**A Modern Discussion Forum** provides a centralized platform for developers to share knowledge with a modern, responsive interface built with React.js and Tailwind CSS.

**Key frontend features:**
- Threaded discussions with voting, @mentions, and markdown rendering (DOMPurify-sanitised)
- AuthContext with JWT + Google OAuth — protected and admin-only routing
- 22-category tag taxonomy for discussion discoverability
- Admin dashboard with user management, reports, and analytics charts
- Responsive mobile-first layout with Tailwind CSS

**Tech stack:** React 18.3.1 · React Router 6.26.2 · Tailwind CSS 3.4.18 · Axios 1.7.7 · DOMPurify 3.3.0 · Chart.js 4.4.6 · React Hot Toast 2.4.1 · Google OAuth (`@react-oauth/google`) · Heroicons 2.1.5

---

## Quick Start

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:5000` (see [backend README](../backend/README.md))

### Installation

```bash
git clone https://github.com/byarpar/ft-finalproject.git
cd ft-finalproject
npm install
cp .env.example .env
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── images/
├── src/
│   ├── components/
│   │   ├── AdminComponents.js       # Admin panel UI
│   │   ├── AuthComponents.js        # PrivateRoute, AdminRoute
│   │   ├── DiscussionComponents.js  # Discussion cards, thread views
│   │   ├── LayoutComponents.js      # Navbar, Footer, PageLayout
│   │   ├── UIComponents.js          # Shared primitives
│   │   ├── Discussion/              # Discussion-specific components
│   │   └── UI/
│   │       └── MentionInput.js      # @mention input with live suggestions
│   ├── contexts/
│   │   └── AuthContext.js           # Global auth state, JWT handling
│   ├── hooks/
│   │   ├── useAuthForm.js
│   │   ├── useClickOutside.js
│   │   ├── useDebounce.js
│   │   ├── useDiscussionThread.js
│   │   └── useMobileDetect.js
│   ├── pages/
│   │   ├── Discussions.js           # Discussion listing with filters
│   │   ├── DiscussionThread.js      # Single thread + answers + replies
│   │   ├── NewDiscussion.js         # Create discussion with tags
│   │   ├── Members.js               # Member directory
│   │   ├── UserProfile.js           # Public user profiles
│   │   ├── Settings.js              # Account settings
│   │   ├── Notifications.js         # Notification centre
│   │   ├── Messages.js              # Direct messages
│   │   ├── AdminDashboard.js        # Admin panel — users, reports, analytics
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── VerifyEmail.js
│   │   ├── ForgotPassword.js
│   │   ├── ResetPassword.js
│   │   ├── RestoreAccount.js        # 30-day grace period account restore
│   │   ├── AuthCallback.js          # Google OAuth callback handler
│   │   ├── NotFound.js
│   │   └── ServerError.js
│   ├── services/
│   │   ├── api.js                   # Axios instance — Bearer token interceptor
│   │   ├── adminAPI.js
│   │   └── userService.js
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── formHandlers.js
│   │   ├── imageUtils.js            # normalizeImages() / normalizeAnswerImages()
│   │   ├── markdownUtils.js         # Marked + DOMPurify sanitisation
│   │   ├── mentionUtils.js          # extractMentions() + normalizeMentions()
│   │   ├── navigationHelpers.js
│   │   └── validation.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── tailwind.config.js
└── package.json
```

---

## Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Discussions listing | Public |
| `/discussions` | Discussions listing | Public |
| `/discussions/:id` | Discussion thread | Public |
| `/discussions/new` | Create discussion | Private |
| `/users` | Members directory | Public |
| `/users/:userId` | User profile | Public |
| `/notifications` | Notification centre | Private |
| `/messages` | Direct messages | Private |
| `/settings` | Account settings | Private |
| `/admin/*` | Admin dashboard | Admin only |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/verify-email` | Email verification | Public |
| `/forgot-password` | Password reset request | Public |
| `/reset-password` | Set new password | Public |
| `/restore-account` | Restore soft-deleted account | Public |
| `/auth/callback` | Google OAuth callback | Public |

---

## Key Implementation Details

### Authentication (AuthContext)
- JWT stored in memory; refresh token in HTTP-only cookie
- Every API request via Axios interceptor attaches `Authorization: Bearer <token>`
- On 401 response: auto-refresh attempted; on failure, user redirected to `/login`
- `PrivateRoute` and `AdminRoute` enforce access at the router level

### Markdown + XSS Prevention
- User content rendered via `marked` → sanitised with DOMPurify 3.3.0 before DOM insertion
- Addresses OWASP A03 (XSS) for all user-generated content

### @Mention System
- `MentionInput` component queries `/api/users/mention-suggestions` with debounce
- `extractMentions()` parses `@username` tokens; `normalizeMentions()` resolves to UUIDs before API submit
- Backend `mentionUtils.js` validates mentions against DB before notification insert

### Admin Dashboard
- Charts via Chart.js 4.4.6 — discussion trends, user growth, category distribution
- User management: status toggle, role assignment, soft-delete
- Reports queue: view reported content, resolve/dismiss
- Audit log viewer: `old_values`, `new_values`, `ip_address` per change

---

## Security

| Control | Implementation |
|---------|---------------|
| XSS | DOMPurify 3.3.0 on all markdown output |
| CSRF | Bearer token (not cookie) for API auth |
| Input validation | Client-side validation mirrors Joi server schemas |
| Google OAuth | Server-side code exchange via backend (not client-side implicit flow) |

---

## Scripts

```bash
npm start        # development server (port 3000)
npm run build    # optimised production build → build/
npm test         # run tests
```

---

## Testing

22 functional test cases — all user journeys:
- Guest flows: register, login, Google OAuth, browse, forgot/reset password, email verify
- Registered user: create discussion, post answer, vote, @mention, save, notifications, settings
- Admin: user management, reports resolution, analytics dashboard

Usability evaluation: 5 participants × 4 tasks — task completion rate + qualitative feedback

---

## License

MIT
