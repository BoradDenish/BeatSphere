# BeatSphere - Deployment Guide

## Overview

| Component | Platform      | Cost    |
|-----------|---------------|---------|
| Frontend  | Vercel        | Free    |
| Backend   | Render        | Free    |
| Database  | PlanetScale   | Free    |

---

## Part 1: Deploy Frontend on Vercel

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/BeatSphere.git
git branch -M main
git push -u origin main
```

### Step 2: Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click **"Add New Project"**
3. Select your **BeatSphere** repository
4. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 3: Add Environment Variables in Vercel

In Vercel dashboard go to **Settings > Environment Variables** and add:

```
VITE_API_URL = https://your-backend-url.onrender.com
```

### Step 4: Update Frontend API Calls

Make sure your frontend axios/fetch calls point to the deployed backend URL, not localhost.

### Step 5: Deploy

Click **"Deploy"**. Vercel will build and deploy. Every push to `main` will auto-deploy.

### Step 6: Custom Domain (Optional)

1. Go to **Settings > Domains**
2. Add your custom domain
3. Update DNS records as shown by Vercel

---

## Part 2: Deploy Backend on Render

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create Web Service

1. Click **"New +"** > **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `beatsphere-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free

### Step 3: Add Environment Variables in Render

Go to **Environment** tab and add:

```
NODE_ENV=production
PORT=5000
DB_HOST=your-planetscale-host
DB_PORT=3306
DB_NAME=your-database-name
DB_USER=your-planetscale-username
DB_PASS=your-planetscale-password
JWT_SECRET=your-strong-random-secret-here
JWT_EXPIRES_IN=7d
MAX_AUDIO_SIZE=52428800
MAX_VIDEO_SIZE=524288000
MAX_IMAGE_SIZE=10485760
```

### Step 4: Deploy

Click **"Create Web Service"**. Render will build and deploy.

---

## Part 3: Free MySQL Database (No Payment Needed)

Render does NOT provide free MySQL. Use **PlanetScale** instead - it has a free MySQL-compatible database.

### Option A: PlanetScale (Recommended - MySQL Compatible)

#### Step 1: Create PlanetScale Account

1. Go to [planetscale.com](https://planetscale.com)
2. Sign up with GitHub (free plan available)
3. Create a new organization

#### Step 2: Create Database

1. Click **"Create Database"**
2. Set database name: `beatsphere`
3. Choose region closest to your Render server
4. Click **"Create"**

#### Step 3: Create Password

1. Go to your database dashboard
2. Click **"Passwords"** tab
3. Click **"Create password"**
4. Copy the connection string - it looks like:

```
mysql://username:password@aws.connect.psdb.cloud/beatsphere?ssl={"rejectUnauthorized":true}
```

#### Step 4: Update Backend to Use PlanetScale SSL

Update `backend/config/database.js`:

```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
```

#### Step 5: Set Render Environment Variables with PlanetScale

```
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_NAME=beatsphere
DB_USER=your_planetscale_username
DB_PASS=your_planetscale_password
```

#### Step 6: Import Existing Schema to PlanetScale

PlanetScale uses `pscale` CLI for schema management:

1. Install PlanetScale CLI:

```bash
npm i -g planetscale
```

2. Login:

```bash
pscale auth login
```

3. Push your schema:

```bash
pscale database push beatsphere main --schema ./backend/models
```

Or manually run your Sequelize migrations through the PlanetScale dashboard SQL editor.

---

### Option B: Supabase (Free PostgreSQL - Need Small Code Change)

If PlanetScale free tier is unavailable, use Supabase (PostgreSQL, free forever).

#### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Click **"New Project"**
4. Set name: `beatsphere`
5. Set a strong database password
6. Choose region
7. Click **"Create Project"**

#### Step 2: Get Connection Details

1. Go to **Settings > Database**
2. Copy the **Connection string > URI**
3. It looks like: `postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:6543/postgres`

#### Step 3: Update Backend for PostgreSQL

Install pg dependency:

```bash
cd backend
npm install pg
```

Update `backend/config/database.js`:

```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
```

Update `backend/package.json` - change mysql2 to pg:

```bash
npm uninstall mysql2
npm install pg
```

#### Step 4: Set Render Environment Variables

```
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:6543/postgres
```

#### Step 5: Create Tables in Supabase

1. Go to Supabase Dashboard > **SQL Editor**
2. Run your table creation SQL or use Sequelize sync by setting `sequelize.sync({ alter: true })` on first run

---

### Option C: Neon (Free PostgreSQL)

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create project `beatsphere`
4. Copy connection string
5. Same code changes as Option B (PostgreSQL)

---

## Comparison of Free DB Options

| Service    | Database   | Free Tier              | SSL Required | Best For         |
|------------|------------|------------------------|--------------|------------------|
| PlanetScale| MySQL      | 5GB storage, 1B reads  | Yes          | MySQL projects   |
| Supabase   | PostgreSQL | 500MB storage          | Yes          | Full-featured    |
| Neon       | PostgreSQL | 512MB storage          | Yes          | Serverless       |

**Recommendation:** Use **PlanetScale** since your project already uses MySQL - zero code changes needed except adding SSL config.

---

## Part 4: Final Checklist

### Before Deploying

- [ ] Push latest code to GitHub
- [ ] Create PlanetScale account and database
- [ ] Get PlanetScale connection credentials
- [ ] Update `backend/config/database.js` with SSL support
- [ ] Generate strong JWT_SECRET (use random string)

### Vercel Settings

- [ ] Root directory set to `frontend`
- [ ] Environment variable `VITE_API_URL` set to Render backend URL
- [ ] Deploy and verify

### Render Settings

- [ ] Root directory set to `backend`
- [ ] All environment variables added
- [ ] Start command: `node server.js`
- [ ] Deploy and check logs

### Post Deploy

- [ ] Test backend health: `https://your-backend.onrender.com/api/health`
- [ ] Test frontend loads correctly
- [ ] Test login/register functionality
- [ ] Test media upload and playback
- [ ] Update CORS in backend if needed for Vercel domain

---

## Fix CORS for Production

Update `backend/server.js` to allow your Vercel domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ],
  credentials: true
}));
```

---

## Render Free Tier Notes

- Render free web services **spin down after 15 minutes** of inactivity
- First request after spin down takes **30-50 seconds** to respond
- 750 hours/month runtime on free tier
- No credit card required

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend returns 502 | Check Render logs, ensure `node server.js` works |
| Database connection refused | Verify PlanetScale credentials and SSL config |
| CORS errors | Add Vercel domain to CORS origin in server.js |
| Frontend can't reach API | Check `VITE_API_URL` env var in Vercel |
| Render spin-down delay | Upgrade to paid tier ($7/month) or use cron ping |
