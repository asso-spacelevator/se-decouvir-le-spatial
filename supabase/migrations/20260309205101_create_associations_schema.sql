/*
  # Create Associations and Mentoring Platforms Schema

  ## Overview
  This migration creates tables to store information about mentoring platforms, 
  scientific associations, and educational resources for students interested in space and STEM fields.

  ## New Tables
  
  ### 1. `mentoring_platforms`
  Stores mentoring platforms that help students with orientation and studies
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Organization name
  - `url` (text) - Website link
  - `target_audience` (text) - Age range or educational level (e.g., "Lycée-étudiant")
  - `domain` (text) - Focus area (e.g., "orientation / études")
  - `supporters` (text) - Organizations providing support
  - `description` (text, optional) - Additional information
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `scientific_associations`
  Stores scientific associations and clubs for young people
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Organization name
  - `url` (text) - Website link
  - `category` (text) - Type of association (e.g., "general_science", "space", "girls_in_stem", "mediation")
  - `domain` (text) - Specific field (e.g., "spatial / robotique")
  - `target_audience` (text) - Age range or educational level
  - `supporters` (text) - Organizations providing support
  - `activities` (text, optional) - Main activities
  - `region` (text, optional) - Geographic region (for regional associations)
  - `description` (text, optional) - Additional information
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add public read-only policies (these are educational resources)
  - Only authenticated users can view (or make fully public if needed)

  ## Notes
  - Categories for scientific_associations: "general_science", "space", "girls_in_stem", "mediation"
  - Data will be populated in a follow-up SQL execution
*/

-- Create mentoring_platforms table
CREATE TABLE IF NOT EXISTS mentoring_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  target_audience text NOT NULL,
  domain text NOT NULL,
  supporters text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create scientific_associations table
CREATE TABLE IF NOT EXISTS scientific_associations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  category text NOT NULL,
  domain text,
  target_audience text,
  supporters text,
  activities text,
  region text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE mentoring_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE scientific_associations ENABLE ROW LEVEL SECURITY;

-- Create public read policies (educational resources should be accessible)
CREATE POLICY "Anyone can read mentoring platforms"
  ON mentoring_platforms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read scientific associations"
  ON scientific_associations
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_mentoring_platforms_target ON mentoring_platforms(target_audience);
CREATE INDEX IF NOT EXISTS idx_scientific_associations_category ON scientific_associations(category);
CREATE INDEX IF NOT EXISTS idx_scientific_associations_region ON scientific_associations(region);