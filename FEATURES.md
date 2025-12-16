# Features List

## F1: Authentication System
- **Sign Up:** User provides Email, Password, Full Name. System auto-creates `auth.user` AND `public.profiles` entry. Default role is 'member'.
- **Login:** Email/Password login.
- **Logout:** Secure session termination.

## F2: Landing & Navigation
- **Navbar:** Dynamic links based on role (Admin vs Member).
- **Hero Section:** Welcome message and "Browse Now" button.
- **New Arrivals:** Horizontal scroll of 5 most recent books.

## F3: Book Discovery (Catalog)
- **Filter:** Filter books by Category or Author.
- **Search:** Text search by Title.
- **Availability Indicator:** Show "Out of Stock" badge if `available_copies` is 0.

## F4: Borrowing System (Core Logic)
- **Action:** Authenticated user clicks "Borrow" on Book Detail page.
- **Backend Check:** Database transaction -> 1. Check `available_copies > 0`. 2. Decrement `available_copies`. 3. Insert row into `loans`.
- **Limit:** (Optional) Max 3 active loans per user.

## F5: User Dashboard
- **Active Loans:** List books currently borrowed with Due Date.
- **History:** List previously returned books.

## F6: Admin Dashboard
- **Stats Cards:** Total Books, Active Loans, Total Members.
- **Inventory Management:** Add/Edit Books forms.
- **Return Processing:** Admin views table of active loans -> clicks "Mark Returned" -> System updates `loans.return_date` and increments `books.available_copies`.