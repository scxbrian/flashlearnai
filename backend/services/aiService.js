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
    console.log('🔑 Initializing Cohere with API key:', process.env.COHERE_API_KEY.substring(0, 10) + '...');
    cohereClient = new CohereClient({
      token: process.env.COHERE_API_KEY,
    });
    console.log('✅ Cohere client initialized successfully');
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
    console.log('🤖 Making Cohere API request...');
    console.log('📝 System prompt:', systemPrompt.substring(0, 100) + '...');
    console.log('💬 User message:', userMessage);
    
    const response = await cohereClient.chat({
      model: 'command-r-plus',
      message: userMessage,
      preamble: systemPrompt,
      maxTokens: 300,
      temperature: 0.7,
      connectors: []
    });

    console.log('✅ Cohere response received:', response.text);
    return response.text;
  } catch (error) {
    console.error('❌ Cohere API Error Details:', {
      message: error.message,
      status: error.status,
      body: error.body,
      name: error.name
    });
    
    if (error.status === 401) {
      console.error('❌ Cohere Authentication failed - Invalid API key');
    } else if (error.status === 429) {
      console.error('❌ Cohere Rate limit exceeded - Too many requests');
    } else if (error.status === 400) {
      console.error('❌ Cohere Bad request:', error.body);
    } else {
      console.error('❌ Cohere Unknown error:', error.message);
    }
    
    logger.error('Cohere API error:', error);
    return null;
  }
};

export const generateFlashcardsFromContent = async (content, filename) => {
  try {
    console.log(`🎯 Generating flashcards from ${filename}...`);
    
    // Try Cohere first for better quality
    if (cohereClient || process.env.COHERE_API_KEY) {
      if (!cohereClient) {
        cohereClient = initializeCohere();
      }

      if (cohereClient) {
        const aiPrompt = `You are an expert educator. Create high-quality flashcards from the provided content.

IMPORTANT: Return ONLY a valid JSON array with this exact format:
[
  {
    "question": "What is photosynthesis?",
    "answer": "The process by which plants convert light energy into chemical energy",
    "category": "biology",
    "difficulty": "medium",
    "tags": ["plants", "energy"]
  }
]

Guidelines:
- Create 8-12 flashcards maximum
- Focus on key concepts, definitions, and important facts
- Make questions clear and specific
- Provide complete, accurate answers
- Use appropriate difficulty levels (easy/medium/hard)
- Add relevant tags for organization
- Categories: biology, chemistry, physics, mathematics, history, general

Return ONLY the JSON array, no other text.`;
        
        try {
          const aiResponse = await cohereClient.chat({
            model: 'command-r-plus',
            message: content.substring(0, 3000),
            preamble: aiPrompt,
            maxTokens: 1500,
            temperature: 0.7
          });

          console.log('🤖 Cohere flashcard response:', aiResponse.text);
          
          // Try to parse the JSON response
          const cleanResponse = aiResponse.text.trim();
          let jsonStart = cleanResponse.indexOf('[');
          let jsonEnd = cleanResponse.lastIndexOf(']') + 1;
          
          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            const jsonString = cleanResponse.substring(jsonStart, jsonEnd);
            const aiFlashcards = JSON.parse(jsonString);
            
            if (Array.isArray(aiFlashcards) && aiFlashcards.length > 0) {
              console.log(`✅ Generated ${aiFlashcards.length} flashcards using Cohere`);
              return aiFlashcards;
            }
          }
        } catch (parseError) {
          console.warn('⚠️ Failed to parse Cohere response, falling back to rule-based generation');
          console.log('Raw response:', aiResponse?.text);
        }
      }
    }

    // Fallback to rule-based generation
    console.log(`📝 Using rule-based generation for ${filename}`);
    
    const lines = content.split('\n').filter(line => line.trim());
    const flashcards = [];
    
    // Extract key concepts and create flashcards
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for definitions (lines with colons)
      if (line.includes(':') && line.length > 10) {
        const [term, definition] = line.split(':');
        if (term && definition && definition.trim().length > 5) {
          flashcards.push({
            question: `What is ${term.trim()}?`,
            answer: definition.trim(),
            category: detectCategory(filename),
            difficulty: 'medium',
            tags: [term.trim().toLowerCase()]
          });
        }
      }
      
      // Look for formulas or equations
      if (line.includes('=') && (line.includes('²') || line.includes('×') || line.includes('+'))) {
        flashcards.push({
          question: `What is the formula mentioned?`,
          answer: line.trim(),
          category: detectCategory(filename),
          difficulty: 'hard',
          tags: ['formula', 'equation']
        });
      }
      
      // Look for numbered lists or bullet points
      if (line.match(/^\d+\./) || line.startsWith('-') || line.startsWith('•')) {
        const content = line.replace(/^\d+\.|\-|•/, '').trim();
        if (content.length > 10) {
          flashcards.push({
            question: `What is this key concept?`,
            answer: content,
            category: detectCategory(filename),
            difficulty: 'easy',
            tags: ['concept']
          });
        }
      }
    }
    
    // If no specific patterns found, create general flashcards from sentences
    if (flashcards.length === 0) {
      const sentences = content.split('.').filter(s => s.trim().length > 20);
      sentences.slice(0, 8).forEach((sentence, index) => {
        const cleanSentence = sentence.trim();
        if (cleanSentence.length > 15) {
          flashcards.push({
            question: `What is mentioned in the content?`,
            answer: cleanSentence + '.',
            category: detectCategory(filename),
            difficulty: 'medium',
            tags: ['general']
          });
        }
      });
    }
    
    // Ensure we have at least some flashcards
    if (flashcards.length === 0) {
      flashcards.push({
        question: `What is the main topic of ${filename}?`,
        answer: content.split('.')[0] || 'This document contains educational content.',
        category: detectCategory(filename),
        difficulty: 'easy',
        tags: ['general']
      });
    }
    
    console.log(`📚 Generated ${flashcards.length} flashcards from ${filename}`);
    return flashcards.slice(0, 15);
  } catch (error) {
    console.error('❌ Flashcard generation error:', error);
    logger.error('AI flashcard generation error:', error);
    throw new Error('Failed to generate flashcards from content');
  }
};

export const generateQuizFromContent = async (content, filename) => {
  try {
    console.log(`🎯 Generating quiz from ${filename}...`);
    
    // Try Cohere first for better quality
    if (cohereClient || process.env.COHERE_API_KEY) {
      if (!cohereClient) {
        cohereClient = initializeCohere();
      }

      if (cohereClient) {
        const aiPrompt = `You are an expert educator. Create high-quality multiple-choice quiz questions from the provided content.

IMPORTANT: Return ONLY a valid JSON array with this exact format:
[
  {
    "question": "What is photosynthesis?",
    "options": ["Breaking down glucose", "Converting light to chemical energy", "Cell division", "Protein synthesis"],
    "correctAnswer": 1,
    "explanation": "Photosynthesis is the process by which plants convert light energy into chemical energy (glucose).",
    "category": "biology"
  }
]

Guidelines:
- Create 5-8 questions maximum
- Each question should have exactly 4 options
- correctAnswer should be the index (0-3) of the correct option
- Make distractors plausible but clearly wrong
- Provide clear explanations
- Focus on understanding, not memorization
- Categories: biology, chemistry, physics, mathematics, history, general

Return ONLY the JSON array, no other text.`;
        
        try {
          const aiResponse = await cohereClient.chat({
            model: 'command-r-plus',
            message: content.substring(0, 3000),
            preamble: aiPrompt,
            maxTokens: 1500,
            temperature: 0.7
          });

          console.log('🤖 Cohere quiz response:', aiResponse.text);
          
          // Try to parse the JSON response
          const cleanResponse = aiResponse.text.trim();
          let jsonStart = cleanResponse.indexOf('[');
          let jsonEnd = cleanResponse.lastIndexOf(']') + 1;
          
          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            const jsonString = cleanResponse.substring(jsonStart, jsonEnd);
            const aiQuiz = JSON.parse(jsonString);
            
            if (Array.isArray(aiQuiz) && aiQuiz.length > 0) {
              console.log(`✅ Generated ${aiQuiz.length} quiz questions using Cohere`);
              return aiQuiz;
            }
          }
        } catch (parseError) {
          console.warn('⚠️ Failed to parse Cohere quiz response, falling back to rule-based generation');
          console.log('Raw response:', aiResponse?.text);
        }
      }
    }

    // Fallback to existing rule-based generation
    console.log(`📝 Using rule-based quiz generation for ${filename}`);
    const flashcards = await generateFlashcardsFromContent(content, filename);
    
    const quizQuestions = flashcards.slice(0, 8).map((card) => {
      // Generate plausible wrong answers based on category
      const wrongAnswers = generateWrongAnswers(card.answer, card.category);
      
      const options = [card.answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(card.answer);
      
      return {
        question: card.question,
        options,
        correctAnswer: correctIndex,
        explanation: card.answer,
        category: card.category
      };
    });

    console.log(`🎯 Generated ${quizQuestions.length} quiz questions from ${filename}`);
    return quizQuestions;
  } catch (error) {
    console.error('❌ Quiz generation error:', error);
    logger.error('Quiz generation error:', error);
    throw new Error('Failed to generate quiz questions');
  }
};

export const generateNarrationFromContent = async (content, filename) => {
  try {
    console.log(`🎵 Generating narration from ${filename}...`);
    
    // Try Cohere for better narration
    if (cohereClient || process.env.COHERE_API_KEY) {
      if (!cohereClient) {
        cohereClient = initializeCohere();
      }

      if (cohereClient) {
        const aiPrompt = `Create a clear, educational audio narration script from the following content.
Make it suitable for text-to-speech, with natural pacing and clear explanations.
Focus on the most important concepts and make it engaging for learners.
Keep it under 500 words and structure it logically with smooth transitions.`;
        
        try {
          const aiResponse = await cohereClient.chat({
            model: 'command-r-plus',
            message: content.substring(0, 3000),
            preamble: aiPrompt,
            maxTokens: 600,
            temperature: 0.6
          });

          if (aiResponse.text) {
            const result = {
              title: `AI-Generated Audio Summary of ${filename}`,
              content: aiResponse.text,
              duration: Math.ceil(aiResponse.text.length / 12),
              segments: aiResponse.text.split('.').filter(s => s.trim()).map((segment, index) => ({
                id: index,
                text: segment.trim() + '.',
                timestamp: index * 6
              })),
              category: detectCategory(filename)
            };
            
            console.log(`✅ Generated AI narration for ${filename}`);
            return result;
          }
        } catch (error) {
          console.warn('⚠️ Cohere narration failed, using fallback');
        }
      }
    }

    // Fallback to existing generation
    const sentences = content.split('.').filter(s => s.trim().length > 10);
    const keyPoints = sentences.slice(0, 10).map(s => s.trim() + '.');
    
    const narrationText = `
      Welcome to the audio summary of ${filename}. 
      ${keyPoints.join(' ')}
      This concludes the summary of the key concepts from your uploaded content.
    `.trim();
    
    const result = {
      title: `Audio Summary of ${filename}`,
      content: narrationText,
      duration: Math.ceil(narrationText.length / 12),
      segments: keyPoints.map((point, index) => ({
        id: index,
        text: point,
        timestamp: index * 8
      })),
      category: detectCategory(filename)
    };

    console.log(`📝 Generated fallback narration for ${filename}`);
    return result;
  } catch (error) {
    console.error('❌ Narration generation error:', error);
    logger.error('Narration generation error:', error);
    throw new Error('Failed to generate narration from content');
  }
};

const detectCategory = (filename) => {
  const name = filename.toLowerCase();
  if (name.includes('bio')) return 'biology';
  if (name.includes('chem')) return 'chemistry';
  if (name.includes('phys')) return 'physics';
  if (name.includes('math')) return 'mathematics';
  if (name.includes('hist')) return 'history';
  return 'general';
};

const generateWrongAnswers = (correctAnswer, category) => {
  const wrongAnswerTemplates = {
    biology: [
      'Chloroplast organelle function',
      'Nuclear membrane structure',
      'Cytoplasm component role'
    ],
    chemistry: [
      'Ionic compound formation',
      'Molecular bond structure',
      'Atomic orbital configuration'
    ],
    physics: [
      'Electromagnetic force interaction',
      'Gravitational field effect',
      'Kinetic energy transfer'
    ],
    mathematics: [
      'Algebraic expression simplification',
      'Geometric theorem application',
      'Calculus derivative rule'
    ],
    history: [
      'Different historical period',
      'Alternative historical figure',
      'Unrelated historical event'
    ],
    general: [
      'Alternative explanation',
      'Different interpretation',
      'Unrelated concept'
    ]
  };
  
  const templates = wrongAnswerTemplates[category] || wrongAnswerTemplates.general;
  return templates.slice(0, 3);
};

export const getAIInsights = async (userStats, studyData) => {
  try {
    console.log('🔍 Generating AI insights...');
    
    // Try Cohere for personalized insights
    if (cohereClient || process.env.COHERE_API_KEY) {
      if (!cohereClient) {
        cohereClient = initializeCohere();
      }

      if (cohereClient) {
        const prompt = `Analyze this student's learning data and provide personalized insights:
        
Average Score: ${userStats.avgScore}%
Study Streak: ${userStats.studyStreak} days
Cards Studied: ${userStats.cardsStudied}
Quizzes Taken: ${userStats.quizzesTaken}

Provide specific, actionable recommendations for improvement.`;

        try {
          const response = await cohereClient.chat({
            model: 'command-r-plus',
            message: prompt,
            maxTokens: 400,
            temperature: 0.6
          });

          return {
            aiGenerated: true,
            insights: response.text,
            recommendations: [
              'Continue your current study pattern',
              'Focus on weaker subject areas',
              'Maintain consistent daily practice'
            ]
          };
        } catch (error) {
          console.warn('⚠️ Cohere insights failed, using fallback');
        }
      }
    }

    // Fallback insights
    const insights = {
      strengths: [],
      weaknesses: [],
      recommendations: [],
      nextGoals: []
    };
    
    if (userStats.avgScore >= 85) {
      insights.strengths.push('Excellent quiz performance');
    } else if (userStats.avgScore >= 70) {
      insights.strengths.push('Good understanding of concepts');
    }
    
    if (userStats.studyStreak >= 7) {
      insights.strengths.push('Consistent study habits');
    }
    
    if (userStats.avgScore < 70) {
      insights.weaknesses.push('Quiz scores need improvement');
      insights.recommendations.push('Review flashcards more frequently');
    }
    
    if (userStats.studyStreak < 3) {
      insights.weaknesses.push('Inconsistent study schedule');
      insights.recommendations.push('Set a daily study reminder');
    }
    
    insights.nextGoals.push(`Achieve ${Math.min(90, userStats.avgScore + 10)}% average quiz score`);
    insights.nextGoals.push('Maintain a 14-day study streak');

    return insights;
  } catch (error) {
    logger.error('AI insights generation error:', error);
    throw new Error('Failed to generate AI insights');
  }
};