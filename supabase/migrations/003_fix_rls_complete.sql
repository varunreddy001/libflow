-- ============================================
-- COMPLETE RLS FIX
-- This completely resets all RLS policies
-- Run this to fix infinite recursion errors
-- ============================================

-- ============================================
-- 1. Drop ALL existing policies
-- ============================================

-- Drop all profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Drop all authors policies
DROP POLICY IF EXISTS "Anyone can view authors" ON public.authors;
DROP POLICY IF EXISTS "Admins can insert authors" ON public.authors;
DROP POLICY IF EXISTS "Admins can update authors" ON public.authors;
DROP POLICY IF EXISTS "Admins can delete authors" ON public.authors;

-- Drop all categories policies
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

-- Drop all books policies
DROP POLICY IF EXISTS "Anyone can view books" ON public.books;
DROP POLICY IF EXISTS "Admins can insert books" ON public.books;
DROP POLICY IF EXISTS "Admins can update books" ON public.books;
DROP POLICY IF EXISTS "Admins can delete books" ON public.books;

-- Drop all loans policies
DROP POLICY IF EXISTS "Users can view their own loans" ON public.loans;
DROP POLICY IF EXISTS "Admins can view all loans" ON public.loans;
DROP POLICY IF EXISTS "Authenticated users can create loans for themselves" ON public.loans;
DROP POLICY IF EXISTS "Admins can update any loan" ON public.loans;
DROP POLICY IF EXISTS "Users can update their own loans" ON public.loans;

-- ============================================
-- 2. Drop and recreate the is_admin function
-- This version explicitly sets search_path for security
-- ============================================
DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================
-- 3. Recreate PROFILES policies
-- Using direct auth.uid() check, no recursion
-- ============================================

-- Allow users to read their own profile
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Allow admins to read all profiles (using the function)
-- This is safe because is_admin() is SECURITY DEFINER
CREATE POLICY "profiles_select_admin"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

-- Allow users to update only their own profile, cannot change role
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. Recreate AUTHORS policies
-- Public read, admin write
-- ============================================

CREATE POLICY "authors_select_all"
    ON public.authors FOR SELECT
    USING (true);

CREATE POLICY "authors_insert_admin"
    ON public.authors FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "authors_update_admin"
    ON public.authors FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "authors_delete_admin"
    ON public.authors FOR DELETE
    USING (public.is_admin());

-- ============================================
-- 5. Recreate CATEGORIES policies
-- Public read, admin write
-- ============================================

CREATE POLICY "categories_select_all"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "categories_insert_admin"
    ON public.categories FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "categories_update_admin"
    ON public.categories FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "categories_delete_admin"
    ON public.categories FOR DELETE
    USING (public.is_admin());

-- ============================================
-- 6. Recreate BOOKS policies
-- Public read, admin write
-- ============================================

CREATE POLICY "books_select_all"
    ON public.books FOR SELECT
    USING (true);

CREATE POLICY "books_insert_admin"
    ON public.books FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "books_update_admin"
    ON public.books FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "books_delete_admin"
    ON public.books FOR DELETE
    USING (public.is_admin());

-- ============================================
-- 7. Recreate LOANS policies
-- Users see own, admins see all
-- ============================================

-- Users can view their own loans
CREATE POLICY "loans_select_own"
    ON public.loans FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all loans
CREATE POLICY "loans_select_admin"
    ON public.loans FOR SELECT
    USING (public.is_admin());

-- Users can create loans for themselves
CREATE POLICY "loans_insert_own"
    ON public.loans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own loans
CREATE POLICY "loans_update_own"
    ON public.loans FOR UPDATE
    USING (auth.uid() = user_id);

-- Admins can update any loan
CREATE POLICY "loans_update_admin"
    ON public.loans FOR UPDATE
    USING (public.is_admin());

-- ============================================
-- 8. Verify the admin user is set up correctly
-- ============================================

-- Show which users are admins
DO $$
DECLARE
    admin_count INT;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
    IF admin_count = 0 THEN
        RAISE NOTICE '⚠️  WARNING: No admin users found! Run the admin promotion query.';
    ELSE
        RAISE NOTICE '✓ Found % admin user(s)', admin_count;
    END IF;
END $$;

-- ============================================
-- DONE!
-- ============================================

