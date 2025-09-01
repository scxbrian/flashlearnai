# FlashLearn AI Backend

A comprehensive Node.js/Express backend for the FlashLearn AI smart learning platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (LTS version)
- MongoDB (local or cloud)
- Instasend account for payments

### Installation

1. **Clone and setup**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your actual values:
   - MongoDB connection string
   - JWT secret key
   - Instasend API keys
   - OpenAI API key (optional)

3. **Start the server**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Tech Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with bcrypt password hashing
- **Payments**: Flutterwave API integration
- **File Upload**: Multer with validation
- **Validation**: Joi for request validation
- **Logging**: Winston with Morgan
- **Security**: Helmet, CORS, rate limiting

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js      # MongoDB connection
│   └── logger.js        # Winston logging setup
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── flashcardController.js # Flashcard CRUD
│   ├── quizController.js    # Quiz management
│   ├── uploadController.js  # File upload handling
│   ├── paymentController.js # Payment processing
│   └── aiController.js      # AI integration
├── middleware/
│   ├── auth.js          # JWT authentication
│   ├── errorHandler.js  # Global error handling
│   └── validation.js    # Request validation
├── models/
│   ├── User.js          # User schema
│   ├── Flashcard.js     # Flashcard schema
│   ├── Quiz.js          # Quiz schema
│   └── Payment.js       # Payment schema
├── routes/
│   ├── auth.js          # Auth routes
│   ├── user.js          # User routes
│   ├── flashcards.js    # Flashcard routes
│   ├── quiz.js          # Quiz routes
│   ├── upload.js        # Upload routes
│   ├── payments.js      # Payment routes
│   └── ai.js            # AI routes
├── services/
│   └── aiService.js     # AI integration services
├── uploads/             # File upload directory
├── logs/                # Application logs
├── server.js            # Main server file
└── package.json
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/progress` - Get learning progress
- `PUT /api/user/subscription` - Update subscription

### Flashcards
- `GET /api/flashcards` - Get user's flashcards
- `POST /api/flashcards` - Create new flashcard
- `PUT /api/flashcards/:id` - Update flashcard
- `DELETE /api/flashcards/:id` - Delete flashcard
- `POST /api/flashcards/:id/study` - Record study session

### Quizzes
- `GET /api/quiz` - Get user's quizzes
- `GET /api/quiz/questions` - Get quiz questions
- `POST /api/quiz/submit` - Submit quiz answers

### File Upload
- `POST /api/upload` - Upload files for processing
- `GET /api/upload/history` - Get upload history

### Payments (Instasend)

### AI Integration
- `POST /api/ai/contextual` - Get contextual AI responses


## 🧠 AI Features

### Content Processing
- Automatic flashcard generation from uploaded documents
- Quiz question creation from flashcards
- Contextual help based on current user activity

### AI Service Integration
- OpenAI-compatible API endpoints
- Contextual responses based on user's current page/activity
- Personalized study recommendations

## 🔒 Security Features

- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt (12 rounds)
- Rate limiting on all endpoints
- CORS protection
- Helmet security headers
- Input validation with Joi
- File upload restrictions and validation

## 📊 Database Schema

### User Model
- Personal information (name, email, password)
- Subscription details (tier, status, usage limits)
- Learning statistics (cards studied, quiz scores, streaks)
- User preferences (notifications, narration, etc.)

### Flashcard Model
- Question and answer content
- Category and difficulty classification
- Study tracking (times studied, mastery level)
- Source document information

### Quiz Model
- Quiz questions with multiple choice options
- User results and scoring
- Performance analytics

### Payment Model
- Transaction tracking
- Flutterwave integration data
- Subscription tier management

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables
Ensure all required environment variables are set:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `FLW_SECRET_KEY` - Flutterwave secret key
- `OPENAI_API_KEY` - OpenAI API key (optional)

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

## 📝 Logging

- Application logs stored in `logs/` directory
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development mode

## 🔄 Frontend Integration

The backend is designed to work seamlessly with the FlashLearn AI React frontend:

1. **CORS**: Configured for `http://localhost:5173`
2. **API Format**: Matches frontend expectations
3. **Authentication**: JWT tokens work with frontend auth context
4. **File Uploads**: Handles multipart form data from frontend

## 📞 Support

For issues or questions:
- Check the logs in `logs/` directory
- Review API documentation above
- Contact: backend@flashlearn.ai