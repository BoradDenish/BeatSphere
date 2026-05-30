# MusicStream - Commands Guide

The MusicStream application has been successfully created. Here's a summary:
Created Files

Backend (Node.js + Express)
- backend/server.js - Main Express server
- backend/config/database.js - MySQL/Sequelize configuration
- backend/models/ - User, Session, Media, Subscription models
- backend/routes/ - Auth, Users, Media, Subscriptions, Upload routes
- backend/middleware/ - Auth & file upload middleware
- backend/seeds/seed.js - Database seeder (60 media items, 8 users)

Frontend (React + TypeScript + Vite)
- frontend/src/pages/ - Home, Login, Register, Dashboard, Admin pages
- frontend/src/components/shared/ - Navbar, MediaCard, VideoPlayer, UploadForm
- frontend/src/components/ui/ - shadcn/ui components (Button, Card, Dialog, etc.)
- frontend/src/stores/ - Zustand auth and music stores

Docker
- docker-compose.yml - MySQL, Backend, Frontend services
- Dockerfile.backend / Dockerfile.frontend
- nginx.conf - Production frontend config

Documentation
- command.md - Full setup instructions

Quick Start

Without Docker:

# Backend
cd backend && bun install && bun run dev

# Frontend (new terminal)
cd frontend && bun install && bun run dev

With Docker:

docker-compose up -d

Access at http://localhost:3000 | API at http://localhost:5000

Test Credentials: admin/123 or john_doe/password123

## Table of Contents
1. [Without Docker (Local Development)](#without-docker-local-development)
2. [With Docker](#with-docker)
3. [Seed Data](#seed-data)
4. [Project Structure](#project-structure)
5. [Features](#features)

---

## Without Docker (Local Development)

### Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ installed and running
- Bun package manager

### Setup Steps

#### 1. Database Setup
```bash
# Create MySQL database
mysql -u root -p
```
```sql
CREATE DATABASE musicstream;
EXIT;
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd /home/denish/Otherfiles/demo/my-node-api/backend

# Install backend dependencies with bun
bun install

# Configure environment (edit .env if needed)
# Default MySQL credentials: root/root123

# Start backend server
bun run dev
```
Backend will run at: http://localhost:5000

#### 3. Frontend Setup (New Terminal)
```bash
# Navigate to frontend directory
cd /home/denish/Otherfiles/demo/my-node-api/frontend

# Install frontend dependencies with bun
bun install

# Start frontend development server
bun run dev
```
Frontend will run at: http://localhost:3000

#### 4. Seed Database (Optional)
```bash
# In backend directory
cd /home/denish/Otherfiles/demo/my-node-api/backend
bun run seed
```

---

## With Docker

### Prerequisites
- Docker installed
- Docker Compose installed

### Quick Start
```bash
# Navigate to project directory
cd /home/denish/Otherfiles/demo/my-node-api

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MySQL**: localhost:3306

### Docker Commands

#### Build Images
```bash
docker-compose build
```

#### Start Services
```bash
docker-compose up -d
```

#### Stop Services
```bash
docker-compose down
```

#### Stop and Remove Volumes
```bash
docker-compose down -v
```

#### Restart Services
```bash
docker-compose restart
```

#### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

#### Shell Access
```bash
# Backend shell
docker exec -it musicstream-backend sh

# MySQL shell
docker exec -it musicstream-mysql mysql -u root -proot123
```

#### Re-seed Database (Docker)
```bash
docker exec -it musicstream-backend bun run seed
```

---

## Seed Data

### Pre-populated Content
- **30 Audio Tracks**: Summer Vibes, Midnight Dreams, Electric Pulse, etc.
- **30 Video Contents**: Live Concerts, Music Videos, Tutorials, etc.
- **8 Users**: admin (admin/123), john_doe, jane_smith, bob_wilson, alice_brown, mike_johnson, sarah_davis, david_lee, emma_taylor (all passwords: password123)
- **3 Premium Subscriptions**: For john_doe, jane_smith, bob_wilson

### Test Credentials
| Username | Password | Role |
|----------|----------|------|
| admin | 123 | Admin |
| john_doe | password123 | User (Premium) |
| jane_smith | password123 | User (Premium) |
| bob_wilson | password123 | User (Premium) |
| alice_brown | password123 | User |
| mike_johnson | password123 | User |
| sarah_davis | password123 | User |
| david_lee | password123 | User |
| emma_taylor | password123 | User |

---

## Project Structure

```
my-node-api/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── upload.js            # File upload middleware
│   ├── models/
│   │   ├── index.js             # Model associations
│   │   ├── User.js              # User model
│   │   ├── Session.js           # Session model
│   │   ├── Media.js             # Media model (audio/video)
│   │   └── Subscription.js      # Subscription model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User management routes
│   │   ├── media.js             # Media CRUD routes
│   │   ├── subscriptions.js     # Subscription routes
│   │   └── upload.js            # File upload routes
│   ├── seeds/
│   │   └── seed.js              # Database seeder
│   ├── uploads/                 # Uploaded files
│   │   ├── music/
│   │   ├── videos/
│   │   └── thumbnails/
│   ├── server.js                # Main server file
│   └── .env                     # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── ... (more UI components)
│   │   │   └── shared/          # Custom components
│   │   │       ├── Navbar.tsx
│   │   │       ├── MediaCard.tsx
│   │   │       ├── VideoPlayer.tsx
│   │   │       └── UploadForm.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── AdminPage.tsx
│   │   ├── stores/
│   │   │   ├── authStore.ts     # Zustand auth store
│   │   │   └── musicStore.ts    # Zustand music store
│   │   ├── lib/
│   │   │   ├── api.ts           # API client
│   │   │   └── utils.ts         # Utilities
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── docker-compose.yml           # Docker Compose config
├── Dockerfile.backend           # Backend Docker image
├── Dockerfile.frontend          # Frontend Docker image
├── nginx.conf                   # Nginx configuration
└── command.md                  # This file
```

---

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Session management
- Role-based access control (admin/user)

### Media Management
- Upload audio files (MP3, WAV, OGG, FLAC)
- Upload video files (MP4, WebM, OGG, MKV)
- Drag & drop file upload with progress
- Thumbnail upload support
- Premium content marking

### Video Player
- Custom YouTube-style video player
- Playback controls (play/pause, seek, volume)
- Fullscreen mode
- Playback speed control (0.25x - 2x)
- Quality selector
- Keyboard shortcuts
- Like and share buttons

### User Dashboard
- View uploaded content
- Upload new media
- Delete own uploads
- View statistics (plays, uploads)
- Subscription status

### Admin Panel
- User management (view, edit, delete)
- Media management (view, delete)
- Platform statistics
- Role assignment

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

#### Users (Admin)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Media
- `GET /api/media` - List media (with filters)
- `GET /api/media/:id` - Get single media
- `POST /api/media` - Upload media
- `PUT /api/media/:id` - Update media
- `DELETE /api/media/:id` - Delete media

#### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - Get user subscription
- `DELETE /api/subscriptions` - Cancel subscription

#### File Upload
- `POST /api/upload/file` - Upload audio/video
- `POST /api/upload/thumbnail` - Upload thumbnail

---

## Troubleshooting

### Database Connection Issues
```bash
# Check if MySQL is running
mysql -u root -p -e "SHOW DATABASES;"

# Reset MySQL password
docker exec -it musicstream-mysql mysql -u root -p
```

### Port Conflicts
If ports are already in use:
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5000
lsof -i :3306

# Kill the process or change the port in docker-compose.yml
```

### Clear Docker Cache
```bash
docker-compose down -v --rmi all
docker system prune -f
docker-compose up -d --build
```

### Backend Logs
```bash
# Local
bun run dev

# Docker
docker-compose logs backend
```

### Frontend Build Issues
```bash
cd frontend
rm -rf node_modules dist
bun install
bun run build
```

---

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=musicstream
DB_USER=root
DB_PASS=root123
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
MAX_AUDIO_SIZE=52428800
MAX_VIDEO_SIZE=524288000
MAX_IMAGE_SIZE=10485760
```

### Docker Environment
Environment variables are set in `docker-compose.yml`. Edit there for Docker deployments.

---

## Support

For issues or questions, please check:
1. Docker is running correctly
2. MySQL database is accessible
3. Ports are not in use
4. Environment variables are correctly set
5. All dependencies are installed

