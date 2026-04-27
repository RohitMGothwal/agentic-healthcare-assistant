# Agentic Healthcare Assistant

Agentic AI Healthcare Assistant: a full-stack platform for symptom analysis, early disease prediction, and health awareness. Uses NLP, ML, and multi-agent AI to route queries across specialties, provide explainable insights, detect emergencies, and support mental health with secure, scalable APIs.

## Project structure

- `backend/`: FastAPI API server
- `mobile/`: Expo mobile application

## Local setup

### Backend

```bash
cd backend
/opt/homebrew/bin/python3.11 -m pip install -r requirements.txt
cp .env.example .env
# update backend/.env as needed
/opt/homebrew/bin/python3.11 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

## GitHub deployment

1. Create a new GitHub repository.
2. Add the remote:

```bash
git remote add origin https://github.com/your-username/your-repo.git
```

3. Push:

```bash
git push -u origin main
```
