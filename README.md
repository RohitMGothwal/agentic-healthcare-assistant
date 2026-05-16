<div align="center">

# 🏥 Agentic Healthcare Assistant

### *Your AI-Powered Healthcare Companion*

[![React Native](https://img.shields.io/badge/React_Native-0.72.10-61DAFB?logo=react)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://python.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK_49-000020?logo=expo)](https://expo.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<p align="center">
  <img src="https://img.shields.io/badge/iOS-Supported-000000?logo=apple" alt="iOS">
  <img src="https://img.shields.io/badge/Android-Supported-3DDC84?logo=android" alt="Android">
  <img src="https://img.shields.io/badge/Web-Ready-4285F4?logo=google-chrome" alt="Web">
</p>

[🚀 Live Demo](#demo) • [📱 Features](#features) • [🔧 Installation](#installation) • [📚 Documentation](#documentation)

<img src="https://raw.githubusercontent.com/RohitMGothwal/agentic-healthcare-assistant/main/assets/demo-banner.png" alt="App Demo" width="800"/>

</div>

---

## ✨ What's New in v2.0

### 🎉 Major Features Added

- **🔬 Symptom Analysis** - AI-powered condition detection with urgency levels
- **💬 WhatsApp Integration** - Coming soon with professional API negotiation status
- **👤 Profile Management** - Complete user profile with health history
- **⚙️ Enhanced Settings** - 9 comprehensive settings sections
- **🌍 Multi-Language Support** - 23 languages with RTL support
- **🎨 Premium UI/UX** - Redesigned interface with dark/light themes

---

## 🎯 Features

### 🤖 AI Health Assistant
<table>
<tr>
<td width="50%">

**Smart Chat System**
- 💬 Natural language health queries
- 🎯 41+ trained medical conditions
- 🔄 Context-aware responses
- 📚 Evidence-based recommendations
- 🌐 Multi-language support

</td>
<td width="50%">

**Symptom Analyzer**
- 🔍 Intelligent symptom matching
- ⚠️ Urgency level detection (High/Medium/Low)
- 💊 Treatment suggestions
- 🏥 Specialist recommendations
- 📋 Detailed condition cards

</td>
</tr>
</table>

### 📱 Mobile App Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🏠 **Dashboard** | Health overview with metrics | ✅ Live |
| 💬 **AI Chat** | 24/7 health assistant | ✅ Live |
| 🔬 **Analyze** | Symptom analysis tool | ✅ Live |
| 📅 **Appointments** | Schedule & manage visits | ✅ Live |
| 👤 **Profile** | User health management | ✅ Live |
| ⚙️ **Settings** | 9 configuration sections | ✅ Live |
| 🆘 **Emergency** | SOS with location sharing | ✅ Live |
| 🌙 **Dark Mode** | Eye-friendly themes | ✅ Live |

### 🌍 Coming Soon

| Feature | Status | ETA |
|---------|--------|-----|
| 💬 WhatsApp Integration | 🟡 Under Negotiation | Q3 2026 |
| 📹 Video Consultations | 🔵 In Development | Q4 2026 |
| 🔗 Health Device Sync | 🔵 In Development | Q4 2026 |
| 🤖 Advanced AI Models | 🟡 Testing Phase | Q3 2026 |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP (React Native)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Screens   │  │  Components │  │     Navigation      │  │
│  │  • Chat     │  │  • Chat     │  │  • Stack Navigator  │  │
│  │  • Profile  │  │  • Voice    │  │  • Tab Navigator    │  │
│  │  • Settings │  │  • SOS      │  │  • Drawer Navigator │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS/REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Auth API   │  │  Chat API   │  │  Analysis API      │  │
│  │  • JWT      │  │  • AI Chat  │  │  • Symptom Check   │  │
│  │  • OAuth2   │  │  • History  │  │  • Conditions      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Health AI  │  │  Database   │  │  Notifications     │  │
│  │  • Local AI │  │  • SQLite   │  │  • Push            │  │
│  │  • Cloud AI │  │  • SQLAlchemy│  │  • SMS             │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- 🐍 Python 3.11+
- 📦 Node.js 18+
- 📱 iOS Simulator (Mac) / Android Emulator
- 🔧 Git

### ⚡ One-Command Setup

```bash
# Clone the repository
git clone https://github.com/RohitMGothwal/agentic-healthcare-assistant.git
cd agentic-healthcare-assistant

# Run setup script
chmod +x setup.sh && ./setup.sh
```

### 🔧 Manual Setup

#### 1️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start servers
# Terminal 1: Backend API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: AI Service
cd ../ai-model
python inference_server_local.py
```

**API Endpoints:**
- 🌐 API Base: `http://localhost:8000`
- 📚 Docs: `http://localhost:8000/docs`
- 💚 Health: `http://localhost:8000/health`
- 🤖 AI Health: `http://localhost:8001`

#### 2️⃣ Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# iOS Setup (Mac only)
cd ios && pod install && cd ..

# Configure API URL
# Edit: src/api/client.ts
const DEV_API_URL = 'http://YOUR_IP:8000/api/v1';

# Start Metro bundler
npx react-native start

# Run on iOS
npx react-native run-ios

# Or run on Android
npx react-native run-android
```

---

## 📱 Screenshots

<div align="center">
<table>
  <tr>
    <td align="center"><b>🏠 Dashboard</b></td>
    <td align="center"><b>💬 AI Chat</b></td>
    <td align="center"><b>🔬 Analysis</b></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/dashboard.png" width="250"/></td>
    <td><img src="assets/screenshots/chat.png" width="250"/></td>
    <td><img src="assets/screenshots/analysis.png" width="250"/></td>
  </tr>
  <tr>
    <td align="center"><b>👤 Profile</b></td>
    <td align="center"><b>⚙️ Settings</b></td>
    <td align="center"><b>🌙 Dark Mode</b></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/profile.png" width="250"/></td>
    <td><img src="assets/screenshots/settings.png" width="250"/></td>
    <td><img src="assets/screenshots/darkmode.png" width="250"/></td>
  </tr>
</table>
</div>

---

## 🧪 Demo Queries

Try these queries in the AI Chat:

```
✅ "I have fever, headache and cough"
✅ "I have chest pain and shortness of breath"
✅ "I have continuous sneezing and watering from eyes"
✅ "I have fatigue, weight loss and excessive hunger"
✅ "I have knee pain and swelling joints"
```

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React Native** 0.72.10 - Cross-platform mobile
- 📦 **Expo** SDK 49 - Development framework
- 🎨 **React Navigation** 6.x - Routing & navigation
- 🌐 **i18next** - Internationalization (23 languages)
- 💾 **AsyncStorage** - Local data persistence

### Backend
- 🚀 **FastAPI** 0.111.0 - High-performance API
- 🗄️ **SQLAlchemy** 2.0 - ORM & database
- 🔐 **JWT** - Authentication & security
- 🤖 **Custom AI** - Rule-based health analysis
- 📊 **Pydantic** - Data validation

### DevOps
- 🐳 **Docker** - Containerization
- ☁️ **Render** - Cloud deployment
- 📱 **GitHub Actions** - CI/CD pipeline

---

## 📊 Project Stats

```
📁 Total Files:        200+
📱 Screens:            15+
🌍 Languages:          23
🤖 AI Conditions:      41
⚡ API Endpoints:       30+
📱 Test Coverage:       85%
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔃 Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- 💚 React Native Community
- ⚡ FastAPI Team
- 🌍 Open Source Contributors
- 🏥 Healthcare Data Providers

---

<div align="center">

### Made with ❤️ by Rohit Gothwal

**[🌐 Website](https://rohitgothwal.com)** • **[💼 LinkedIn](https://linkedin.com/in/rohitgothwal)** • **[🐦 Twitter](https://twitter.com/rohitgothwal)**

⭐ Star this repo if you find it helpful!

</div>

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
