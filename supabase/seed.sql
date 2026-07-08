-- ============================================================
-- CampusConnect Hub — Seed Data (3 entries per module)
-- ============================================================

-- 1. Create a test user (skip if already exists)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '00000000-0000-0000-0000-000000000000',
  'jane.doe@college.edu',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Jane Doe","college":"MIT","email_domain":"college.edu"}',
  'authenticated',
  'authenticated',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Create profile
INSERT INTO profiles (id, email, full_name, college, email_domain)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'jane.doe@college.edu',
  'Jane Doe',
  'MIT',
  'college.edu'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. HOUSING LISTINGS (3 entries)
-- ============================================================
INSERT INTO listings_housing (user_id, title, description, address, rent, bedrooms, bathrooms, amenities, contact_phone, contact_whatsapp, is_active) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Sunny 2BR near MIT Campus',
  'Spacious apartment with natural light, hardwood floors, and a modern kitchen. 5-minute walk to campus. Ideal for 2 students looking to share.',
  '245 Massachusetts Ave, Cambridge, MA',
  1200.00, 2, 1,
  ARRAY['WiFi', 'Furnished', 'Laundry', 'AC'],
  '+16175551234', '+16175551234', true
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Cozy Studio in Harvard Square',
  'Fully furnished studio with kitchenette and private bathroom. Quiet building, perfect for grad students. Utilities included in rent.',
  '89 Brattle St, Cambridge, MA',
  950.00, 1, 1,
  ARRAY['WiFi', 'Furnished', 'Pet-Friendly'],
  '+16175559876', '+16175559876', true
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Modern 3BR Townhouse - Great for Groups',
  'Newly renovated townhouse with rooftop deck, in-unit washer/dryer, and parking for 2 cars. 10 min bus ride to campus.',
  '412 Broadway, Somerville, MA',
  2400.00, 3, 2,
  ARRAY['WiFi', 'Parking', 'Laundry', 'Gym', 'AC', 'Furnished'],
  '+16175554321', '+16175554321', true
);

-- ============================================================
-- 4. MARKETPLACE ITEMS (3 entries)
-- ============================================================
INSERT INTO listings_marketplace (user_id, title, description, price, category, condition, whatsapp_number, is_sold) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'MacBook Air M2 - Like New',
  'Used for one semester only. Comes with original charger, protective case, and screen protector. 256GB, 8GB RAM, Space Gray.',
  750.00, 'electronics', 'Like New',
  '+16175551234', false
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Calculus Textbook Bundle (Stewart + Solutions)',
  'James Stewart Calculus Early Transcendentals 9th Edition with complete solutions manual. Minor highlighting in Chapter 1-3.',
  45.00, 'books', 'Good',
  '+16175551234', false
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'IKEA Standing Desk + Ergonomic Chair',
  'IKEA BEKANT sit-stand desk (160x80cm) and Markus office chair. Both in excellent condition. Must pick up from Central Square.',
  280.00, 'furniture', 'Like New',
  '+16175551234', false
);

-- ============================================================
-- 5. PROJECT TEAMS (3 entries)
-- ============================================================
INSERT INTO project_teams (user_id, project_name, description, looking_for, team_size, deadline, contact_email, is_open) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'AI Study Buddy - HackMIT 2026',
  'Building an AI-powered study companion that generates practice questions from lecture notes, tracks learning progress, and creates personalized review schedules. We have a backend dev — need frontend and ML help!',
  ARRAY['frontend', 'ml', 'design'],
  4, '2026-09-15',
  'jane.doe@college.edu', true
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Campus Sustainability Tracker',
  'Mobile app to track and gamify sustainability efforts on campus — carbon footprint calculator, recycling challenges, and community leaderboards. Looking for passionate devs!',
  ARRAY['mobile', 'backend', 'data'],
  5, '2026-08-30',
  'jane.doe@college.edu', true
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Open Source Portfolio Builder',
  'A free, open-source portfolio website generator for students. Markdown-based, auto-deploys to GitHub Pages, with resume parsing and project showcases.',
  ARRAY['frontend', 'devops', 'design'],
  3, NULL,
  'jane.doe@college.edu', true
);

-- ============================================================
-- 6. CAREER BOARD (3 entries)
-- ============================================================
INSERT INTO career_board (user_id, title, company, location, type, description, apply_link, referral_contact, is_active) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Software Engineer Intern - Summer 2026',
  'Google',
  'Mountain View, CA',
  'Internship',
  'Join Google''s Search team for a 12-week summer internship. Work on large-scale distributed systems serving billions of queries. Requires strong DSA knowledge, Python or Java, and experience with system design concepts.',
  'https://careers.google.com/jobs/results/',
  'jane.doe@college.edu', true
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Full-Stack Developer',
  'Stripe',
  'Remote (US)',
  'Full-Time',
  'Build and maintain payment infrastructure used by millions of businesses. Tech stack: Ruby, React, TypeScript, PostgreSQL. Strong focus on API design, reliability engineering, and developer experience.',
  'https://stripe.com/jobs',
  NULL, true
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'ML Research Assistant - NLP Lab',
  'MIT CSAIL',
  'Cambridge, MA',
  'Research',
  'Assist in ongoing NLP research focusing on large language model alignment and safety. 10-15 hours/week during semester. Must have completed ML coursework and have experience with PyTorch or JAX.',
  NULL,
  'jane.doe@college.edu', true
);

-- ============================================================
-- 7. RESOURCES (3 entries)
-- ============================================================
INSERT INTO resources (user_id, title, description, category, course_code, content, file_url, file_name) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Data Structures Final Review Notes',
  'Comprehensive review covering all topics from the semester including arrays, linked lists, trees, graphs, and sorting algorithms.',
  'notes', 'CS101',
  'Arrays: O(1) random access, O(n) insertion/deletion. Use when you need fast index-based lookups.

Linked Lists: O(1) insertion/deletion at head, O(n) access. Use when frequent insertions/deletions needed.

Hash Tables: O(1) average case for insert/search/delete. Handle collisions via chaining or open addressing. Load factor should stay below 0.75.

Binary Search Trees: O(log n) average for search/insert/delete. Worst case O(n) for skewed trees. AVL and Red-Black trees guarantee O(log n).

Graphs: BFS uses a queue (shortest path in unweighted). DFS uses a stack (topological sort, cycle detection). Dijkstra for weighted shortest path.

Sorting: QuickSort O(n log n) average, MergeSort O(n log n) guaranteed, HeapSort O(n log n) in-place.',
  NULL, NULL
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Linear Algebra Midterm Cheat Sheet',
  'Key formulas and theorems for the midterm exam covering vector spaces, eigenvalues, and matrix operations.',
  'notes', 'MATH201',
  'Matrix Multiplication: (AB)ij = sum of Aik * Bkj. Not commutative: AB ≠ BA generally.

Determinant: det(A) = ad - bc for 2x2. Use cofactor expansion for larger. det(A) = 0 means singular (not invertible).

Eigenvalues: Solve det(A - λI) = 0 for λ. Eigenvectors: Solve (A - λI)x = 0 for each λ.

Rank: Number of linearly independent rows/columns. rank(A) = rank(A^T). Rank-Nullity theorem: rank + nullity = n.

Inverse: A^(-1) exists iff det(A) ≠ 0. (AB)^(-1) = B^(-1)A^(-1). Use row reduction [A|I] → [I|A^(-1)].

Orthogonality: Gram-Schmidt process for orthonormal basis. Projection: proj_u(v) = (v·u / u·u) * u.',
  NULL, NULL
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Web Development Project Starter Guide',
  'Step-by-step guide for setting up a modern full-stack web project with React, Node.js, and PostgreSQL.',
  'projects', 'CS320',
  'Step 1 - Frontend Setup: Use Vite + React for fast development. Install Tailwind CSS for styling. Structure components in src/components/.

Step 2 - Backend Setup: Initialize Node.js with Express. Set up middleware for CORS, JSON parsing, and error handling. Use environment variables for secrets.

Step 3 - Database: Use PostgreSQL with Supabase or a local instance. Design schema with proper foreign keys and indexes. Always use parameterized queries to prevent SQL injection.

Step 4 - Authentication: Implement JWT-based auth. Store tokens in httpOnly cookies. Add middleware to protect routes. Hash passwords with bcrypt (min 10 salt rounds).

Step 5 - Deployment: Frontend on Vercel/Netlify. Backend on Railway/Render. Database on Supabase. Set up CI/CD with GitHub Actions.',
  NULL, NULL
);
