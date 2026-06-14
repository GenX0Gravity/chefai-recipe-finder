# ChefAI Recipe Finder

ChefAI is an advanced, AI-powered culinary companion designed to revolutionize the way you discover, plan, and create meals. Built with Next.js 16 (App Router), Prisma, PostgreSQL, and Google Generative AI (Gemini 1.5 Pro).

## ✨ Features

- **AI Recipe Generation**: Generate tailored recipes based on available ingredients, dietary preferences, and skill level.
- **Premium Meal Planner**: AI-generated weekly and daily meal plans matching your caloric and dietary needs.
- **Smart Grocery List**: Automatically cross-references missing ingredients and builds a shopping list with estimated costs.
- **Voice Cooking Assistant**: Hands-free cooking with step-by-step voice guidance and speech recognition commands.
- **Personal Cookbook**: Save, organize, edit, and categorize your favorite recipes.
- **Beautiful Dark Mode UI**: A highly responsive, glassmorphism-inspired dark mode interface with smooth animations.

## 🛠 Tech Stack

- **Framework**: Next.js 16.2.9 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion, Lucide Icons, Shadcn UI
- **Database**: PostgreSQL (Prisma ORM with PG Adapter)
- **Authentication**: NextAuth.js (Google, GitHub providers)
- **AI Engine**: Google Generative AI (Gemini 1.5 Flash/Pro)
- **Deployment**: Google Cloud Run (Standalone output)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL Database
- Google Gemini API Key
- OAuth Credentials (Google/GitHub)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chefai-recipe-finder.git
cd chefai-recipe-finder
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your_google_id"
GOOGLE_CLIENT_SECRET="your_google_secret"
GEMINI_API_KEY="your_gemini_api_key"
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 📦 Deployment (Google Cloud Run)

This project is configured for standalone deployment on Google Cloud Run via Docker.

1. Build the Docker image:
```bash
docker build -t gcr.io/your-project-id/chefai .
```

2. Push to Container Registry:
```bash
docker push gcr.io/your-project-id/chefai
```

3. Deploy to Cloud Run:
Deploy using the GCP Console, setting the Environment Variables defined in the `.env` section.

## 📜 License
MIT
