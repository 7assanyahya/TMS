# Deployment Instructions

Your Traffic Management System (TMS) is ready for deployment. Since this is a Client-Side Single Page Application (SPA), it can be deployed for free on robust platforms like **Netlify** or **Vercel**.

## Option 1: Netlify (Recommended for ease of use)
1.  **Drag and Drop**:
    *   Go to [app.netlify.com/drop](https://app.netlify.com/drop).
    *   Drag the `dist` folder (located in your project directory `C:\Users\hassa\Documents\TMS\dist`) onto the page.
    *   **Done!** Netlify will give you a live URL instantly.

2.  **Via Git (Continuous Deployment)**:
    *   Push your code to GitHub.
    *   Log in to Netlify and click "New site from Git".
    *   Choose your repository.
    *   Build settings will be auto-detected:
        *   **Build command**: `npm run build`
        *   **Publish directory**: `dist`
    *   Click "Deploy site".

## Option 2: Vercel
1.  Go to [vercel.com](https://vercel.com) and log in.
2.  Import your Git repository.
3.  Vercel will auto-detect Vite.
4.  Click **Deploy**.

## Important Logic Note
This application currently uses `localStorage` to simulate a backend.
*   **Limitation**: Traffic data is synchronized **locally within the same browser**.
*   **Deploy Behavior**: If you open the **Manager** on your laptop and the **Organizer** on your phone, **they will NOT see each other** because they are different devices with different `localStorage`.
*   **To fix this for real-world multi-device usage**, you would need a real backend (like Firebase, Supabase, or a Node.js server) instead of the current `useTrafficData` hook.

## Future Upgrade (Real-time Backend)
To make this work across different devices over the internet, we would switch from `localStorage` to **Firebase Realtime Database**:
1.  Create a Firebase project.
2.  Install Firebase: `npm install firebase`.
3.  Update `useTrafficData.js` to listen to Firebase `onValue` instead of `window.addEventListener('storage')`.
