# Firebase Setup Guide for Nerón Inventory

This guide will help you set up Firebase and Firestore for your Nerón Inventory application.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `neron-inventory` (or any name you prefer)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 2: Create a Web App in Firebase

1. In your Firebase project, click on the web icon (`</>`) to add a web app
2. Register your app with a nickname like "Nerón Inventory Web"
3. **Do NOT enable Firebase Hosting** (we're using Vercel/your own hosting)
4. Click "Register app"
5. You'll see the Firebase configuration object - keep this page open!

## Step 3: Set Up Firestore Database

1. In the Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (we'll configure rules later)
4. Select a Firestore location closest to you (e.g., `us-central1` for USA, `southamerica-east1` for Brazil/Argentina)
5. Click "Enable"

Your Firestore database is now created!

## Step 4: Configure Security Rules (Important!)

Since this is a single-user app without authentication, we'll use open security rules for now.

1. In Firestore, go to the **Rules** tab
2. Replace the content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents
    // WARNING: This is for development only!
    // In production, add authentication and proper rules
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

**Security Note**: These rules allow anyone with your Firebase config to read/write data. For production:
- Add Firebase Authentication
- Restrict rules to authenticated users only
- Or keep the app internal and don't expose credentials

## Step 5: Get Your Firebase Configuration

From the Firebase Console:

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll down to "Your apps" section
3. You should see your web app registered
4. Click on "Config" to view the configuration
5. Copy the `firebaseConfig` object values

You'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "neron-inventory.firebaseapp.com",
  projectId: "neron-inventory",
  storageBucket: "neron-inventory.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

## Step 6: Configure Environment Variables

1. In your project root, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your Firebase configuration:

```env
# Keep your existing Gemini API key
GEMINI_API_KEY=your_existing_gemini_key

# Add your Firebase configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=neron-inventory.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=neron-inventory
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=neron-inventory.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
```

3. Save the file

## Step 7: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Open the browser console (F12)

4. Try creating a new client or employee

5. Check the Firestore Console - you should see data appearing in the `clients` collection!

## Step 8: Verify Data in Firestore

1. Go to Firebase Console > Firestore Database
2. You should see a `clients` collection
3. Click on it to see your client documents
4. Each document should have the structure:
   - id, name, cuit, arcaPassword, contact, tasks
   - createdAt, updatedAt (as Timestamps)
   - monthlyRecords (as a Map)
   - employees (as an Array)

## Troubleshooting

### Error: "Firebase: No Firebase App '[DEFAULT]' has been created"

**Solution**: Make sure all your environment variables are set correctly and restart your dev server.

### Error: "Missing or insufficient permissions"

**Solution**: Check your Firestore security rules. They should allow read/write access (see Step 4).

### Data not appearing in Firestore

1. Check the browser console for errors
2. Verify your Firebase config in `.env.local`
3. Make sure Firestore is enabled in your Firebase project
4. Try refreshing the page and creating a new client

### Firebase quota warnings

Firebase free tier includes:
- **50,000 reads/day**
- **20,000 writes/day**
- **1 GB storage**

This is more than enough for a single-user app. If you exceed limits, Firebase will show warnings in the console.

## Next Steps

### Optional: Add Firebase Authentication

For production, you should add authentication:

1. In Firebase Console, go to **Build > Authentication**
2. Enable **Email/Password** authentication
3. Update security rules to require authentication
4. Add login/signup pages to your app
5. Update `src/lib/storage-firestore.ts` to filter by user ID

### Optional: Enable Offline Persistence

Firestore supports offline data persistence. To enable:

```typescript
// In src/lib/firebase.ts
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistence not available in this browser');
  }
});
```

### Monitor Usage

Keep an eye on your Firebase usage:
1. Go to **Usage and billing** in Firebase Console
2. Check reads/writes/storage usage
3. Set up budget alerts if needed

## Success!

Your Nerón Inventory app is now using Firestore! All data is automatically synced to the cloud, and you can access it from any device.

The app works exactly the same as before, but now with cloud persistence instead of localStorage.
