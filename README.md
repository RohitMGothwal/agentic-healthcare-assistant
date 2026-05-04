# Agentic Healthcare Assistant

Agentic AI Healthcare Assistant: a full-stack platform for symptom analysis, early disease prediction, and health awareness. Uses NLP, ML, and multi-agent AI to route queries across specialties, provide explainable insights, detect emergencies, and support mental health with secure, scalable APIs.

## Features

- 🤖 AI-powered health chat with 20+ specialist modes
- 📊 Health metrics tracking and reporting
- 📅 Appointment management
- 🌍 Multi-language support (23 languages)
- 🌙 Dark/Light theme support
- 📱 Cross-platform mobile app (iOS/Android)
- 🔐 Secure authentication with JWT
- 🚨 Emergency SOS functionality
- 📈 Admin dashboard with analytics

## Project Structure

```
agentic-healthcare-assistant/
├── backend/          # FastAPI API server
│   ├── app/         # Application code
│   │   ├── api/     # API routes
│   │   ├── core/    # Configuration & security
│   │   ├── db/      # Database models
│   │   ├── models/  # SQLAlchemy models
│   │   ├── schemas/ # Pydantic schemas
│   │   └── services/# Business logic
│   └── requirements.txt
├── mobile/          # Expo React Native app
│   ├── src/         # Source code
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   └── api/
│   └── assets/i18n/ # Translations
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn
- iOS Simulator (Mac) or Android Emulator

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your API keys (see Configuration section)
```

5. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/api/client.ts`:
```typescript
// For iOS Simulator, use your Mac's IP address
const DEV_API_URL = 'http://YOUR_MAC_IP:8000/api/v1';
// For Android Emulator:
// const DEV_API_URL = 'http://10.0.2.2:8000/api/v1';
```

4. Start the development server:
```bash
npx expo start
```

5. Press:
- `i` for iOS Simulator
- `a` for Android Emulator
- Scan QR code with Expo Go app on physical device

## Configuration

### AI Provider Setup (Choose One)

**Option 1: Groq (Recommended - Free Tier)**
1. Sign up at [groq.com](https://groq.com)
2. Get your API key
3. Add to `.env`:
```env
GROQ_API_KEY=your-groq-api-key
AI_PROVIDER=groq
```

**Option 2: OpenAI**
```env
OPENAI_API_KEY=your-openai-key
AI_PROVIDER=openai
```

**Option 3: Ollama (Self-hosted)**
```bash
# Install Ollama
brew install ollama
ollama pull llama2
```
```env
USE_OLLAMA=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### Optional: Twilio Setup (for SMS/WhatsApp)
1. Sign up at [twilio.com](https://twilio.com)
2. Get your Account SID and Auth Token
3. Add to `.env`:
```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_SMS_NUMBER=your-twilio-number
TWILIO_WHATSAPP_NUMBER=your-whatsapp-number
```

## Deployment

### Backend (Render)

1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect your GitHub repository
4. Set environment variables in Render dashboard
5. Deploy!

### Mobile (EAS Build)

```bash
cd mobile
# Login to Expo
npx eas login

# Configure build
npx eas build:configure

# Build for production
npx eas build --platform ios  # or android
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Register new user |
| `/api/v1/auth/login` | POST | Login user |
| `/api/v1/chat/` | GET | Get chat history |
| `/api/v1/chat/` | POST | Send chat message |
| `/api/v1/appointments/` | GET | List appointments |
| `/api/v1/appointments/` | POST | Create appointment |
| `/api/v1/health-report/` | GET | Get health report |
| `/api/v1/admin/dashboard` | GET | Admin dashboard stats |

## Troubleshooting

### Backend Issues

**ImportError: No module named 'jose'**
- Fixed: Code now uses PyJWT instead of python-jose

**Database errors**
- Delete `healthcare.db` and restart to recreate tables

**AI not responding**
- Check your API key in `.env`
- Verify AI provider is set correctly

### Mobile Issues

**Cannot connect to backend**
- Update `DEV_API_URL` in `src/api/client.ts` with your actual IP
- Ensure backend is running
- Check firewall settings

**iOS build fails**
```bash
cd mobile/ios
pod install
cd ..
npx expo run:ios
```

**Android build fails**
```bash
cd mobile/android
./gradlew clean
cd ..
npx expo run:android
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please open an issue on GitHub.
