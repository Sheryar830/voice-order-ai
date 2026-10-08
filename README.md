# VoiceOrder AI

VoiceOrder AI is a full-stack voice-based restaurant ordering application built with React, Node.js, Express, and Google Gemini Live API.

Users can speak naturally with the AI, place an order, modify items, confirm the final order, and view the structured order as JSON.

## Live Demo

**Frontend:**  
https://voice-order-ai-tokd.vercel.app

**Backend:**  
https://voice-order-ai-eta.vercel.app

**GitHub:**  
https://github.com/Sheryar830/voice-order-ai

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Google GenAI SDK
- Web Audio API

### Backend
- Node.js
- Express.js
- Google GenAI SDK
- CORS
- dotenv

### Deployment
- GitHub
- Vercel

## Main Features

- Real-time voice conversation
- Google Gemini Live API integration
- Live microphone audio streaming
- User and AI transcription
- AI voice responses
- Restaurant order collection
- Quantity, size, options, and special instructions
- Multi-language conversational support
- Final order confirmation
- Structured JSON order
- Backend order validation and normalization
- Responsive desktop and mobile UI
- No database required

## How It Works

```text
User speaks
    ↓
React captures microphone audio
    ↓
Frontend requests an ephemeral Gemini token from Express
    ↓
Browser connects directly to Gemini Live API
    ↓
Gemini handles the voice conversation
    ↓
Customer confirms the order
    ↓
Gemini calls complete_order
    ↓
Frontend sends the order to /api/order/finalize
    ↓
Express validates and normalizes the order
    ↓
Final JSON is returned to the frontend
    ↓
Order Complete screen
```

The permanent Gemini API key stays on the backend. The browser only receives a short-lived token for the Gemini Live session.

## API Endpoints

```text
GET  /api/health
POST /api/session
POST /api/order/finalize
```

### `/api/session`

Creates a temporary Gemini Live session token.

### `/api/order/finalize`

Validates and normalizes the confirmed order before returning the final JSON to the frontend.

Example:

```json
{
  "customerIntent": "place_order",
  "items": [
    {
      "name": "Pepperoni Pizza",
      "quantity": 1,
      "size": "large",
      "includes": [],
      "specialInstructions": ""
    }
  ],
  "status": "confirmed",
  "totalItems": 1
}
```

## Project Structure

```text
voice-order-ai/
├── client/     # React frontend
├── server/     # Node.js + Express backend
└── README.md
```

## Local Setup

Clone the project:

```bash
git clone https://github.com/Sheryar830/voice-order-ai.git
cd voice-order-ai
```

Backend:

```bash
cd server
npm install
npm run dev
```

Backend `.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

Frontend:

```bash
cd client
npm install
npm run dev
```

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Deployment

The frontend and backend are deployed separately on Vercel from the same GitHub repository.

```text
Frontend root: client
Backend root: server
```

Production frontend uses:

```env
VITE_API_BASE_URL=https://voice-order-ai-eta.vercel.app
```

Backend uses:

```env
CLIENT_URL=https://voice-order-ai-tokd.vercel.app
GEMINI_API_KEY=your_production_key
```

## Author

**Shehryar Waris**

GitHub:  
https://github.com/Sheryar830