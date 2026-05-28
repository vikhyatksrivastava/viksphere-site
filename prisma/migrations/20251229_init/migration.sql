-- Initial migration for viksphere-site

CREATE TABLE "SiteSettings" (
  id SERIAL PRIMARY KEY,
  title TEXT,
  "enablePhotography" BOOLEAN DEFAULT true,
  "enableBlog" BOOLEAN DEFAULT true,
  "enableTech" BOOLEAN DEFAULT true,
  "enableMusic" BOOLEAN DEFAULT true
);

CREATE TABLE "Photo" (
  id SERIAL PRIMARY KEY,
  title TEXT,
  "publicId" TEXT NOT NULL UNIQUE,
  "takenAt" TIMESTAMPTZ,
  location TEXT,
  description TEXT
);

CREATE TABLE "BlogPost" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT,
  "publishedAt" TIMESTAMPTZ,
  excerpt TEXT,
  content TEXT
);

CREATE TABLE "Artifact" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  "repoUrl" TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

CREATE TABLE "ContactMessage" (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  message TEXT NOT NULL,
  "receivedAt" TIMESTAMPTZ DEFAULT now()
);
