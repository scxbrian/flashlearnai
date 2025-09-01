import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { logger } from '../config/logger.js';

export const getQuizzes = async (req, res, next) => {
  try {
    const { category } = req.query;
    
    const filter = { userId: req.user.id, isActive: true };
    if (category && category !== 'all') filter.category = category;

    const quizzes = await Quiz.find(filter)
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizQuestions = async (req, res, next) => {
  try {
    const { category = 'all' } = req.query;
    
    // Mock quiz questions for demo - in production, these would be generated from flashcards or AI
    const mockQuestions = [
      {
        question: 'Which organelle is responsible for protein synthesis?',
        options: ['Mitochondria', 'Ribosome', 'Nucleus', 'Golgi apparatus'],
        correctAnswer: 1,
        explanation: 'Ribosomes are the cellular structures responsible for protein synthesis.',
        category: 'biology',
      },
      {
        question: 'What is the function of the cell membrane?',
        options: ['Energy production', 'Protein synthesis', 'Selective permeability', 'DNA storage'],
        correctAnswer: 2,
        explanation: 'The cell membrane controls what enters and exits the cell through selective permeability.',
        category: 'biology',
      },
      {
        question: 'Which process converts glucose into ATP?',
        options: ['Photosynthesis', 'Cellular respiration', 'Transcription', 'Translation'],
        correctAnswer: 1,
        explanation: 'Cellular respiration breaks down glucose to produce ATP for cellular energy.',
        category: 'biology',
      },
      {
        question: 'What is photosynthesis?',
        options: ['Breaking down glucose', 'Converting light to chemical energy', 'Cell division', 'Protein synthesis'],
        correctAnswer: 1,
        explanation: 'Photosynthesis is the process by which plants convert light energy into chemical energy (glucose).',
        category: 'biology',
      },
      {
        question: 'What is the pH of pure water at 25°C?',
        options: ['6', '7', '8', '9'],
        correctAnswer: 1,
        explanation: 'Pure water has a pH of 7, which is considered neutral.',
        category: 'chemistry',
      },
      {
        question: 'Which element has the atomic number 6?',
        options: ['Oxygen', 'Carbon', 'Nitrogen', 'Hydrogen'],
        correctAnswer: 1,
        explanation: 'Carbon has 6 protons, giving it an atomic number of 6.',
        category: 'chemistry',
      },
      {
        question: 'What type of bond forms between sodium and chlorine?',
        options: ['Covalent bond', 'Ionic bond', 'Hydrogen bond', 'Metallic bond'],
        correctAnswer: 1,
        explanation: 'Sodium and chlorine form an ionic bond by transferring electrons.',
        category: 'chemistry',
      },
      {
        question: 'What is the chemical symbol for gold?',
        options: ['Go', 'Au', 'Ag', 'Gd'],
        correctAnswer: 1,
        explanation: 'Au is the chemical symbol for gold, derived from the Latin word "aurum".',
        category: 'chemistry',
      },
      {
        question: 'What is the acceleration due to gravity on Earth?',
        options: ['8.8 m/s²', '9.8 m/s²', '10.8 m/s²', '11.8 m/s²'],
        correctAnswer: 1,
        explanation: 'The acceleration due to gravity on Earth is approximately 9.8 m/s².',
        category: 'physics',
      },
      {
        question: 'What is Newton\'s first law of motion?',
        options: ['F = ma', 'An object at rest stays at rest', 'For every action, there is an equal and opposite reaction', 'E = mc²'],
        correctAnswer: 1,
        explanation: 'Newton\'s first law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.',
        category: 'physics',
      },
      {
        question: 'What is the speed of light in a vacuum?',
        options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'],
        correctAnswer: 0,
        explanation: 'The speed of light in a vacuum is approximately 3 × 10⁸ meters per second.',
        category: 'physics',
      },
      {
        question: 'What is the formula for kinetic energy?',
        options: ['KE = mv', 'KE = ½mv²', 'KE = mgh', 'KE = mc²'],
        correctAnswer: 1,
        explanation: 'Kinetic energy is calculated as KE = ½mv², where m is mass and v is velocity.',
        category: 'physics',
      },
      {
        question: 'What is the derivative of x²?',
        options: ['x', '2x', 'x³', '2x²'],
        correctAnswer: 1,
        explanation: '2x - Using the power rule of differentiation.',
        category: 'mathematics',
      },
      {
        question: 'What is the integral of 2x?',
        options: ['x²', 'x² + C', '2', '2x²'],
        correctAnswer: 1,
        explanation: 'The integral of 2x is x² + C, where C is the constant of integration.',
        category: 'mathematics',
      },
      {
        question: 'What is the value of π (pi) to 3 decimal places?',
        options: ['3.141', '3.142', '3.143', '3.144'],
        correctAnswer: 1,
        explanation: 'π (pi) is approximately 3.142 when rounded to 3 decimal places.',
        category: 'mathematics',
      },
      {
        question: 'What is the quadratic formula?',
        options: ['x = -b ± √(b² - 4ac) / 2a', 'x = a² + b² = c²', 'x = mx + b', 'x = πr²'],
        correctAnswer: 0,
        explanation: 'The quadratic formula x = (-b ± √(b² - 4ac)) / 2a solves equations of the form ax² + bx + c = 0.',
        category: 'mathematics',
      },
      {
        question: 'When did World War II end?',
        options: ['1944', '1945', '1946', '1947'],
        correctAnswer: 1,
        explanation: 'World War II ended in 1945 when Japan formally surrendered.',
        category: 'history',
      },
    ];
    
    const filtered = category === 'all' 
      ? mockQuestions 
      : mockQuestions.filter(q => q.category === category);

    res.status(200).json({
      success: true,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const { answers, timeSpent, category } = req.body;
    
    // Get quiz questions (in production, this would be from database)
    const questions = await getQuizQuestionsData(category);
    
    // Calculate score
    let correctCount = 0;
    const results = answers.map((answer, index) => {
      const isCorrect = answer === questions[index]?.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionIndex: index,
        selectedAnswer: answer,
        correctAnswer: questions[index]?.correctAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);

    // Save quiz result
    const quiz = new Quiz({
      userId: req.user.id,
      title: `${category} Quiz - ${new Date().toLocaleDateString()}`,
      category,
      questions,
      results: [{
        userId: req.user.id,
        score,
        answers,
        timeSpent,
        completedAt: new Date()
      }]
    });

    await quiz.save();

    // Update user stats
    const user = await User.findById(req.user.id);
    user.stats.quizzesTaken += 1;
    user.stats.avgScore = Math.round(
      (user.stats.avgScore * (user.stats.quizzesTaken - 1) + score) / user.stats.quizzesTaken
    );
    await user.save();

    logger.info(`Quiz completed by user: ${req.user.email}, Score: ${score}%`);

    res.status(200).json({
      success: true,
      data: {
        score,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        timeSpent,
        results
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get quiz questions
const getQuizQuestionsData = async (category) => {
  // This would typically fetch from database or generate via AI
  const mockQuestions = [
    {
      question: 'Which organelle is responsible for protein synthesis?',
      options: ['Mitochondria', 'Ribosome', 'Nucleus', 'Golgi apparatus'],
      correctAnswer: 1,
      explanation: 'Ribosomes are the cellular structures responsible for protein synthesis.',
      category: 'biology',
    },
    {
      question: 'What is the pH of pure water at 25°C?',
      options: ['6', '7', '8', '9'],
      correctAnswer: 1,
      explanation: 'Pure water has a pH of 7, which is considered neutral.',
      category: 'chemistry',
    },
    {
      question: 'What is the acceleration due to gravity on Earth?',
      options: ['8.8 m/s²', '9.8 m/s²', '10.8 m/s²', '11.8 m/s²'],
      correctAnswer: 1,
      explanation: 'The acceleration due to gravity on Earth is approximately 9.8 m/s².',
      category: 'physics',
    },
  ];
  
  return category === 'all' 
    ? mockQuestions 
    : mockQuestions.filter(q => q.category === category);
};