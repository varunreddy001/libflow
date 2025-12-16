# LibFlow - Library Management System

A modern web-based Library Management System built with React, Vite, and Supabase.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Icons:** Lucide React
- **Routing:** React Router DOM v6

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration in your Supabase SQL Editor:
   - Navigate to `supabase/migrations/001_initial_schema.sql`
   - Copy the contents and execute in your Supabase SQL Editor

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Base components (Button, Input, Card)
│   ├── Layout.tsx    # Main layout wrapper
│   ├── Navbar.tsx    # Navigation component
│   └── ProtectedRoute.tsx
├── contexts/         # React Context providers
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── lib/              # External service clients
│   └── supabase.ts
├── pages/            # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Catalog.tsx
│   ├── BookDetail.tsx
│   ├── Dashboard.tsx
│   └── AdminDashboard.tsx
├── types/            # TypeScript type definitions
│   └── database.ts
├── App.tsx           # Main app with routes
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Features

- **Authentication:** Sign up, login, logout with Supabase Auth
- **Book Catalog:** Browse, search, and filter books by category/author
- **Borrowing System:** Borrow books with automatic availability tracking
- **User Dashboard:** Track active loans and history
- **Admin Dashboard:** Manage inventory, process returns, view stats

## Database Schema

The app uses 5 core tables:
- `profiles` - User profiles (extends Supabase Auth)
- `authors` - Book authors
- `categories` - Book categories
- `books` - Book inventory
- `loans` - Borrowing records

See `supabase/migrations/001_initial_schema.sql` for the full schema with RLS policies.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT
