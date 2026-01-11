# Deployment Guide

This project is ready to be deployed to any Node.js hosting service.

## 🚀 Quick Deployment to Render (Recommended)

1. **Push this code to GitHub**.
2. Go to [dashboard.render.com](https://dashboard.render.com/).
3. Click **New +** and select **Web Service**.
4. Connect your GitHub repository.
5. Render will automatically detect the configuration from `render.yaml`.
6. Click **Deploy**.

## 🛠 Manual Deployment (Heroku, Railway, etc.)

If you are deploying manually, use these settings:

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `NODE_ENV`: `production`

## 📦 What's Inside?

- **Frontend**: Built with Vite + React. Files are compiled to `dist/`.
- **Backend**: A simple Node.js/Express server (`server.js`) that:
  - Serves the compiled frontend.
  - Handles API requests (`/api/submit`, `/api/responses`).
  - Stores data in `responses.json`.

## ⚠️ Important Notes

- **Data Persistence**: By default, data is stored in `responses.json` on the disk. On some cloud platforms (like Heroku or Render Free Tier), **this file will be reset every time you redeploy or restart**.
  - For a real production app with critical data, you should upgrade to use a database like MongoDB or PostgreSQL.
- **Admin Access**: The default admin password is `admin123`. You can change this in `server.js`.
