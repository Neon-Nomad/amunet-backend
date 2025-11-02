# Amunet Backend API

Backend API for Amunet AI - Handles Ra chatbot (OpenAI), Stripe payments, and Google Sheets lead capture.

## 🚀 Quick Start

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Setup Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:

\`\`\`bash
cp .env.example .env
\`\`\`

**Required credentials:**
- OpenAI API key
- Stripe keys (secret, publishable, webhook secret)
- Google Sheets service account credentials
- Spreadsheet ID

### 3. Run Database Migrations
\`\`\`bash
npm run migrate
\`\`\`

### 4. Start Server
\`\`\`bash
# Development
npm run dev

# Production
npm start
\`\`\`

Server will run on `http://localhost:3000`

---

## 📚 API Endpoints

### Health Check
\`\`\`
GET /api/health
\`\`\`

### Ra Chatbot
\`\`\`
POST /api/chat
Body: {
  "messages": [
    { "role": "user", "content": "What is Amunet AI?" }
  ]
}
\`\`\`

### Create Stripe Checkout
\`\`\`
POST /api/stripe/create-checkout
Body: {
  "email": "doctor@example.com",
  "practiceName": "Seattle Dental"
}
\`\`\`

### Save Lead
\`\`\`
POST /api/leads
Body: {
  "email": "doctor@example.com",
  "phone": "206-555-0100",
  "practiceName": "Seattle Dental",
  "location": "Seattle, WA",
  "conversation": "Chat history..."
}
\`\`\`

### Stripe Webhook
\`\`\`
POST /api/webhook/stripe
(Stripe sends this automatically)
\`\`\`

---

## 🔧 Setup Guides

### Getting Stripe Keys

1. Go to https://dashboard.stripe.com/
2. Get your **Secret Key**: Developers → API keys → Secret key
3. Get your **Publishable Key**: Developers → API keys → Publishable key
4. Create Products:
   - Go to Products → Add Product
   - Create "Amunet AI Monthly" at $697/month
   - Copy the Price ID (starts with `price_...`)
5. Setup Webhook:
   - Developers → Webhooks → Add endpoint
   - URL: `https://your-backend.vercel.app/api/webhook/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.*`
   - Copy Webhook Secret

### Getting Google Sheets Credentials

1. Go to https://console.cloud.google.com/
2. Create new project (or select existing)
3. Enable Google Sheets API
4. Create Service Account:
   - IAM & Admin → Service Accounts → Create
   - Download JSON key file
5. Extract from JSON:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY`
6. Create Google Sheet:
   - Create new sheet with columns: Timestamp | Email | Phone | Practice | Location | Conversation
   - Share sheet with service account email (Editor access)
   - Copy Spreadsheet ID from URL

---

## 🚀 Deploy to Vercel

1. Install Vercel CLI:
\`\`\`bash
npm i -g vercel
\`\`\`

2. Deploy:
\`\`\`bash
vercel
\`\`\`

3. Add environment variables in Vercel dashboard

4. Update Stripe webhook URL to your Vercel domain

---

## 📝 Environment Variables

See `.env.example` for all required variables.

**Security:** Never commit `.env` to Git!

---

## 🛠️ Tech Stack

- **Node.js** + Express
- **Knex** + SQLite (database)
- **OpenAI** (Ra chatbot)
- **Stripe** (payments)
- **Google Sheets API** (lead capture)

---

## 📧 Support

Questions? Email andrew@amunet.ai
\`\`\`

