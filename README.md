# 📘 Personal Portfolio CMS (Next.js + PostgreSQL)

A full-stack web application for building and displaying professional public portfolios.  
Features include user authentication, admin panel for profile editing, portfolio search engine, and beautifully styled public portfolio pages.

This project uses **Next.js (Pages Router)**, **PostgreSQL**, **TailwindCSS**, and **cookie-based auth**.

---

## 🚀 Features

### 🔐 Authentication

- Custom cookie-based login system (`src/lib/auth.ts`)
    
- JWT verification and user role enforcement (normal user / admin)
    

### 👤 Profile Management (Admin)

Admin users can create and edit:

- Profile master record
    
- Contact information
    
- Work experience
    
- Education
    
- Projects
    
- Languages
    
- Certificates
    
- Volunteer experience
    

All stored in PostgreSQL with direct SQL (no Prisma).

### 🌍 Public Portfolio Pages

- Public route: `/portfolio`
    
- Lists all public & non-deleted profiles
    
- Fuzzy search across multiple fields
    
- Pagination (20 per page)
    
- "View" button opens `/portfolio/[id]` with full profile display
    
- Beautiful UI based on TailwindCSS + Inter font + Lucide icons
    

### 🔎 Portfolio Search Engine

- Search fields: name, job title, location, tagline, pf_name
    
- AND match between words
    
- OR match across columns
    
- Fully server-side search (`src/pages/api/portfolio/profileSearch.ts`)
    

---

## 🗂 Tech Stack

### Frontend

- **Next.js 16 (Pages Router)**
    
- **React**
    
- **TailwindCSS 3**
    
- **Lucide icons**
    
- **Google Fonts: Inter**
    
- Fully custom UI design from HTML designer adapted into TSX
    

### Backend

- **Next.js API routes**
    
- **PostgreSQL 18**
    
- **Node-postgres (pg)** with connection pooling
    
- Custom SQL (no ORM)
    
- Secure JWT cookie authentication
    

### Folder Structure (Important Parts)

`src/  ├─ lib/  │   ├─ db.ts          # PostgreSQL pool  │   └─ auth.ts        # JWT cookie helpers  │  ├─ pages/  │   ├─ api/  │   │    ├─ profile/          # Admin CRUD APIs  │   │    │     ├─ index.ts  │   │    │     └─ [id].ts  │   │    └─ portfolio/  │   │           ├─ profileSearch.ts  # Public search API  │   │           └─ [id].ts           # Public individual portfolio API  │   │  │   ├─ portfolio/  │   │    ├─ index.tsx       # Search engine page  │   │    └─ [id].tsx        # Public portfolio UI  │   │  │   └─ admin/               # Admin UI pages for editing profile  │  ├─ styles/  │     └─ globals.css  │  └─ pages/_document.tsx      # Fonts + CDN links`

---

## 🛠 Setup & Installation

### 1. Clone the repo

`git clone https://github.com/<your-username>/<repo-name>.git cd <repo-name>`

### 2. Install dependencies

`npm install`

### 3. Configure environment variables

Create `.env`:

`DATABASE_URL=postgres://youruser:yourpass@localhost:5432/yourdb JWT_SECRET=your_jwt_secret_key COOKIE_NAME=auth_token`

### 4. Start database

Make sure PostgreSQL 18 is running at:

`localhost:5432`

Then create required tables (profile + all pf_* tables).

### 5. Run development server

`npm run dev`

Open:

`http://localhost:3000`

---

## 🧪 API Overview

### Admin APIs (secured)

`GET    /api/profile POST   /api/profile GET    /api/profile/:id PUT    /api/profile/:id DELETE /api/profile/:id`

### Public Portfolio APIs

`GET /api/portfolio/profileSearch?q=&page= GET /api/portfolio/:id`

---

## 🎨 UI / Design Notes

### TailwindCSS

Installed via build pipeline (not CDN).

### Fonts

Loaded in `_document.tsx`:

- Inter (Google Fonts)
    
- Font Awesome (if needed)
    

### Custom Styling

Global CSS defines:

`body { font-family: 'Inter', sans-serif; }  .glass-panel {   background: rgba(255,255,255,0.95);   backdrop-filter: blur(10px); }`

Used across UI components for consistent design.

---

## 🧹 Future Improvements (Planned)

- Dark mode
    
- Markdown support for descriptions
    
- Image CDN support
    
- SEO meta tags for public profiles
    
- Rate limiting on search API
    

---

## 📝 License

MIT License.