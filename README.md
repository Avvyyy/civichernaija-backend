# CivicHerNaija MVP

An empowering platform for young Nigerian women to learn about governance, practice skills through simulations, and participate in real-world opportunities.

## Stack
- **Frontend**: Nuxt 3 (Vue) + Vanilla CSS (Glassmorphism & modern vibrant design prioritizing visual excellence)
- **Backend**: Node.js (Express) + MongoDB
- **Authentication**: JWT Auth (Simple, self-contained for MVP)

## Prerequisites
- Node.js installed
- MongoDB installed and running locally on port `27017`

## How to Run

### 1. Setup Backend
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database (creates demo modules and opportunities):
   ```bash
   node seed.js
   ```
4. Start the backend server:
   ```bash
   npm start # or node server.js
   ```

### 2. Setup Frontend
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Nuxt 3 frontend server:
   ```bash
   npm run dev
   ```

### 3. Usage
- Open your browser to `http://localhost:3000`
- You will see the beautiful landing page. Click **"Sign Up"** to create a dummy account.
- Once signed in, you will be redirected to your **Dashboard**.
- Explore the **Learning Center** (Modules), **Empowerment Practice** (Mock Debates/Proposals), and **Take Action** (Opportunities).
- Complete a module to earn the "Module Completer" badge on your dashboard!
