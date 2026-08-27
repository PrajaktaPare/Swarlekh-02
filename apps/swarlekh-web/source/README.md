# SwarLekh — Accessible Exam Platform

AI-powered exam platform for visually impaired students.

## Setup

### 1. Supabase Setup
1. Go to supabase.com → Create new project
2. Go to SQL Editor → Run `SUPABASE_SETUP.sql`
3. Go to Settings → API → Copy URL and anon key

### 2. Environment Variables
Create `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Netlify Deploy
Add these environment variables in Netlify dashboard:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

### 4. Create Admin User
After deploying, register normally then go to Supabase → Table Editor → profiles → change role to 'admin'

## Features
- Role-based auth (Teacher/Student/Admin)
- Multiple exam types (MCQ, Fill blanks, Descriptive, True/False)
- Voice recording with Marathi + English support
- TTS read questions aloud
- PDF download for teachers
- Session code system
- Professional accessible UI
