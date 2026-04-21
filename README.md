# LeadRadar 🎯

A private lead-generation and client acquisition system for finding local businesses that need websites or digital services.

## Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + Puppeteer
- **Database & Auth**: Firebase (Firestore + Authentication)

## Setup

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called `lead-radar`
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** (start in test mode)
5. Go to Project Settings → Your apps → Add Web App
6. Copy your Firebase config

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your Firebase Admin SDK credentials in .env
node index.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Fill in your Firebase web config in .env
npm run dev
```

## Usage
1. Log in with your email/password
2. Enter a search query (e.g., "restaurants in Guwahati")
3. Click **Fetch Leads** to scrape Google Maps
4. Filter by "No Website" + "High Score"
5. Copy a message template and contact them
6. Mark leads as contacted and add notes

## Lead Scoring
- No website: +40 points
- Reviews > 100: +20 points
- Reviews > 50: +10 points
- Rating ≥ 4.5: +15 points
- Rating ≥ 4.0: +10 points
- High-value category (restaurant, gym, hotel, etc.): +15 points
- **Hot Lead** = Score ≥ 70
