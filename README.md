# ReflectAI - User-Authenticated Journal & Reflection App

A production-grade, user-authenticated personal reflection and journaling application built with **React 19**, **Express**, **Cloud Firestore**, and **Gemini 3.6 Flash**. User entries and multi-turn conversations are strictly isolated to each authenticated user using owner-bound Firestore security rules.

---

## 1. Architecture Overview

- **User Identity**: Firebase Authentication with Federated Google Sign-In (no passwords stored or managed by the app).
- **Database & Persistence**: Cloud Firestore with user isolation (`/users/{userId}/reflections/{reflectionId}` and `/users/{userId}/interactions/{interactionId}`).
- **AI Processing Engine**: Gemini 3.6 Flash via a server-side proxy with an automated, resilient fallback ladder (`gemini-3.6-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest` &rarr; `gemini-3.7-flash`).
- **Secret Hygiene**: All Gemini API keys and credentials reside securely on the backend / Secret Manager and are never exposed to the client browser.

---

## 2. Environment & Prerequisites

1. **Google Cloud SDK (`gcloud` CLI)** installed and authenticated:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable Required Google Cloud APIs**:
   ```bash
   gcloud services enable \
     run.googleapis.com \
     secretmanager.googleapis.com \
     firestore.googleapis.com \
     aiplatform.googleapis.com
   ```

3. **Node.js**: v20 or higher.

---

## 3. Secret Management Setup

Store your Gemini API key in **Google Cloud Secret Manager** and grant Cloud Run the required IAM read permissions:

```bash
# 1. Create and populate the GEMINI_API_KEY secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Grant the default Compute Engine service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 4. Firestore Security Rules Configuration

To guarantee user data isolation, deploy the following rules via the Firebase CLI or Google Cloud Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data isolation: only the authenticated owner can access their data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Explicit interaction path for challenge verification
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy using Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 5. Local Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables in .env
GEMINI_API_KEY="your-gemini-api-key"

# 3. Run development server
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

---

## 6. Cloud Run Deployment Flow

Build and deploy the application container to Google Cloud Run:

```bash
# 1. Build and deploy to Cloud Run with Secret Manager mounting
gcloud run deploy reflect-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --port 3000
```

---

## 7. Required Campaign Labeling Verification

Apply the required challenge verification label to your deployed Cloud Run service:

```bash
gcloud run services update reflect-ai \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 8. Threat Summary & Security Controls

| Threat Zone | Identified Risk | Countermeasure Implemented |
| :--- | :--- | :--- |
| **Input Surfaces** | Oversized payloads or malicious injection in prompt textarea | Input length cap (15,000 chars), JSON body-parser size limit (2MB), defensive null-safe destructuring |
| **Planning & Reasoning** | Prompt injection attempting to alter system role or leak prompts | Structured system instructions isolating user text as plain data; defensive role separation in multi-turn turns |
| **Tool Execution** | SSRF or unauthorized external calls | No dynamic tool execution allowed; Gemini calls are constrained strictly to predefined prompts and modes |
| **Memory & State** | Cross-user data leakage or unauthorized document access | Strict owner-bound Firestore security rules (`request.auth.uid == userId`); client-side operations use authenticated UID; undefined-stripped payloads |
| **Inter-System Communication** | Gemini API key leakage or client-side interception | Server-side proxy (`/api/gemini/reflect`) keeps API keys on backend; zero public API key exposure in Vite bundle |
