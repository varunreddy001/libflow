# Product Requirements Document (PRD): LibFlow Library System

## 1. Project Overview
**Name:** LibFlow
**Description:** A web-based Library Management System that allows users to browse and borrow books, and administrators to manage inventory and track loans.
**Core Value:** Simplifies the borrowing process for members and provides a centralized inventory tracking system for library admins.

## 2. Goals & Success Metrics
- **User Goal:** Search for a book, view availability, and borrow it within 3 clicks.
- **Admin Goal:** Add a new book to inventory in under 1 minute; mark returned books instantly.
- **System Goal:** accurate real-time tracking of `available_copies` vs `total_copies`.

## 3. Tech Stack & Architecture
- **Frontend:** React (Vite) + Tailwind CSS
- **Routing:** React Router DOM (v6+)
- **Icons:** Lucide React
- **Backend/Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Email/Password)
- **State Management:** React Context API (for Auth and Toast notifications)

## 4. Database Schema (Supabase)
The system relies on 5 core tables.

### 1. `profiles`
- Extends Supabase Auth.
- `id`: uuid (Primary Key, references auth.users)
- `full_name`: text
- `role`: text (Check constraint: 'admin' OR 'member')
- `created_at`: timestamp

### 2. `authors`
- `id`: int (Primary Key, Identity)
- `name`: text (Unique)
- `bio`: text
- `created_at`: timestamp

### 3. `categories`
- `id`: int (Primary Key, Identity)
- `name`: text (Unique) (e.g., 'Sci-Fi', 'Non-Fiction')

### 4. `books`
- `id`: uuid (Primary Key, default gen_random_uuid())
- `title`: text
- `isbn`: text (Unique)
- `author_id`: int (Foreign Key -> authors.id)
- `category_id`: int (Foreign Key -> categories.id)
- `total_copies`: int (Default 1)
- `available_copies`: int (Logic: Must never exceed total_copies)
- `cover_url`: text (URL string)
- `description`: text

### 5. `loans`
- `id`: uuid (Primary Key)
- `user_id`: uuid (Foreign Key -> profiles.id)
- `book_id`: uuid (Foreign Key -> books.id)
- `borrow_date`: timestamp (Default now())
- `due_date`: timestamp (Logic: borrow_date + 14 days)
- `return_date`: timestamp (Nullable. If null, book is still out)
- `status`: text (Computed or managed: 'active', 'returned', 'overdue')

## 5. Security & RLS (Row Level Security)
- **Public Read:** Books, Authors, Categories.
- **Authenticated Read:** Own Profile, Own Loans.
- **Admin Full Access:** Can create/update/delete Books, Authors, Categories; Can view all Loans; Can update Loan status.