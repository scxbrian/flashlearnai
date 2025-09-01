import { CohereClient } from 'cohere-ai';
import { logger } from '../config/logger.js';

// Initialize Cohere client
let cohereClient = null;

const initializeCohere = () => {
  if (!process.env.COHERE_API_KEY) {
    console.error('❌ COHERE_API_KEY not found in environment variables');
    return null;
  }

  try {
    console.log('🔑 Initializing Cohere for contextual AI with key:', process.env.COHERE_API_KEY.substring(0, 10) + '...');
    cohereClient = new CohereClient({
      token: process.env.COHERE_API_KEY,
    });
    console.log('✅ Cohere client initialized for contextual responses');
    return cohereClient;
  } catch (error) {
    console.error('❌ Failed to initialize Cohere client:', error.message);
    return null;
  }
};

// Enhanced Cohere integration for contextual responses
const getCohereResponse = async (systemPrompt, userMessage) => {
  if (!cohereClient) {
    cohereClient = initializeCohere();
  }

  if (!cohereClient) {
    console.warn('Cohere client not available, using fallback');
    return null;
  }

  try {
    console.log('🤖 Making Cohere contextual request...');
    console.log('📍 Context:', systemPrompt.substring(0, 100) + '...');
    console.log('💬 User message:', userMessage);
    
    const response = await cohereClient.chat({
      model: 'command-r-plus',
      message: userMessage,
      preamble: systemPrompt,
      maxTokens: 300,
      temperature: 0.7
    });

    console.log('✅ Cohere contextual response received:', response.text);
    return response.text;
  } catch (error) {
    console.error('❌ Cohere Contextual API Error:', {
      message: error.message,
      status: error.status,
      body: error.body,
      name: error.name
    });
    
    if (error.status === 401) {
      console.error('❌ Cohere Authentication failed - Invalid API key');
    } else if (error.status === 429) {
      console.error('❌ Cohere Rate limit exceeded');
    } else if (error.status === 400) {
      console.error('❌ Cohere Bad request:', error.body);
    }
    
    logger.error('Cohere contextual API error:', error);
    return null;
  }
};

export const getContextualResponse = async (req, res, next) => {
  try {
    const { tab, context, message } = req.body;
    console.log('🎯 Processing contextual AI request:', { tab, message });

    // Generate contextual prompt based on current tab/page
    const contextualPrompts = {
      dashboard: 'You are helping a user with their learning dashboard. Provide insights about their progress and suggest study strategies. Be encouraging and specific.',
      flashcards: 'You are helping a user with flashcard study. Suggest study techniques, spaced repetition strategies, or help create new flashcards. Focus on effective learning methods.',
      upload: 'You are helping a user with file uploads. Provide guidance on optimal content types and file preparation for flashcard generation. Be practical and helpful.',
      quiz: 'You are helping a user with quizzes. Provide explanations, study tips, or help them understand difficult concepts. Focus on learning and comprehension.',
      profile: 'You are helping a user with their profile and account. Assist with learning optimization and progress tracking. Be supportive and informative.'
    };

    const systemPrompt = contextualPrompts[tab] || 'You are a helpful AI assistant for FlashLearn AI, a smart learning platform. Provide educational guidance and support.';
    
    // Try Cohere first
    const userMessage = message || context || 'How can you help me?';
    let aiResponse = await getCohereResponse(systemPrompt, userMessage);
    
    // Fallback to mock responses if Cohere fails
    if (!aiResponse) {
      console.warn('⚠️ Cohere not available, using fallback responses');
      const mockResponses = {
        dashboard: "Based on your learning progress, I recommend focusing on your weaker subjects. Your biology scores are excellent, but physics could use more attention. Try studying physics flashcards for 15 minutes daily to improve your overall performance.",
        flashcards: "Great question! For better retention, try the spaced repetition technique: review new cards daily, then every 3 days, then weekly. Focus on cards you find difficult and use the voice narration feature for audio learning.",
        upload: "For best results, upload well-structured documents with clear headings and bullet points. PDFs and Word documents work great. Make sure your content has key concepts, definitions, and examples for optimal flashcard generation.",
        quiz: "I can help you understand this concept better! Break down complex problems into smaller steps, and don't hesitate to review related flashcards. Remember, making mistakes is part of learning - focus on understanding the explanations.",
        profile: "Your current Flash Core plan gives you 1,000 flashcards per month. You've used 347 so far. Consider upgrading to Flash Prime if you need more cards or want AI insights. You can also adjust your study preferences for a better experience."
      };
      
      aiResponse = mockResponses[tab] || "I'm here to help you with FlashLearn AI! What specific question do you have about your learning journey?";
    }

    // Generate suggestions based on context
    const suggestions = generateSuggestions(tab, context);

    res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
        suggestions,
        context: tab,
        aiProvider: cohereClient ? 'cohere' : 'fallback'
      }
    });

    logger.info(`AI contextual response generated for user: ${req.user.email}, Tab: ${tab}, Provider: ${cohereClient ? 'cohere' : 'fallback'}`);
  } catch (error) {
    console.error('❌ AI service error:', error);
    logger.error('AI service error:', error);
    
    // Fallback response
    res.status(200).json({
      success: true,
      data: {
        response: "I'm here to help! The AI service is temporarily unavailable, but I can still assist you with general guidance about FlashLearn AI.",
        suggestions: ["Try studying your flashcards", "Take a practice quiz", "Upload new content"],
        context: tab || 'general',
        aiProvider: 'fallback'
      }
    });
  }
};

const generateSuggestions = (tab, context) => {
  const suggestionMap = {
    dashboard: [
      "Review your weakest flashcards",
      "Take a practice quiz",
      "Check your study streak",
      "Upload new study material"
    ],
    flashcards: [
      "Try spaced repetition mode",
      "Focus on difficult cards",
      "Use voice narration",
      "Create custom flashcards"
    ],
    upload: [
      "Upload PDF documents for best results",
      "Try uploading lecture notes",
      "Upload textbook chapters",
      "Check your upload history"
    ],
    quiz: [
      "Review related flashcards",
      "Try a different category",
      "Check answer explanations",
      "Practice more difficult questions"
    ],
    profile: [
      "Check your learning stats",
      "Review your progress",
      "Update study preferences",
      "Track your achievements"
    ]
  };

  return suggestionMap[tab] || [
    "Explore flashcards",
    "Take a quiz",
    "Upload content",
    "Check your progress"
  ];
};