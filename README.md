# Crown Coffee — Recruitment Site

Bilingual (Bangla/English) job application portal for Crown Coffee.

**URLs**
- `/` — Landing page, choose department
- `/kitchen` — Kitchen team application
- `/front` — Front Service application

---

## Quick Setup

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/crown-coffee-jobs
cd crown-coffee-jobs
npm install
```

### 2. Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `supabase_setup.sql` → Run
3. Go to **Storage** → New Bucket → name it `cvs` → set Public, 100MB limit
4. Go to **Project Settings → API** → copy URL and anon key

### 3. Environment Variables

```bash
cp .env.local.example .env.local
# then fill in your Supabase URL and anon key
```

### 4. Add Logo

Place `Crown_Coffee_logo_png.png` into the `/public/` folder and rename it to `logo.png`.

### 5. Run locally

```bash
npm run dev
# open http://localhost:3000
```

### 6. Deploy to Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add env vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy ✓

---

## Viewing Applications

Go to **Supabase → Table Editor → applicants** to see all submissions.
CV files are in **Storage → cvs**.

---

## Contact
Crown Coffee · 01806576024 · 6, Shah Makdum Avenue, Sector-13, Uttara
