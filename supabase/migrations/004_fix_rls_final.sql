-- ============================================
-- FINAL RLS FIX - Proper Policy Structure
-- The key insight: Combine user's own access and admin access
-- into a SINGLE policy to avoid recursion
-- ============================================

-- ============================================
-- 1. Drop ALL existing policies on profiles
-- ============================================
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- ============================================
-- 2. Drop and recreate is_admin as a SECURITY DEFINER function
-- that directly queries the profiles table WITHOUT triggering RLS
-- ============================================
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- This function bypasses RLS because it's SECURITY DEFINER
-- and runs as the function owner (postgres/superuser)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Directly query with schema qualification to avoid search_path issues
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role = 'admin', false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ============================================
-- 3. Create SINGLE combined policy for profiles SELECT
-- This avoids the recursion issue by using OR logic in one policy
-- ============================================
CREATE POLICY "profiles_select_policy"
    ON public.profiles FOR SELECT
    USING (
        -- User can always read their own profile
        auth.uid() = id
        OR
        -- Admins can read all profiles (checked via SECURITY DEFINER function)
        public.is_admin()
    );

-- Users can update only their own profile
CREATE POLICY "profiles_update_policy"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow inserts from trigger (service role)
CREATE POLICY "profiles_insert_policy"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. Recreate other table policies (these should be fine)
-- ============================================

-- Drop and recreate AUTHORS policies
DROP POLICY IF EXISTS "authors_select_all" ON public.authors;
DROP POLICY IF EXISTS "authors_insert_admin" ON public.authors;
DROP POLICY IF EXISTS "authors_update_admin" ON public.authors;
DROP POLICY IF EXISTS "authors_delete_admin" ON public.authors;
DROP POLICY IF EXISTS "Anyone can view authors" ON public.authors;
DROP POLICY IF EXISTS "Admins can insert authors" ON public.authors;
DROP POLICY IF EXISTS "Admins can update authors" ON public.authors;
DROP POLICY IF EXISTS "Admins can delete authors" ON public.authors;

CREATE POLICY "authors_select" ON public.authors FOR SELECT USING (true);
CREATE POLICY "authors_insert" ON public.authors FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "authors_update" ON public.authors FOR UPDATE USING (public.is_admin());
CREATE POLICY "authors_delete" ON public.authors FOR DELETE USING (public.is_admin());

-- Drop and recreate CATEGORIES policies
DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON public.categories;
DROP POLICY IF EXISTS "categories_update_admin" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

CREATE POLICY "categories_select" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_insert" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "categories_update" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "categories_delete" ON public.categories FOR DELETE USING (public.is_admin());

-- Drop and recreate BOOKS policies
DROP POLICY IF EXISTS "books_select_all" ON public.books;
DROP POLICY IF EXISTS "books_insert_admin" ON public.books;
DROP POLICY IF EXISTS "books_update_admin" ON public.books;
DROP POLICY IF EXISTS "books_delete_admin" ON public.books;
DROP POLICY IF EXISTS "Anyone can view books" ON public.books;
DROP POLICY IF EXISTS "Admins can insert books" ON public.books;
DROP POLICY IF EXISTS "Admins can update books" ON public.books;
DROP POLICY IF EXISTS "Admins can delete books" ON public.books;

CREATE POLICY "books_select" ON public.books FOR SELECT USING (true);
CREATE POLICY "books_insert" ON public.books FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "books_update" ON public.books FOR UPDATE USING (public.is_admin());
CREATE POLICY "books_delete" ON public.books FOR DELETE USING (public.is_admin());

-- Drop and recreate LOANS policies
DROP POLICY IF EXISTS "loans_select_own" ON public.loans;
DROP POLICY IF EXISTS "loans_select_admin" ON public.loans;
DROP POLICY IF EXISTS "loans_insert_own" ON public.loans;
DROP POLICY IF EXISTS "loans_update_own" ON public.loans;
DROP POLICY IF EXISTS "loans_update_admin" ON public.loans;
DROP POLICY IF EXISTS "Users can view their own loans" ON public.loans;
DROP POLICY IF EXISTS "Admins can view all loans" ON public.loans;
DROP POLICY IF EXISTS "Authenticated users can create loans for themselves" ON public.loans;
DROP POLICY IF EXISTS "Users can update their own loans" ON public.loans;
DROP POLICY IF EXISTS "Admins can update any loan" ON public.loans;

-- Combined SELECT policy for loans
CREATE POLICY "loans_select" 
    ON public.loans FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "loans_insert" 
    ON public.loans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Combined UPDATE policy for loans
CREATE POLICY "loans_update" 
    ON public.loans FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin());

-- ============================================
-- 5. Verify setup
-- ============================================
DO $$
DECLARE
    policy_count INT;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles';
    
    RAISE NOTICE 'Profiles table has % policies', policy_count;
    
    -- List all policies for verification
    FOR policy_count IN 
        SELECT 1 FROM pg_policies WHERE schemaname = 'public'
    LOOP
        -- Just counting
    END LOOP;
END $$;

SELECT 'RLS policies updated successfully!' as status;

