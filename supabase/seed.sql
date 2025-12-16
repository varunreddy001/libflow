-- ============================================
-- LibFlow Demo Seed Data
-- Run this in Supabase SQL Editor AFTER the schema migration
-- ============================================

-- ============================================
-- 1. CATEGORIES (8 genres)
-- ============================================
INSERT INTO public.categories (name) VALUES
    ('Fiction'),
    ('Science Fiction'),
    ('Fantasy'),
    ('Mystery & Thriller'),
    ('Non-Fiction'),
    ('Biography'),
    ('Self-Help'),
    ('History')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. AUTHORS (12 authors with bios)
-- ============================================
INSERT INTO public.authors (name, bio) VALUES
    ('George Orwell', 'Eric Arthur Blair, known by his pen name George Orwell, was an English novelist, essayist, and critic. His work is characterized by lucid prose, social criticism, and opposition to totalitarianism.'),
    ('Jane Austen', 'Jane Austen was an English novelist known primarily for her six major novels, which interpret, critique and comment upon the British landed gentry at the end of the 18th century.'),
    ('Frank Herbert', 'Frank Patrick Herbert Jr. was an American science-fiction author best known for the 1965 novel Dune and its five sequels.'),
    ('Agatha Christie', 'Dame Agatha Mary Clarissa Christie was an English writer known for her 66 detective novels and 14 short story collections, particularly those revolving around Hercule Poirot and Miss Marple.'),
    ('J.R.R. Tolkien', 'John Ronald Reuel Tolkien was an English writer, poet, philologist, and academic, best known as the author of The Hobbit and The Lord of the Rings.'),
    ('Stephen King', 'Stephen Edwin King is an American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels. His books have sold more than 350 million copies worldwide.'),
    ('Malcolm Gladwell', 'Malcolm Timothy Gladwell is a Canadian journalist, author, and public speaker. He has written seven books, including The Tipping Point, Blink, and Outliers.'),
    ('Walter Isaacson', 'Walter Seff Isaacson is an American author and journalist. He is the author of acclaimed biographies of Steve Jobs, Benjamin Franklin, Albert Einstein, and Elon Musk.'),
    ('Marcus Aurelius', 'Marcus Aurelius Antoninus was Roman emperor from 161 to 180 AD and a Stoic philosopher. His personal writings, known as Meditations, are a significant source of Stoic philosophy.'),
    ('Yuval Noah Harari', 'Yuval Noah Harari is an Israeli public intellectual, historian and professor. He is the author of the bestselling books Sapiens: A Brief History of Humankind and Homo Deus.'),
    ('Brandon Sanderson', 'Brandon Winn Sanderson is an American author of epic fantasy and science fiction. He is best known for the Cosmere fictional universe and completing The Wheel of Time series.'),
    ('Michelle Obama', 'Michelle LaVaughn Robinson Obama is an American attorney and author who served as the first lady of the United States from 2009 to 2017. Her memoir Becoming is a worldwide bestseller.')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. BOOKS (20 books with covers)
-- Using Open Library covers
-- ============================================

-- Fiction
INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('1984', '978-0451524935', 
     (SELECT id FROM authors WHERE name = 'George Orwell'), 
     (SELECT id FROM categories WHERE name = 'Fiction'),
     5, 3,
     'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
     'A dystopian novel set in a totalitarian society ruled by Big Brother. Winston Smith works for the Ministry of Truth, rewriting history, but secretly dreams of rebellion against the oppressive regime. Orwell''s masterpiece remains terrifyingly relevant in our modern age of surveillance and doublespeak.')
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('Pride and Prejudice', '978-0141439518',
     (SELECT id FROM authors WHERE name = 'Jane Austen'),
     (SELECT id FROM categories WHERE name = 'Fiction'),
     4, 4,
     'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
     'The romantic clash between the opinionated Elizabeth Bennet and the proud Mr. Darcy. A witty comedy of manners that remains one of the most beloved novels in the English language, exploring themes of love, reputation, and class.')
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('Animal Farm', '978-0451526342',
     (SELECT id FROM authors WHERE name = 'George Orwell'),
     (SELECT id FROM categories WHERE name = 'Fiction'),
     3, 2,
     'https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg',
     'A satirical allegorical novella reflecting events leading up to the Russian Revolution. The animals of Manor Farm revolt against their human masters, only to see their revolution betrayed from within.')
ON CONFLICT (isbn) DO NOTHING;

-- Science Fiction
INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('Dune', '978-0441172719',
     (SELECT id FROM authors WHERE name = 'Frank Herbert'),
     (SELECT id FROM categories WHERE name = 'Science Fiction'),
     6, 4,
     'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
     'Set in the distant future, Dune tells the story of young Paul Atreides as his family accepts control of the desert planet Arrakis, the only source of the most valuable substance in the universe: the spice melange. A masterpiece of world-building and political intrigue.')
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('Dune Messiah', '978-0593098234',
     (SELECT id FROM authors WHERE name = 'Frank Herbert'),
     (SELECT id FROM categories WHERE name = 'Science Fiction'),
     3, 3,
     'https://covers.openlibrary.org/b/isbn/9780593098234-L.jpg',
     'The sequel to Dune continues the story of Paul Atreides, now Emperor of the Known Universe, as he faces a conspiracy by the Bene Gesserit, Spacing Guild, and Tleilaxu while struggling with the terrible burden of prescience.')
ON CONFLICT (isbn) DO NOTHING;

-- Fantasy
INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('The Hobbit', '978-0547928227',
     (SELECT id FROM authors WHERE name = 'J.R.R. Tolkien'),
     (SELECT id FROM categories WHERE name = 'Fantasy'),
     5, 2,
     'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
     'Bilbo Baggins is a hobbit who enjoys a comfortable life, rarely traveling any farther than his pantry. But his contentment is disturbed when Gandalf the wizard and thirteen dwarves arrive on his doorstep to take him on an unexpected journey.')
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('The Fellowship of the Ring', '978-0547928210',
     (SELECT id FROM authors WHERE name = 'J.R.R. Tolkien'),
     (SELECT id FROM categories WHERE name = 'Fantasy'),
     4, 1,
     'https://covers.openlibrary.org/b/isbn/9780547928210-L.jpg',
     'The first volume of The Lord of the Rings. Frodo Baggins inherits a ring that turns out to be the One Ring, which must be destroyed in the fires of Mount Doom to save Middle-earth from the Dark Lord Sauron.')
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('Mistborn: The Final Empire', '978-0765350381',
     (SELECT id FROM authors WHERE name = 'Brandon Sanderson'),
     (SELECT id FROM categories WHERE name = 'Fantasy'),
     4, 4,
     'https://covers.openlibrary.org/b/isbn/9780765350381-L.jpg',
     'In a world where ash falls from the sky and mists dominate the night, a young street urchin named Vin discovers she has the powers of a Mistborn and joins a rebellion against the immortal Lord Ruler.')
ON CONFLICT (isbn) DO NOTHING;

-- Mystery & Thriller
INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('Murder on the Orient Express', '978-0062693662',
     (SELECT id FROM authors WHERE name = 'Agatha Christie'),
     (SELECT id FROM categories WHERE name = 'Mystery & Thriller'),
     4, 3,
     'https://covers.openlibrary.org/b/isbn/9780062693662-L.jpg',
     'Hercule Poirot is aboard the Orient Express when a snowdrift stops the train. A passenger is found murdered, and Poirot must solve the case before the train reaches its destination. One of Christie''s most famous and ingenious mysteries.')
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('And Then There Were None', '978-0062073488',
     (SELECT id FROM authors WHERE name = 'Agatha Christie'),
     (SELECT id FROM categories WHERE name = 'Mystery & Thriller'),
     3, 0,
     'https://covers.openlibrary.org/b/isbn/9780062073488-L.jpg',
     'Ten strangers are lured to an isolated island mansion. When they are accused of murder by a mysterious recording, they start dying one by one in accordance with a nursery rhyme. The bestselling mystery novel of all time.')
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('The Shining', '978-0307743657',
     (SELECT id FROM authors WHERE name = 'Stephen King'),
     (SELECT id FROM categories WHERE name = 'Mystery & Thriller'),
     3, 2,
     'https://covers.openlibrary.org/b/isbn/9780307743657-L.jpg',
     'Jack Torrance takes a job as the winter caretaker of the isolated Overlook Hotel in the Colorado Rockies. His young son Danny possesses "the shining," psychic abilities that show him the hotel''s dark and violent history.')
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('It', '978-1501142970',
     (SELECT id FROM authors WHERE name = 'Stephen King'),
     (SELECT id FROM categories WHERE name = 'Mystery & Thriller'),
     2, 1,
     'https://covers.openlibrary.org/b/isbn/9781501142970-L.jpg',
     'In the small town of Derry, Maine, seven friends face an ancient evil that takes the form of a clown called Pennywise. They must return as adults to destroy It once and for all. A epic tale of friendship and horror.')
ON CONFLICT (isbn) DO NOTHING;

-- Non-Fiction
INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('Sapiens: A Brief History of Humankind', '978-0062316097',
     (SELECT id FROM authors WHERE name = 'Yuval Noah Harari'),
     (SELECT id FROM categories WHERE name = 'Non-Fiction'),
     5, 3,
     'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
     'A sweeping narrative of humanity''s creation and evolution that explores how we came to believe in gods, nations, and human rights; how we built cities, kingdoms, and empires. A groundbreaking exploration of who we are.')
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('Outliers: The Story of Success', '978-0316017930',
     (SELECT id FROM authors WHERE name = 'Malcolm Gladwell'),
     (SELECT id FROM categories WHERE name = 'Non-Fiction'),
     4, 4,
     'https://covers.openlibrary.org/b/isbn/9780316017930-L.jpg',
     'Malcolm Gladwell examines the factors that contribute to high levels of success, arguing that success arises from a combination of opportunity, cultural legacy, and meaningful hard work. Introduces the famous "10,000 hour rule."')
ON CONFLICT (isbn) DO NOTHING;

-- Biography
INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('Steve Jobs', '978-1451648539',
     (SELECT id FROM authors WHERE name = 'Walter Isaacson'),
     (SELECT id FROM categories WHERE name = 'Biography'),
     4, 2,
     'https://covers.openlibrary.org/b/isbn/9781451648539-L.jpg',
     'Based on more than forty interviews with Steve Jobs over two years, this is the definitive biography of the Apple co-founder, covering his personal life, creative passions, and relentless drive for perfection.')
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('Becoming', '978-1524763138',
     (SELECT id FROM authors WHERE name = 'Michelle Obama'),
     (SELECT id FROM categories WHERE name = 'Biography'),
     5, 4,
     'https://covers.openlibrary.org/b/isbn/9781524763138-L.jpg',
     'In her memoir, Michelle Obama chronicles the experiences that have shaped her—from her childhood on the South Side of Chicago to her years as an executive to her time spent at the White House. A deeply personal and inspiring story.')
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('Elon Musk', '978-1982181284',
     (SELECT id FROM authors WHERE name = 'Walter Isaacson'),
     (SELECT id FROM categories WHERE name = 'Biography'),
     6, 5,
     'https://covers.openlibrary.org/b/isbn/9781982181284-L.jpg',
     'The definitive biography of Elon Musk, exploring his childhood in South Africa, his creation of Tesla, SpaceX, and Neuralink, and his controversial journey to becoming one of the most influential people in the world.')
ON CONFLICT (isbn) DO NOTHING;

-- Self-Help
INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('Meditations', '978-0140449334',
     (SELECT id FROM authors WHERE name = 'Marcus Aurelius'),
     (SELECT id FROM categories WHERE name = 'Self-Help'),
     3, 3,
     'https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg',
     'The private thoughts of the world''s most powerful man, giving advice on everything from living in the world to coping with adversity. A cornerstone of Stoic philosophy that has inspired leaders for centuries.')
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('The Tipping Point', '978-0316346627',
     (SELECT id FROM authors WHERE name = 'Malcolm Gladwell'),
     (SELECT id FROM categories WHERE name = 'Self-Help'),
     3, 2,
     'https://covers.openlibrary.org/b/isbn/9780316346627-L.jpg',
     'How little things can make a big difference. Malcolm Gladwell explores why some ideas, products, and behaviors spread like viruses while others fade away. Essential reading for understanding social change.')
ON CONFLICT (isbn) DO NOTHING;

-- History
INSERT INTO public.books (title, isbn, author_id, category_id, total_copies, available_copies, cover_url, description) VALUES
    ('Homo Deus: A Brief History of Tomorrow', '978-0062464316',
     (SELECT id FROM authors WHERE name = 'Yuval Noah Harari'),
     (SELECT id FROM categories WHERE name = 'History'),
     4, 3,
     'https://covers.openlibrary.org/b/isbn/9780062464316-L.jpg',
     'The sequel to Sapiens, exploring the future of humanity and our quest to upgrade humans into gods—acquiring powers of creation, destruction, and eternal life. A provocative examination of what comes next.')
ON CONFLICT (isbn) DO NOTHING;

-- ============================================
-- VERIFICATION: Check the seeded data
-- ============================================
DO $$
DECLARE
    cat_count INT;
    auth_count INT;
    book_count INT;
BEGIN
    SELECT COUNT(*) INTO cat_count FROM categories;
    SELECT COUNT(*) INTO auth_count FROM authors;
    SELECT COUNT(*) INTO book_count FROM books;
    
    RAISE NOTICE '✓ Seeded % categories', cat_count;
    RAISE NOTICE '✓ Seeded % authors', auth_count;
    RAISE NOTICE '✓ Seeded % books', book_count;
END $$;

