-- Create the user_role enum type
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Add the role column to the user table
ALTER TABLE "user" ADD COLUMN role user_role NOT NULL DEFAULT 'viewer'; 