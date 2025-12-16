-- LibFlow Database Schema Migration
-- RFC-001: Initial Schema Setup

-- ============================================
-- 1. PROFILES TABLE
-- Extends Supabase Auth users
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = 'member'); -- Prevent self-promotion to admin

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- 2. AUTHORS TABLE
-- ============================================
CREATE TABLE public.authors (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Authors Policies (Public read, Admin write)
CREATE POLICY "Anyone can view authors"
    ON public.authors FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert authors"
    ON public.authors FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update authors"
    ON public.authors FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete authors"
    ON public.authors FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- 3. CATEGORIES TABLE
-- ============================================
CREATE TABLE public.categories (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories Policies (Public read, Admin write)
CREATE POLICY "Anyone can view categories"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert categories"
    ON public.categories FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update categories"
    ON public.categories FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete categories"
    ON public.categories FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- 4. BOOKS TABLE
-- ============================================
CREATE TABLE public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    isbn TEXT UNIQUE NOT NULL,
    author_id INT NOT NULL REFERENCES public.authors(id) ON DELETE RESTRICT,
    category_id INT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    total_copies INT NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INT NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
    cover_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT available_not_exceed_total CHECK (available_copies <= total_copies)
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Books Policies (Public read, Admin write)
CREATE POLICY "Anyone can view books"
    ON public.books FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert books"
    ON public.books FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update books"
    ON public.books FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete books"
    ON public.books FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- 5. LOANS TABLE
-- ============================================
CREATE TABLE public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
    borrow_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
    return_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Loans Policies
CREATE POLICY "Users can view their own loans"
    ON public.loans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all loans"
    ON public.loans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can create loans for themselves"
    ON public.loans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any loan"
    ON public.loans FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update their own loans"
    ON public.loans FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_books_author ON public.books(author_id);
CREATE INDEX idx_books_category ON public.books(category_id);
CREATE INDEX idx_loans_user ON public.loans(user_id);
CREATE INDEX idx_loans_book ON public.loans(book_id);
CREATE INDEX idx_loans_status ON public.loans(status);

-- ============================================
-- FUNCTION: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        'member'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Borrow a book (transaction-safe)
-- ============================================
CREATE OR REPLACE FUNCTION public.borrow_book(p_book_id UUID, p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_available INT;
    v_active_loans INT;
    v_loan_id UUID;
BEGIN
    -- Check user's active loans (max 3)
    SELECT COUNT(*) INTO v_active_loans
    FROM public.loans
    WHERE user_id = p_user_id AND status = 'active';

    IF v_active_loans >= 3 THEN
        RETURN json_build_object('success', false, 'error', 'Maximum loan limit (3) reached');
    END IF;

    -- Lock the book row and check availability
    SELECT available_copies INTO v_available
    FROM public.books
    WHERE id = p_book_id
    FOR UPDATE;

    IF v_available IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Book not found');
    END IF;

    IF v_available <= 0 THEN
        RETURN json_build_object('success', false, 'error', 'No copies available');
    END IF;

    -- Decrement available copies
    UPDATE public.books
    SET available_copies = available_copies - 1
    WHERE id = p_book_id;

    -- Create loan record
    INSERT INTO public.loans (user_id, book_id)
    VALUES (p_user_id, p_book_id)
    RETURNING id INTO v_loan_id;

    RETURN json_build_object('success', true, 'loan_id', v_loan_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Return a book
-- ============================================
CREATE OR REPLACE FUNCTION public.return_book(p_loan_id UUID)
RETURNS JSON AS $$
DECLARE
    v_book_id UUID;
    v_status TEXT;
BEGIN
    -- Get loan details
    SELECT book_id, status INTO v_book_id, v_status
    FROM public.loans
    WHERE id = p_loan_id
    FOR UPDATE;

    IF v_book_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Loan not found');
    END IF;

    IF v_status = 'returned' THEN
        RETURN json_build_object('success', false, 'error', 'Book already returned');
    END IF;

    -- Update loan
    UPDATE public.loans
    SET return_date = NOW(), status = 'returned'
    WHERE id = p_loan_id;

    -- Increment available copies
    UPDATE public.books
    SET available_copies = available_copies + 1
    WHERE id = v_book_id;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

