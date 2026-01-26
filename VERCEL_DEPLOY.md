# Deploying to Vercel

Your app is now **Vercel Optimized**. I've added a `vercel.json` configuration file to ensure all routing works perfectly.

## Step-by-Step Vercel Deployment

1.  **Push to GitHub**:
    *   Ensure your latest code (with the Firebase config) is pushed to your GitHub repository.

2.  **Go to Vercel**:
    *   Log in to [vercel.com](https://vercel.com).
    *   Click **"Add New..."** -> **"Project"**.

3.  **Import Repository**:
    *   Select your `TMS` repository.
    *   Vercel will detect `Vite` automatically.
    *   **Framework Preset**: Vite
    *   **Build Command**: `npm run build` (Default)
    *   **Output Directory**: `dist` (Default)

4.  **Click Deploy**:
    *   Wait ~30 seconds.
    *   You will get a live URL (e.g., `https://tms-traffic.vercel.app`).

5.  **Test It**:
    *   Open the link on your **Laptop** (Command Center).
    *   Open the link on your **Phone** (Organizer).
    *   Move around with your phone -> Watch the laptop map update in real-time!

**Troubleshooting Firebase:**
If the map doesn't load data:
*   Check your Firebase Console -> "Realtime Database" -> "Rules".
*   Ensure they are set to **public** (for testing):
    ```json
    {
      "rules": {
        ".read": true,
        ".write": true
      }
    }
    ```
