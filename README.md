# streak-it :

A gamified web development learning platform where users can learn from basics to advanced topics through hands-on coding challenges, a variety of structured courses, and comprehensive notes. The platform is designed to make learning web development engaging and interactive, helping users progress from beginner to expert with real coding practice and a rewarding experience.

## Features

- **Gamified Learning** - Pixel-art themed UI with activity heatmaps and progress tracking
- **Interactive Code Editor** - Built-in Monaco editor for hands-on coding practice
- **Course Management** - Structured courses with chapters and exercises
- **Premium Access** - Free tier (4 chapters) with unlimited premium subscription
- **Progress Tracking** - Track completed exercises and course completion
- **Invite Friends** - Email invitations with beautiful templates

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Authentication:** Clerk
- **Database:** Neon PostgreSQL with Drizzle ORM
- **Styling:** Tailwind CSS + Framer-motion
- **UI Components:** Radix UI + shadcn/ui
- **Email:** Nodemailer

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=


# SMTP (for email invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Custom Favicon

This project uses a custom favicon:

- **Location:** `public/fist.png`
- **Usage:** The favicon is set to use `fist.png` from the public folder. If you want to change the favicon, replace `public/fist.png` with your own image and update the `<link rel="icon">` tag in your main layout if needed.
