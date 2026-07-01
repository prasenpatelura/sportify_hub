# Sportify Hub: Deployment Guide

## Architecture Overview
- **Mobile Frontend:** React Native (Expo) deployed via Expo Application Services (EAS).
- **Backend API:** Node.js (Express) deployed on Docker container (AWS ECS / Google Cloud Run / Vercel).
- **Database:** MongoDB Atlas (Managed DBaaS).

---

## 1. Backend Deployment (Node.js API)

### Prerequisites
- Docker installed locally.
- A cloud provider account (e.g., Google Cloud Platform).

### Steps
1. **Environment Variables:** Create a `.env.production` file containing:
   `MONGO_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `PORT`, etc.
2. **Containerize:** Create a `Dockerfile`:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 8080
   CMD ["npm", "start"]
   ```
3. **Deploy to Google Cloud Run:**
   ```bash
   gcloud build submit --tag gcr.io/your-project/sportify-hub-api
   gcloud run deploy sportify-hub-api --image gcr.io/your-project/sportify-hub-api --platform managed --region us-central1 --allow-unauthenticated
   ```

---

## 2. Database Deployment

1. Create a cluster on **MongoDB Atlas**.
2. Whitelist the IP address of your API server (or `0.0.0.0/0` for serverless VPC setups).
3. Get the Connection String and add it to your Backend's environment variables.
4. Setup automated backups in Atlas dashboard.

---

## 3. Mobile Frontend Deployment (Expo/EAS)

We recommend using **Expo Application Services (EAS)** for seamless builds and OTA (Over The Air) updates.

### Steps
1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. **Initialize EAS:**
   ```bash
   eas build:configure
   ```
3. **Set Environment Variables:** Add your API URL to `eas.json` or `.env` so the app points to the production backend.
4. **Build APK/AAB for Android (Play Store):**
   ```bash
   eas build --platform android --profile production
   ```
5. **Build IPA for iOS (App Store):**
   ```bash
   eas build --platform ios --profile production
   ```
6. **Submit to Stores:**
   ```bash
   eas submit --platform all
   ```
   *(Note: You will need Apple Developer and Google Play Developer accounts configured).*

### Over-The-Air (OTA) Updates
For minor fixes or UI updates without requiring users to download a new app from the store:
```bash
eas update --branch production --message "Fix UI glitch on Home screen"
```
