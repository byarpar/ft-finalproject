# A Modern Discussion Forum — Frontend

React-based frontend for A Modern Discussion Forum, a community platform for threaded discussions, Q&A, and member interaction.

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.18-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Overview

A clean, responsive single-page application built with React. Users can browse and post discussions, answer questions, interact with community members, manage their profiles, and receive notifications.

**Tech stack:** React 18 · React Router 6 · Tailwind CSS · Axios · Chart.js · React Hot Toast · Google OAuth

---

## Quick Start

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:5000` (see [backend README](../backend/README.md))

### Installation

```bash
cd frontend
npm install
cp .env.example .env   # configure environment variables
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env` file in `frontend/`:

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
│   │   ├── AdminComponents.js      # Admin panel components
│   │   ├── AuthComponents.js       # PrivateRoute, AdminRoute
│   │   ├── DiscussionComponents.js # Discussion cards, thread views
│   │   ├── LayoutComponents.js     # Navbar, Footer, PageLayout
│   │   ├── UIComponents.js         # Shared UI primitives
│   │   ├── Discussion/             # Discussion-specific components
│   │   └── UI/                     # MentionInput and other UI pieces
│   ├── contexts/
│   │   └── AuthContext.js          # Global auth state
│   ├── hooks/
│   │   ├── useAuthForm.js
│   │   ├── useClickOutside.js
│   │   ├── useDebounce.js
│   │   ├── useDiscussionThread.js
│   │   └── useMobileDetect.js
│   ├── pages/
│   │   ├── Discussions.js          # Discussion listing
│   │   ├── DiscussionThread.js     # Single discussion + answers
│   │   ├── NewDiscussion.js        # Create discussion
│   │   ├── Members.js              # Member directory
│   │   ├── UserProfile.js          # User profile page
│   │   ├── Settings.js             # Account settings
│   │   ├── Notifications.js        # Notification center
│   │   ├── Messages.js             # Direct messages
│   │   ├── AdminDashboard.js       # Admin panel
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── VerifyEmail.js
│   │   ├── ForgotPassword.js
│   │   ├── ResetPassword.js
│   │   ├── RestoreAccount.js
│   │   ├── AuthCallback.js
│   │   ├── NotFound.js
│   │   └── ServerError.js
│   ├── services/
│   │   ├── api.js                  # Axios instance with interceptors
│   │   ├── adminAPI.js             # Admin endpoints
│   │   └── userService.js          # User endpoints
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── formHandlers.js
│   │   ├── imageUtils.js
│   │   ├── markdownUtils.js
│   │   ├── mentionUtils.js
│   │   ├── navigationHelpers.js
│   │   └── validation.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── tailwind.config.js
└── package.json
```

---

## Pages & Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Discussions | Public |
| `/discussions` | Discussion listing | Public |
| `/discussions/:id` | Discussion thread | Public |
| `/discussions/new` | Create discussion | Private |
| `/users` | Members directory | Public |
| `/users/:userId` | User profile | Public |
| `/notifications` | Notifications | Private |
| `/messages` | Direct messages | Private |
| `/settings` | Account settings | Private |
| `/admin/*` | Admin dashboard | Admin |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/verify-email` | Email verification | Public |
| `/forgot-password` | Password reset request | Public |
| `/reset-password` | Set new password | Public |
| `/restore-account` | Restore deleted account | Public |

---

## Features

- **Discussions** — create, browse, filter, and vote on threaded discussions
- **Answers** — post answers, vote, and mark best answer
- **Mentions** — `@username` mention support with live suggestions
- **Markdown** — rich text content with markdown rendering
- **Notifications** — real-time notification center
- **Members** — searchable member directory with profiles
- **Admin dashboard** — user management, reports, and analytics
- **Google OAuth** — sign in with Google
- **Responsive** — mobile-first layout with Tailwind CSS

---

## Scripts

```bash
npm start        # development server (port 3000)
npm run build    # production build → build/
npm test         # run tests
```

---

## License

MIT
