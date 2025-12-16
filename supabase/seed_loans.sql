-- ============================================
-- LibFlow Demo Loans Setup
-- Run this AFTER creating demo users in Supabase Auth
-- ============================================

-- ============================================
-- INSTRUCTIONS:
-- 1. First, create two users in Supabase Auth Dashboard:
--    - admin@libflow.demo (password: demo1234)
--    - member@libflow.demo (password: demo1234)
-- 
-- 2. Get the member user's UUID from the auth.users table
-- 
-- 3. Replace 'MEMBER_USER_ID' below with the actual UUID
-- 
-- 4. Run this script to create demo loans
-- ============================================

-- Promote admin user
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@libflow.demo');

-- ============================================
-- Create sample loans for demo member
-- Replace MEMBER_USER_ID with actual UUID!
-- ============================================

-- To find the member's UUID, run:
-- SELECT id, email FROM auth.users WHERE email = 'member@libflow.demo';

-- Then uncomment and update the queries below:

/*
-- Active loan 1: Due in 4 days (normal)
INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, status)
SELECT 
    'MEMBER_USER_ID'::uuid,
    id,
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '4 days',
    'active'
FROM books 
WHERE title = '1984';

-- Active loan 2: Due in 2 days (due soon - yellow warning)
INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, status)
SELECT 
    'MEMBER_USER_ID'::uuid,
    id,
    NOW() - INTERVAL '12 days',
    NOW() + INTERVAL '2 days',
    'active'
FROM books 
WHERE title = 'Dune';

-- Active loan 3: Overdue by 5 days (red warning)
INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, status)
SELECT 
    'MEMBER_USER_ID'::uuid,
    id,
    NOW() - INTERVAL '19 days',
    NOW() - INTERVAL '5 days',
    'active'
FROM books 
WHERE title = 'The Hobbit';

-- Update available_copies for borrowed books
UPDATE books SET available_copies = available_copies - 1 WHERE title = '1984';
UPDATE books SET available_copies = available_copies - 1 WHERE title = 'Dune';
UPDATE books SET available_copies = available_copies - 1 WHERE title = 'The Hobbit';

-- Past loan 1: Returned 1 week ago
INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, return_date, status)
SELECT 
    'MEMBER_USER_ID'::uuid,
    id,
    NOW() - INTERVAL '3 weeks',
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '8 days',
    'returned'
FROM books 
WHERE title = 'Sapiens: A Brief History of Humankind';

-- Past loan 2: Returned 2 weeks ago
INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, return_date, status)
SELECT 
    'MEMBER_USER_ID'::uuid,
    id,
    NOW() - INTERVAL '4 weeks',
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '15 days',
    'returned'
FROM books 
WHERE title = 'Steve Jobs';
*/

-- ============================================
-- QUICK SETUP (if you know the UUID)
-- Replace the UUID and run this single command:
-- ============================================

/*
DO $$
DECLARE
    member_id UUID := 'PASTE-YOUR-MEMBER-UUID-HERE';
BEGIN
    -- Active loans
    INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, status)
    SELECT member_id, id, NOW() - INTERVAL '10 days', NOW() + INTERVAL '4 days', 'active'
    FROM books WHERE title = '1984';
    
    INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, status)
    SELECT member_id, id, NOW() - INTERVAL '12 days', NOW() + INTERVAL '2 days', 'active'
    FROM books WHERE title = 'Dune';
    
    INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, status)
    SELECT member_id, id, NOW() - INTERVAL '19 days', NOW() - INTERVAL '5 days', 'active'
    FROM books WHERE title = 'The Hobbit';
    
    -- Update availability
    UPDATE books SET available_copies = available_copies - 1 WHERE title IN ('1984', 'Dune', 'The Hobbit');
    
    -- Returned loans
    INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, return_date, status)
    SELECT member_id, id, NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '1 week', NOW() - INTERVAL '8 days', 'returned'
    FROM books WHERE title = 'Sapiens: A Brief History of Humankind';
    
    INSERT INTO public.loans (user_id, book_id, borrow_date, due_date, return_date, status)
    SELECT member_id, id, NOW() - INTERVAL '4 weeks', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '15 days', 'returned'
    FROM books WHERE title = 'Steve Jobs';
    
    RAISE NOTICE '✓ Created 3 active loans (1 overdue, 1 due soon, 1 normal)';
    RAISE NOTICE '✓ Created 2 returned loans for history';
END $$;
*/

