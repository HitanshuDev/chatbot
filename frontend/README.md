# 🚀 AI Chatbot Platform - Frontend

A modern, production-grade Next.js + TypeScript + Tailwind CSS + shadcn/ui SaaS dashboard for managing AI chatbots.

## ✨ Features

### Authentication
- JWT-based authentication
- Google OAuth integration ready
- Protected routes and pages
- Auto-login persistence

### Dashboard
- Real-time statistics and metrics
- Bot overview and quick actions
- Recent activity tracking
- Welcome onboarding

### Bot Management
- Create, read, update, delete bots
- Bot configuration editor
- Model selection (GPT-3.5, GPT-4, GPT-4 Turbo)
- Temperature and token customization
- System prompt configuration

### Conversations
- Chat interface with real-time messaging
- Message history and metadata
- Conversation list management
- User-bot interaction tracking

### Document Management
- Drag-and-drop file upload
- Embedding status tracking
- Document processing progress
- File deletion capabilities

### Analytics & Insights
- Conversation metrics
- Message analytics
- Response time tracking
- Usage trends

### Widget Integration
- Live widget preview
- Embed code generator
- Copy-to-clipboard functionality

## 🛠️ Tech Stack

- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **Components**: shadcn/ui
- **State Management**: Zustand
- **API Client**: Axios
- **Data Fetching**: SWR
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env.local
```

3. **Start development server**
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication
│   ├── dashboard/         # Main dashboard
│   ├── bots/              # Bot management
│   ├── settings/          # User settings
│   └── widget-preview/    # Widget preview
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # shadcn/ui components
├── lib/
│   └── api.ts            # API client wrapper
├── store/
│   └── auth.ts           # Auth state (Zustand)
└── types/
    └── index.ts          # TypeScript definitions
```

## 🚀 Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build
npm start

# Lint code
npm run lint
```

## 🔐 Authentication

- JWT token stored in localStorage
- Token attached to API requests automatically
- Protected pages redirect to login
- Logout clears token and redirects

## 📊 API Integration

Default API URL: `http://localhost:3000/v1`

Update in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

## 🎨 UI Library

All components use shadcn/ui and Tailwind CSS with:
- Responsive design
- Dark/light theme ready
- Accessibility features
- Smooth animations

## 🔄 State Management

Uses Zustand for auth state. Data fetching ready for SWR integration.

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

## 📄 License

MIT
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
