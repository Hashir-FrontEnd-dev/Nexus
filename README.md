# Business Nexus

A platform connecting entrepreneurs and investors for collaboration, meetings, document management, and funding.

## Features

- **Role-based Dashboards** — Separate views for entrepreneurs and investors
- **Messaging & Video Calls** — Real-time chat and WebRTC-based video calling
- **Meeting Calendar** — Availability scheduling, meeting requests, accept/decline flow
- **Document Chamber** — Upload, preview (PDF/images), sign documents with canvas-based signature pad, status tracking
- **Payments** — Mock wallet with deposit/withdraw/transfer, transaction history, funding deal flow
- **Security** — Password strength meter, 2FA OTP mock, role-based access control
- **Guided Tour** — First-time walkthrough for new users

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Lucide React (icons)
- React Hot Toast (notifications)

## Getting Started

```bash
npm install
npm run dev
```

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Entrepreneur | sarah@techwave.io | password123 |
| Investor | michael@vcinnovate.com | password123 |

Click the demo buttons on the login page to auto-fill and skip 2FA.

## Available Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint

## Routes

| Path | Description |
|---|---|
| `/login` | Login with 2FA |
| `/register` | Register with password strength meter |
| `/dashboard/entrepreneur` | Entrepreneur dashboard |
| `/dashboard/investor` | Investor dashboard |
| `/messages` | Messaging |
| `/chat/:userId` | Chat with user |
| `/video` | Video calls |
| `/meetings` | Calendar & meeting scheduling |
| `/payments` | Wallet & transactions |
| `/document-chamber` | Document upload/preview/sign |
| `/documents` | Document list |
| `/deals` | Deals |
| `/notifications` | Notifications |
| `/profile/entrepreneur/:id` | Entrepreneur profile |
| `/profile/investor/:id` | Investor profile |
| `/settings` | Settings |
| `/help` | Help & support |
