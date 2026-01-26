# Firebase Setup Guide

To enable real-time tracking across the internet (e.g. Phone <-> Laptop), follow these steps to set up Firebase.

## 1. Create a Firebase Project
1.  Go to [console.firebase.google.com](https://console.firebase.google.com/).
2.  Click **"Add project"**.
3.  Name it (e.g., `tms-traffic-live`).
4.  Disable Google Analytics (not needed for this demo) and click **"Create project"**.

## 2. Create the Web App & Get Config
1.  In your project dashboard, click the **Web icon `</>`** (looks like `</>`) to add an app.
2.  Name it (e.g., `tms-web`).
3.  Click **"Register app"**.
4.  **Copy the `firebaseConfig` object** (It looks like the code below).
    ```javascript
    const firebaseConfig = {
      apiKey: "AIzaSy...",
      authDomain: "...",
      projectId: "...",
      // ...
    };
    ```
5.  Open `src/lib/firebase.js` in this project and **PASTE** your config there, replacing the placeholders.

## 3. Enable Realtime Database
1.  In the Firebase Console sidebar, go to **Build** -> **Realtime Database**.
2.  Click **"Create Database"**.
3.  Choose a location (e.g., Belgium or US) -> **Next**.
4.  **IMPORTANT**: Select **Start in test mode**.
    *   This allows anyone with the credentials to write to the DB. (This is fine for a demo, but secure it later for production).
5.  Click **Enable**.

## 4. Done!
*   Restart your app (`npm run dev`).
*   Now, when you move on your phone, the manager on the laptop will see it update instantly over the internet!
