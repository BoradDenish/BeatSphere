# Frontend Documentation - MusicStream UI

The MusicStream frontend is a modern, high-performance web application built with React, TypeScript, and Vite. It features a sleek, dark-themed UI focused on a premium user experience.

## 🛠 Core Technologies & Libraries

### 1. UI Architecture
- **React (v18.3.1)**: The core library for building the component-based user interface.
- **TypeScript**: Ensures type safety across the entire application, especially for API responses and state management.
- **Vite**: The build tool and development server, providing lightning-fast Hot Module Replacement (HMR).

### 2. State Management
- **Zustand (v5.0.3)**: A small, fast, and scalable barebones state-management solution.
  - `authStore.ts`: Manages user login state and session tokens.
  - `musicStore.ts`: Handles media library state, categories, and CRUD operations.
  - `playerStore.ts`: Controls the global audio/video player state.

### 3. Styling & Components
- **Tailwind CSS**: Utility-first CSS framework for rapid and consistent UI development.
- **Radix UI**: Unstyled, accessible UI primitives used for complex components like Dialogs, Selects, and Tabs.
- **Lucide React**: A beautiful and consistent icon library.
- **Clsx & Tailwind Merge**: Utilities for managing dynamic CSS classes efficiently.

### 4. Navigation & Networking
- **React Router Dom (v7.1.1)**: Handles client-side routing and navigation.
- **Axios**: Promise-based HTTP client for communicating with the backend API.
- **API Interceptors**: Located in `lib/api.ts`, automatically handling JWT authorization headers and token expiration.

### 5. Specialized Features
- **React Dropzone**: Enables drag-and-drop functionality for media and thumbnail uploads.
- **React H5 Audio Player**: A ready-to-use, customizable HTML5 audio player.
- **Custom Components**: Located in `components/shared/`, including `MediaCard`, `VideoPlayer`, and `UploadForm`.

---

## 📁 Project Structure

- `/components`: UI building blocks, divided into `shared` and `ui` (Radix wrappers).
- `/hooks`: Custom React hooks for shared logic, such as `use-toast.ts`.
- `/lib`: Utility functions and centralized API configuration.
- `/pages`: Top-level route components (Dashboard, Home, Login, etc.).
- `/stores`: Zustand stores for global application state.

---

## 🎨 Visual Identity

- **Theme**: Dark-centric with a premium "Glassmorphism" aesthetic.
- **Gradients**: Heavy use of purple and indigo gradients to signify the "MusicStream" brand.
- **Feedback**: Integrated toast system for real-time user notifications.
