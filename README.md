# CulinaryLens: Cognitive Culinary Intelligence

CulinaryLens is a AAA-tier Cognitive Culinary Intelligence System designed to act as an architectural bridge between raw inventory and Michelin-grade execution.

## 🚀 Quick Start (VS Code)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation
```bash
# Install dependencies
npm install
```

### 3. Configuration
Create a `.env` file in the root directory:
```env
VITE_API_KEY=your_gemini_api_key_here
```
*Note: The application also supports setting the API key directly within the in-app Settings panel.*

### 4. Development
```bash
# Start the local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Deployment to Vercel 🚀
```bash
# Build and test locally
npm run build
npm run preview

# Deploy to Vercel (requires Vercel CLI)
npm install -g vercel
vercel
```
**Important**: Add `VITE_API_KEY` environment variable in Vercel dashboard after deployment.

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🧠 System Architecture

- **Perception Layer (`/perception`)**: YOLOv11 & SAM-2 hybrid simulation for ingredient detection and freshness estimation.
- **Cognitive Fusion (`/fusion`)**: Deterministic bridge between local ML perception and Gemini cloud reasoning.
- **Neural Synthesis (`/services`)**: Multi-stage protocol generation using Gemini 3 Pro and Flash models.
- **Execution Mode**: Real-time técnica (technique) verification and voice-guided instructions.

## 🛠️ Technology Stack
- **UI**: React 19, Tailwind CSS, Framer Motion
- **Intelligence**: Google Gemini API (@google/genai)
- **Visuals**: Recharts (Analytics), Lucide (Iconography)
- **Deployment**: Vite-ready for zero-latency builds

## 🔒 Security & Privacy
The system utilizes individual API keys. All ingredient processing is handled through secure multimodal pipelines with explicit user-granted permissions for camera and microphone access.
