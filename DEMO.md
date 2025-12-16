# LibFlow Demo Setup Guide

This guide helps you set up demo data to showcase all LibFlow features.

## Quick Start

### 1. Run the Schema Migration

In Supabase SQL Editor, run these in order:
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/004_fix_rls_final.sql
```

> **Note:** If you've run previous migrations, just run 004 - it drops and recreates all RLS policies correctly.

### 2. Seed Demo Data

In Supabase SQL Editor, run:
```
supabase/seed.sql
```

This creates:
- **8 Categories**: Fiction, Sci-Fi, Fantasy, Mystery, Non-Fiction, Biography, Self-Help, History
- **12 Authors**: With detailed bios (Orwell, Austen, Tolkien, Stephen King, etc.)
- **20 Books**: With real cover images from Open Library

### 3. Create Demo Users

In Supabase Dashboard → Authentication → Users, create:

| Email | Password | Role |
|-------|----------|------|
| `admin@libflow.demo` | `demo1234` | Admin |
| `member@libflow.demo` | `demo1234` | Member |

### 4. Promote Admin User

In SQL Editor:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@libflow.demo');
```

### 5. Create Demo Loans (Optional)

Get the member's UUID:
```sql
SELECT id FROM auth.users WHERE email = 'member@libflow.demo';
```

Then create sample loans (replace `YOUR-UUID`):
```sql
DO $$
DECLARE
    member_id UUID := 'YOUR-UUID-HERE';
BEGIN
    -- Active loan: Due in 4 days
    INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, status)
    SELECT member_id, id, NOW() - INTERVAL '10 days', NOW() + INTERVAL '4 days', 'active'
    FROM books WHERE title = '1984';
    
    -- Active loan: Due in 2 days (warning)
    INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, status)
    SELECT member_id, id, NOW() - INTERVAL '12 days', NOW() + INTERVAL '2 days', 'active'
    FROM books WHERE title = 'Dune';
    
    -- Overdue loan: 5 days late
    INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, status)
    SELECT member_id, id, NOW() - INTERVAL '19 days', NOW() - INTERVAL '5 days', 'active'
    FROM books WHERE title = 'The Hobbit';
    
    -- Update book availability
    UPDATE books SET available_copies = available_copies - 1 
    WHERE title IN ('1984', 'Dune', 'The Hobbit');
    
    -- Returned loans for history
    INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, return_date, status)
    SELECT member_id, id, NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '1 week', NOW() - INTERVAL '8 days', 'returned'
    FROM books WHERE title = 'Sapiens: A Brief History of Humankind';
    
    INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, return_date, status)
    SELECT member_id, id, NOW() - INTERVAL '4 weeks', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '15 days', 'returned'
    FROM books WHERE title = 'Steve Jobs';
END $$;
```

---

## Demo Walkthrough

### As a Visitor (Not Logged In)
1. **Home Page** → See hero section, new arrivals carousel
2. **Catalog** → Browse 20 books, filter by category/author, search
3. **Book Detail** → View book info, see "Sign in to Borrow" prompt
4. Click "Get Started" → Sign up page

### As a Member (`member@libflow.demo`)
1. **Login** → Redirects to Dashboard
2. **Dashboard** → See:
   - Active loans with due dates
   - Overdue warning (red banner)
   - Due soon warning (yellow)
   - Borrowing capacity bar (X/3)
   - Reading history
3. **Catalog** → Browse and borrow books
4. **Book Detail** → 
   - Borrow available books
   - See "Already Borrowed" for current loans
   - See "Loan Limit Reached" after 3 books

### As an Admin (`   `)
1. **Login** → See "Admin" link in navbar
2. **Admin Dashboard** →
   - **Overview**: Stats cards, overdue alerts, recent activity
   - **Loan Manager**: Filter by status, search, mark returns
   - **Books**: Add/delete books, see availability
   - **Authors**: Add authors with bios
   - **Categories**: Manage genres
3. **Process Returns** → Click "Mark Returned" on any loan

---

## Features Showcase Checklist

### Authentication (F1)
- [ ] Sign up with email/password
- [ ] Login/logout
- [ ] Profile auto-creation

### Landing & Navigation (F2)
- [ ] Dynamic navbar (Admin vs Member)
- [ ] Hero section with CTAs
- [ ] New Arrivals horizontal scroll

### Book Discovery (F3)
- [ ] Search by title
- [ ] Filter by category
- [ ] Filter by author
- [ ] "Out of Stock" badge ("And Then There Were None")

### Borrowing System (F4)
- [ ] Borrow a book (decrements available_copies)
- [ ] Max 3 loans limit
- [ ] "Already Borrowed" detection
- [ ] 14-day loan period

### User Dashboard (F5)
- [ ] Active loans with due dates
- [ ] Overdue warning banners
- [ ] Reading history
- [ ] Borrowing capacity indicator

### Admin Dashboard (F6)
- [ ] Stats cards (books, loans, members)
- [ ] Loan filtering (all/active/overdue/returned)
- [ ] Mark Returned functionality
- [ ] Add/delete books, authors, categories

---

## Sample Book Covers

All books use real cover images from Open Library. If a cover doesn't load, the app shows a placeholder book icon.

## Notes

- "And Then There Were None" has 0 available copies (out of stock demo)
- Demo loans include 1 overdue, 1 due soon, and 1 normal active loan
- The member can borrow 1 more book before hitting the limit

