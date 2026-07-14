-- ============================================================
-- CampusConnect Hub — Supabase SQL Migration
-- Run this entire script in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (Supabase typically has this enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- Links to Supabase auth.users, stores institutional identity
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  college TEXT DEFAULT '',
  email_domain TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  
  -- Lifestyle parameters for roommate matcher telemetry
  lifestyle_sleep TEXT DEFAULT 'Flexible',        -- Night Owl, Early Bird, Flexible
  lifestyle_cleanliness INTEGER DEFAULT 3,        -- Scale 1-5
  lifestyle_study TEXT DEFAULT 'Library',          -- In Room, Library, Flexible
  lifestyle_noise INTEGER DEFAULT 3,              -- Scale 1-5 (preference for quietness)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. LISTINGS_HOUSING
-- Campus housing listings with amenities and contact info
-- ============================================================
CREATE TABLE IF NOT EXISTS listings_housing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  rent NUMERIC(10, 2) NOT NULL DEFAULT 0,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  amenities TEXT[] DEFAULT '{}',
  contact_phone TEXT DEFAULT '',
  contact_whatsapp TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Academic cycle and lease configuration
  academic_term TEXT DEFAULT 'Full Year',         -- Fall Semester, Spring Semester, Summer Term, Full Year
  split_billing BOOLEAN DEFAULT FALSE,
  max_occupants INTEGER DEFAULT 2,
  proximity_gate TEXT DEFAULT '',                 -- e.g. "5 min walk to Engineering Gate"
  shuttle_connected BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE listings_housing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Housing listings are viewable by authenticated users"
  ON listings_housing FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create housing listings"
  ON listings_housing FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own housing listings"
  ON listings_housing FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own housing listings"
  ON listings_housing FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER listings_housing_updated_at
  BEFORE UPDATE ON listings_housing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. LISTINGS_MARKETPLACE
-- P2P trading board items
-- ============================================================
CREATE TABLE IF NOT EXISTS listings_marketplace (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'other',
  condition TEXT DEFAULT 'Good',
  whatsapp_number TEXT NOT NULL DEFAULT '',
  is_sold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE listings_marketplace ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketplace items are viewable by authenticated users"
  ON listings_marketplace FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create marketplace listings"
  ON listings_marketplace FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketplace listings"
  ON listings_marketplace FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketplace listings"
  ON listings_marketplace FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER listings_marketplace_updated_at
  BEFORE UPDATE ON listings_marketplace
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. PROJECT_TEAMS
-- Team matchmaking posts with skill tags
-- ============================================================
CREATE TABLE IF NOT EXISTS project_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  looking_for TEXT[] DEFAULT '{}',
  team_size INTEGER DEFAULT 4,
  deadline DATE,
  contact_email TEXT NOT NULL DEFAULT '',
  is_open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team posts are viewable by authenticated users"
  ON project_teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create team posts"
  ON project_teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team posts"
  ON project_teams FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team posts"
  ON project_teams FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER project_teams_updated_at
  BEFORE UPDATE ON project_teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5. CAREER_BOARD
-- Job postings, internships, and referral opportunities
-- ============================================================
CREATE TABLE IF NOT EXISTS career_board (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'Full-Time',
  description TEXT NOT NULL DEFAULT '',
  apply_link TEXT DEFAULT '',
  referral_contact TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE career_board ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Career posts are viewable by authenticated users"
  ON career_board FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create career posts"
  ON career_board FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career posts"
  ON career_board FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career posts"
  ON career_board FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER career_board_updated_at
  BEFORE UPDATE ON career_board
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. RESOURCES
-- Shared documents, notes, and study materials
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'notes',
  course_code TEXT DEFAULT '',
  content TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  file_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources are viewable by authenticated users"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources"
  ON resources FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 7. INDEXES for query performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_housing_active ON listings_housing(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_housing_rent ON listings_housing(rent);
CREATE INDEX IF NOT EXISTS idx_housing_term ON listings_housing(academic_term);
CREATE INDEX IF NOT EXISTS idx_housing_occupants ON listings_housing(max_occupants);

CREATE INDEX IF NOT EXISTS idx_marketplace_active ON listings_marketplace(is_sold, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON listings_marketplace(category);
CREATE INDEX IF NOT EXISTS idx_teams_open ON project_teams(is_open, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_career_active ON career_board(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_career_type ON career_board(type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_domain ON profiles(email_domain);
CREATE INDEX IF NOT EXISTS idx_profiles_sleep ON profiles(lifestyle_sleep);
