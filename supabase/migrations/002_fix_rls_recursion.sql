-- ============================================
-- FIX: Infinite Recursion in RLS Policies
-- Run this AFTER 001_initial_schema.sql
-- ============================================

-- ============================================
-- 1. Create helper function to check admin status
-- Uses SECURITY DEFINER to bypass RLS
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 2. Drop problematic policies
-- ============================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all loans" ON public.loans;
DROP POLICY IF EXISTS "Admins can insert authors" ON public.authors;
DROP POLICY IF EXISTS "Admins can update authors" ON public.authors;
DROP POLICY IF EXISTS "Admins can delete authors" ON public.authors;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert books" ON public.books;
DROP POLICY IF EXISTS "Admins can update books" ON public.books;
DROP POLICY IF EXISTS "Admins can delete books" ON public.books;
DROP POLICY IF EXISTS "Admins can update any loan" ON public.loans;

-- ============================================
-- 3. Recreate policies using is_admin() function
-- ============================================

-- Profiles: Admins can view all
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

-- Authors: Admin write access
CREATE POLICY "Admins can insert authors"
    ON public.authors FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update authors"
    ON public.authors FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete authors"
    ON public.authors FOR DELETE
    USING (public.is_admin());

-- Categories: Admin write access
CREATE POLICY "Admins can insert categories"
    ON public.categories FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories"
    ON public.categories FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete categories"
    ON public.categories FOR DELETE
    USING (public.is_admin());

-- Books: Admin write access
CREATE POLICY "Admins can insert books"
    ON public.books FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update books"
    ON public.books FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete books"
    ON public.books FOR DELETE
    USING (public.is_admin());

-- Loans: Admin access
CREATE POLICY "Admins can view all loans"
    ON public.loans FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update any loan"
    ON public.loans FOR UPDATE
    USING (public.is_admin());

-- ============================================
-- Done! The recursion is now fixed.
-- ============================================

