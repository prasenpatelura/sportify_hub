# Matchify (Sportify Hub)

The ultimate platform to discover premium sports venues, book courts in real-time, and connect with players around you. This project consists of an **Expo Mobile App** and a **Next.js Web Frontend**, both fully functional using a robust mock data layer.

## 🚀 Status: All Issues Resolved
The project has undergone a complete overhaul to fix 300+ TypeScript/JavaScript errors and dependency issues. It is now strictly decoupled from any backend services for immediate UI/UX evaluation.

### [View Final Walkthrough & Screenshots](.gemini/antigravity/brain/f9764bee-945d-49ce-bc70-86619d682de4/walkthrough.md)

---

## 🛠️ Task Completion Details

- [x] **Dependency Fixes**: Resolved all version conflicts and missing packages (React Navigation, Expo, Zustand, Axios).
- [x] **Mock Data Layer**: Implemented a comprehensive mock API in both platforms.
- [x] **Zero TypeScript Errors**: Verified `npx tsc --noEmit` returns 0 errors across the board.
- [x] **Premium UI**: Implemented Dark Theme, Glassmorphism, and neon aesthetics (No red colors used).
- [x] **Full Navigation**: Configured all mobile screens (Home, Explore, Play, Activity, Profile, Venue Details, Booking).
- [x] **Local Servers**: Both Mobile and Web servers are configured for local development.

---

## 🏃 How to Run Locally

### 1. Web Frontend (Next.js)
```bash
cd matchify/frontend
npm install
npm run dev
```
**Access Link**: [http://localhost:3000](http://localhost:3000)

### 2. Mobile App (Expo)
```bash
cd sportify-hub
npm install
npx expo start
```
**Access Link**: [http://localhost:8081](http://localhost:8081) (Use Expo Go or Emulator)

---

## 📂 Project Architecture
The project is organized into two primary applications:

- **`matchify/frontend`**: Next.js web application for desktop/browser users.
- **`sportify-hub`**: Expo React Native application for mobile users.

For more details on the architecture, see:
- [API Architecture](./api_architecture.md)
- [Database Schema](./database_schema.md)
- [Folder Structure](./folder_structure.md)
- [Deployment Guide](./deployment_guide.md)

---

## ✨ Design Principles
1. **Glassmorphism**: Elegant blur effects and semi-transparent layers.
2. **Dark Mode**: Optimized for high-contrast, premium viewing experiences.
3. **No Red Colors**: Replaced traditional error/alert colors with deep orange and neon accents.
4. **Performance**: Skeleton loaders and artificial delays for a realistic feel.
