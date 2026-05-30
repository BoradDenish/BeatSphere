# Backend Documentation - MusicStream API

The MusicStream backend is a robust Node.js API built with Express, providing secure media management, user authentication, and advanced YouTube integration features.

## 🛠 Core Technologies & Libraries

### 1. Web Framework & Routing
- **Express (v5.1.0)**: The foundational web framework for handling HTTP requests and routing.
- **Cors**: Middleware to enable Cross-Origin Resource Sharing.
- **Express Validator**: Used for surgical request body validation and sanitization.

### 2. Database & ORM
- **Sequelize (v6.37.7)**: A powerful Promise-based Node.js ORM for MySQL.
- **MySQL2**: The underlying driver for MySQL database communication.
- **Models**: Located in `backend/models/`, managing Users, Media, Sessions, and Subscriptions.

### 3. Security & Auth
- **JSON Web Token (JWT)**: Handles stateless user authentication and session management.
- **Bcryptjs**: Used for secure password hashing and verification.
- **Middleware**: Custom `auth.js` middleware for protecting private routes.

### 4. Media & YouTube Engine
- **yt-dlp (Binary)**: The industry-standard tool for high-reliability YouTube metadata and media extraction.
- **@distube/ytdl-core**: Fallback library for YouTube streaming.
- **Multer**: Middleware for handling `multipart/form-data`, used for local file and thumbnail uploads.
- **Axios**: Used for fetching remote thumbnails and API communication.

### 5. Utilities
- **UUID**: Generates unique identifiers for uploaded files to prevent filename collisions.
- **Dotenv**: Manages environment variables securely.

---

## 📁 Project Structure

- `/config`: Database connection and Sequelize initialization.
- `/middleware`: Custom logic for authentication (`auth.js`) and file uploads (`upload.js`).
- `/models`: Sequelize schema definitions and relationship mappings.
- `/routes`: Endpoint definitions for Auth, Media, Users, Subscriptions, and Uploads.
- `/services`: Business logic abstractions, including the `YouTubeService`.
- `/seeds`: Database seeding scripts for development and testing.
- `/uploads`: Storage directory for music, videos, and thumbnails.

---

## 🚀 Key Features

- **Advanced YouTube Integration**: Seamlessly imports YouTube content using a specialized `yt-dlp` binary to bypass bot detection.
- **Subscription Management**: Built-in logic for handling free vs. premium user access and upload limits.
- **Media Streaming**: Specialized `/stream` route in `server.js` supporting partial content (HTTP 206) for video seeking.
- **Secure File Storage**: Automated organization of media files with unique naming and dedicated folders.
