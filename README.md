# FinCa - Personal Finance Tracker

A smart personal finance tracker built with Next.js, Express, and MongoDB.

## Project Structure

```
finCa/
├── client/          # Next.js 14 frontend (Vercel)
├── server/          # Express.js API (Render)
└── .gitignore
```

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Vercel account (for frontend)
- Render account (for backend)

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/valour11/finca.git
cd finca

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 2. Configure Environment Variables

**Server (.env):**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
```

**Client (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

### 3. Run Locally

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

Visit http://localhost:3000

## Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Build command: `npm install`
4. Start command: `node src/index.js`
5. Add environment variables

### Frontend (Vercel)
 your1. Import GitHub repo to Vercel
2. Framework: Next.js
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

## Features

- User authentication (email/password)
- Track income and expenses
- Recurring transactions
- Dashboard with charts
- Weekly and monthly analytics
- Financial health scoring

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Express.js, MongoDB, JWT
- **Auth**: bcryptjs

## License

MIT
>>>>>>> 94f2094 (finCa mvp)
