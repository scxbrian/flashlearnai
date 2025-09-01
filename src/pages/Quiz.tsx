import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Trophy, RefreshCw, Play } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { apiCall } from '../api/client';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  correctAnswers: number[];
}

const Quiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: questions, isLoading } = useQuery({
    queryKey: ['quiz-questions', selectedCategory],
    queryFn: () => {
      try {
        return apiCall(`/api/quiz/questions?category=${selectedCategory}`);
      } catch (error) {
        console.warn('Backend not available, using mock quiz data');
        // Fallback to mock data if backend not available
        const mockQuestions = [
        {
          id: '1',
          question: 'Which organelle is responsible for protein synthesis?',
          options: ['Mitochondria', 'Ribosome', 'Nucleus', 'Golgi apparatus'],
          correctAnswer: 1,
          explanation: 'Ribosomes are the cellular structures responsible for protein synthesis.',
          category: 'biology',
        },
        {
          id: '2',
          question: 'What is the function of the cell membrane?',
          options: ['Energy production', 'Protein synthesis', 'Selective permeability', 'DNA storage'],
          correctAnswer: 2,
          explanation: 'The cell membrane controls what enters and exits the cell through selective permeability.',
          category: 'biology',
        },
        {
          id: '3',
          question: 'Which process converts glucose into ATP?',
          options: ['Photosynthesis', 'Cellular respiration', 'Transcription', 'Translation'],
          correctAnswer: 1,
          explanation: 'Cellular respiration breaks down glucose to produce ATP for cellular energy.',
          category: 'biology',
        },
        {
          id: '4',
          question: 'What is the pH of pure water at 25°C?',
          options: ['6', '7', '8', '9'],
          correctAnswer: 1,
          explanation: 'Pure water has a pH of 7, which is considered neutral.',
          category: 'chemistry',
        },
        {
          id: '5',
          question: 'Which element has the atomic number 6?',
          options: ['Oxygen', 'Carbon', 'Nitrogen', 'Hydrogen'],
          correctAnswer: 1,
          explanation: 'Carbon has 6 protons, giving it an atomic number of 6.',
          category: 'chemistry',
        },
        {
          id: '6',
          question: 'What type of bond forms between sodium and chlorine?',
          options: ['Covalent bond', 'Ionic bond', 'Hydrogen bond', 'Metallic bond'],
          correctAnswer: 1,
          explanation: 'Sodium and chlorine form an ionic bond by transferring electrons.',
          category: 'chemistry',
        },
        {
          id: '7',
          question: 'What is the acceleration due to gravity on Earth?',
          options: ['8.8 m/s²', '9.8 m/s²', '10.8 m/s²', '11.8 m/s²'],
          correctAnswer: 1,
          explanation: 'The acceleration due to gravity on Earth is approximately 9.8 m/s².',
          category: 'physics',
        },
        {
          id: '8',
          question: 'What is Newton\'s first law of motion?',
          options: ['F = ma', 'An object at rest stays at rest', 'For every action, there is an equal and opposite reaction', 'E = mc²'],
          correctAnswer: 1,
          explanation: 'Newton\'s first law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.',
          category: 'physics',
        },
        {
          id: '9',
          question: 'What is the speed of light in a vacuum?',
          options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'],
          correctAnswer: 0,
          explanation: 'The speed of light in a vacuum is approximately 3 × 10⁸ meters per second.',
          category: 'physics',
        },
        {
          id: '10',
          question: 'What is the derivative of x²?',
          options: ['x', '2x', 'x³', '2x²'],
          correctAnswer: 1,
          explanation: '2x - Using the power rule of differentiation.',
          category: 'mathematics',
        },
        {
          id: '11',
          question: 'What is the integral of 2x?',
          options: ['x²', 'x² + C', '2', '2x²'],
          correctAnswer: 1,
          explanation: 'The integral of 2x is x² + C, where C is the constant of integration.',
          category: 'mathematics',
        },
        {
          id: '12',
          question: 'What is the value of π (pi) to 3 decimal places?',
          options: ['3.141', '3.142', '3.143', '3.144'],
          correctAnswer: 1,
          explanation: 'π (pi) is approximately 3.142 when rounded to 3 decimal places.',
          category: 'mathematics',
        },
        {
          id: '13',
          question: 'When did World War II end?',
          options: ['1944', '1945', '1946', '1947'],
          correctAnswer: 1,
          explanation: 'World War II ended in 1945 when Japan formally surrendered.',
          category: 'history',
        },
        {
          id: '14',
          question: 'Who was the first President of the United States?',
          options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'],
          correctAnswer: 1,
          explanation: 'George Washington was the first President of the United States, serving from 1789 to 1797.',
          category: 'history',
        },
        {
          id: '15',
          question: 'Which organelle is responsible for protein synthesis?',
          options: ['Mitochondria', 'Ribosome', 'Nucleus', 'Golgi apparatus'],
          correctAnswer: 1,
          explanation: 'Ribosomes are the cellular structures responsible for protein synthesis.',
          category: 'biology',
        },
        {
          id: '16',
          question: 'What major event happened in 1969?',
          options: ['Moon landing', 'Berlin Wall fell', 'World War II ended', 'Internet invented'],
          correctAnswer: 1,
          explanation: 'The Apollo 11 mission successfully landed humans on the moon in 1969.',
          category: 'history',
        },
        {
          id: '17',
          question: 'What is photosynthesis?',
          options: ['Breaking down glucose', 'Converting light to chemical energy', 'Cell division', 'Protein synthesis'],
          correctAnswer: 1,
          explanation: 'Photosynthesis is the process by which plants convert light energy into chemical energy (glucose).',
          category: 'biology',
        },
        {
          id: '18',
          question: 'What is the chemical symbol for gold?',
          options: ['Go', 'Au', 'Ag', 'Gd'],
          correctAnswer: 1,
          explanation: 'Au is the chemical symbol for gold, derived from the Latin word "aurum".',
          category: 'chemistry',
        },
        {
          id: '19',
          question: 'What is the formula for kinetic energy?',
          options: ['KE = mv', 'KE = ½mv²', 'KE = mgh', 'KE = mc²'],
          correctAnswer: 1,
          explanation: 'Kinetic energy is calculated as KE = ½mv², where m is mass and v is velocity.',
          category: 'physics',
        },
        {
          id: '20',
          question: 'What is the quadratic formula?',
          options: ['x = -b ± √(b² - 4ac) / 2a', 'x = a² + b² = c²', 'x = mx + b', 'x = πr²'],
          correctAnswer: 0,
          explanation: 'The quadratic formula x = (-b ± √(b² - 4ac)) / 2a solves equations of the form ax² + bx + c = 0.',
          category: 'mathematics',
        },
      ];
      
      const filtered = selectedCategory === 'all' 
        ? mockQuestions 
        : mockQuestions.filter(q => q.category === selectedCategory);
      
      return Promise.resolve({ data: filtered });
      }
    },
    enabled: isQuizActive,
  });

  const quizQuestions: Question[] = questions?.data || [];

  const startQuiz = () => {
    setIsQuizActive(true);
    setIsQuizComplete(false);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setStartTime(Date.now());
    setQuizResult(null);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const correctAnswers = selectedAnswers.filter(
      (answer, index) => answer === quizQuestions[index]?.correctAnswer
    );
    
    const result: QuizResult = {
      score: Math.round((correctAnswers.length / quizQuestions.length) * 100),
      totalQuestions: quizQuestions.length,
      timeSpent,
      correctAnswers: correctAnswers.map((_, index) => index),
    };

    setQuizResult(result);
    setIsQuizComplete(true);
  };

  const resetQuiz = () => {
    setIsQuizActive(false);
    setIsQuizComplete(false);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setQuizResult(null);
  };

  const categories = ['all', 'biology', 'chemistry', 'physics', 'mathematics', 'history'];

  if (!isQuizActive && !isQuizComplete) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8 lg:ml-64">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Knowledge Quizzes
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Test your understanding with AI-generated quizzes
            </p>
          </div>

          <Card className="p-8 text-center mb-8">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Test Your Knowledge?
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Choose a category and start your personalized quiz experience.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={startQuiz} size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading Questions...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start Quiz
                </>
              )}
            </Button>
          </Card>

          {/* Quiz Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Best Score</h3>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">94%</p>
            </Card>
            <Card className="p-6 text-center">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Avg. Time</h3>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">2m 30s</p>
            </Card>
            <Card className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Completed</h3>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">23</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isQuizComplete && quizResult) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8 lg:ml-64">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                quizResult.score >= 80 
                  ? 'bg-emerald-100 dark:bg-emerald-900/20' 
                  : quizResult.score >= 60 
                  ? 'bg-yellow-100 dark:bg-yellow-900/20' 
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                <Trophy className={`h-10 w-10 ${
                  quizResult.score >= 80 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : quizResult.score >= 60 
                    ? 'text-yellow-600 dark:text-yellow-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Quiz Complete!
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Your score: {quizResult.score}%
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {quizResult.correctAnswers.length}
                </p>
                <p className="text-gray-600 dark:text-gray-300">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {quizResult.totalQuestions - quizResult.correctAnswers.length}
                </p>
                <p className="text-gray-600 dark:text-gray-300">Incorrect</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.floor(quizResult.timeSpent / 60)}:{(quizResult.timeSpent % 60).toString().padStart(2, '0')}
                </p>
                <p className="text-gray-600 dark:text-gray-300">Time</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={resetQuiz} size="lg">
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = '/flashcards'}>
                Review Answers
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestionData = quizQuestions[currentQuestion];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 lg:ml-64">
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Category: {currentQuestionData?.category}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <Clock className="h-5 w-5" />
            <span>{Math.floor((Date.now() - startTime) / 1000)}s</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {currentQuestionData?.question}
          </h2>

          <div className="space-y-4">
            {currentQuestionData?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300 dark:border-slate-600'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-600 dark:text-gray-300">
            {selectedAnswers.filter(a => a !== undefined).length} of {quizQuestions.length} answered
          </span>

          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswers[currentQuestion] === undefined}
          >
            {currentQuestion === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;