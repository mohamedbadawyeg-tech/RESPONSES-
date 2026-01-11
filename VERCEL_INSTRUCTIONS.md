# How to Deploy to Vercel (Free & Fast)

Since you chose the **Google Sheets + Vercel** method, follow these steps.

## Step 1: Set up the Google Sheet Backend
1. Create a new Google Sheet at [sheets.google.com](https://sheets.google.com).
2. Go to **Extensions** > **Apps Script**.
3. Delete any code in the editor.
4. Open the file `GOOGLE_SHEETS_SCRIPT.js` in this project, copy ALL the code, and paste it into the Apps Script editor.
5. **Save** the project (Disk icon).
6. Run the function `initialSetup` **ONCE** manually:
   - Select `initialSetup` from the dropdown menu at the top.
   - Click **Run**.
   - Review Permissions > Choose Account > Advanced > Go to (unsafe) > Allow.
7. **Deploy the Web App**:
   - Click blue **Deploy** button (top right) > **New deployment**.
   - Click the Gear icon (Select type) > **Web app**.
   - **Description**: `Employee Portal`.
   - **Execute as**: `Me` (your email).
   - **Who has access**: `Anyone` (This is crucial for it to work).
   - Click **Deploy**.
8. **Copy the Web App URL** (it ends with `/exec`).

## Step 2: Connect the App to the Sheet
1. Open the file `App.tsx` in this project.
2. Find line 13: `const GOOGLE_SCRIPT_URL = "PASTE_YOUR_WEB_APP_URL_HERE";`
3. Paste your copied Web App URL inside the quotes.
   - Example: `const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx.../exec";`
4. Save the file.

## Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up (free).
2. Install Vercel CLI (optional) OR just drag and drop:
   - **Easiest Way:**
     - Push your latest code to GitHub (I can help you do this).
     - On Vercel dashboard, click **"Add New..."** > **"Project"**.
     - Import your GitHub repository.
     - Framework Preset: **Vite**.
     - Click **Deploy**.

## Step 4: Done!
Vercel will give you a link (e.g., `arabic-employee-portal.vercel.app`). Send this link to your employees!
