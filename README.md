# FlashLearn AI - Smart Learning Platform
https://flashlearn-ai-fronte-rfp4.bolt.host
A modern, AI-powered learning platform that transforms any document into interactive flashcards and quizzes. Built by Brian Kennedy and Lynder Scheville

## 🚀 Features

- **AI-Powered Content Generation**: Upload documents and automatically generate flashcards and quizzes
- **Interactive Flashcards**: Study with smart flashcards featuring spaced repetition
- **Adaptive Quizzes**: Take personalized quizzes that adapt to your learning progress
- **Progress Tracking**: Detailed analytics and insights on your learning journey
- **Voice Narration**: Audio support for flashcards and content
- **Dark Mode**: Beautiful dark/light theme switching
- **Responsive Design**: Optimized for all devices
- **Contextual AI Assistant**: Get help anywhere in the app

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom design system
- **Routing**: React Router v6+
- **State Management**: React Query for server state
- **Authentication**: JWT-based with protected routes
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthModal.tsx   # Authentication modal
│   ├── Button.tsx      # Custom button component
│   ├── Card.tsx        # Card container component
│   ├── Navbar.tsx      # Navigation bar
│   ├── Footer.tsx      # Footer component
│   ├── Tabs.tsx        # Tab navigation
│   ├── PricingModal.tsx # Subscription modal
│   └── AIButton.tsx    # Floating AI assistant
├── pages/              # Page components
│   ├── Landing.tsx     # Landing page
│   ├── Dashboard.tsx   # User dashboard
│   ├── Flashcards.tsx  # Flashcard viewer
│   ├── Upload.tsx      # File upload page
│   ├── Quiz.tsx        # Quiz interface
│   └── Profile.tsx     # User profile
├── context/            # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── ThemeContext.tsx # Theme management
├── hooks/              # Custom hooks
├── api/                # API client
├── utils/              # Utility functions
└── App.tsx             # Main app component
```

## 🎨 Design System

### Colors
- **Primary**: Indigo (#6366F1)
- **Secondary**: Purple (#8B5CF6)
- **Accent**: Emerald (#10B981)
- **Success**: Green (#22C55E)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Line Heights**: 150% for body, 120% for headings

### Spacing
- **System**: 8px base unit
- **Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)

## 🔐 Authentication

The app uses JWT-based authentication with:
- Email/password login and signup
- Protected routes for authenticated users
- Automatic token validation
- Secure logout functionality

## 💳 Subscription Tiers

1. **Flash Lite** - Free
2. **Flash Core** - KSH 300/month
3. **Flash Prime** - KSH 999/month
4. **Flash Prime Plus** - KSH 1,999/month
5. **Flash Titan** - Enterprise (Contact Sales)

## 🤖 AI Features

- **Contextual Assistant**: Floating AI button provides help based on current page
- **Content Generation**: AI analyzes uploaded documents to create flashcards
- **Smart Quizzes**: Adaptive questioning based on learning progress
- **Voice Narration**: Text-to-speech for flashcards and content

## 📱 Responsive Design

- Mobile-first approach
- Optimized touch interactions
- Collapsible navigation
- Adaptive layouts for all screen sizes

## 🚀 Deployment

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 🧪 Testing

Run tests:
```bash
npm run test
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, email support@flashlearn.ai or visit our help center.
