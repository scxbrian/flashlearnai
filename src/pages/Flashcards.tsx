import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, VolumeX, Shuffle, BookOpen, Target, Clock, Award } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { apiCall } from '../api/client';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const Flashcards: React.FC = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isNarratorOn, setIsNarratorOn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: flashcards, isLoading } = useQuery({
    queryKey: ['flashcards', selectedCategory],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      params.append('limit', '50');
      
      return apiCall(`/api/flashcards?${params.toString()}`);
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const cards: Flashcard[] = flashcards?.data || [];

  const handleNextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length);
    setIsFlipped(false);
  };

  const handlePrevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
    setIsFlipped(false);
  };

  const handleShuffle = () => {
    setCurrentCard(Math.floor(Math.random() * cards.length));
    setIsFlipped(false);
  };

  const handleNarration = () => {
    if (isNarratorOn && cards[currentCard]) {
      const text = isFlipped ? cards[currentCard].answer : cards[currentCard].question;
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  const categories = ['all', 'biology', 'chemistry', 'physics', 'mathematics', 'history'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8 lg:ml-64">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="h-24 w-24 text-gray-400 mx-auto mb-8" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            No Flashcards Yet
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Upload some content to generate your first set of flashcards.
          </p>
          <Button size="lg" onClick={() => window.location.href = '/upload'}>
            Upload Content
          </Button>
        </div>
      </div>
    );
  }

  const currentCardData = cards[currentCard];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 lg:ml-64">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Study Flashcards
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Card {currentCard + 1} of {cards.length}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
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

          <Button
            variant="outline"
            onClick={() => setIsNarratorOn(!isNarratorOn)}
            className={isNarratorOn ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : ''}
          >
            {isNarratorOn ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
            Narrator {isNarratorOn ? 'On' : 'Off'}
          </Button>

          <Button variant="outline" onClick={handleShuffle}>
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle
          </Button>
        </div>

        {/* Flashcard */}
        <div className="relative mb-8">
          <Card
            className="h-96 cursor-pointer group perspective-1000"
            onClick={() => {
              setIsFlipped(!isFlipped);
              if (isNarratorOn) {
                setTimeout(handleNarration, 300);
              }
            }}
            hover
          >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 backface-hidden flex flex-col justify-center items-center p-8 text-center">
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    currentCardData.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' :
                    currentCardData.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {currentCardData.difficulty}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {currentCardData.question}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Click to reveal answer
                </p>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-center items-center p-8 text-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {currentCardData.answer}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Click to go back to question
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center space-x-4 mb-8">
          <Button
            variant="outline"
            onClick={handlePrevCard}
            disabled={cards.length <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Flip Card
          </Button>

          <Button
            variant="outline"
            onClick={handleNextCard}
            disabled={cards.length <= 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Progress through deck
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(((currentCard + 1) / cards.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentCard + 1) / cards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Study Options */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Study Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="h-12 flex-col space-y-1">
              <Target className="h-5 w-5" />
              <span>Practice Mode</span>
            </Button>
            <Button variant="outline" className="h-12 flex-col space-y-1">
              <Clock className="h-5 w-5" />
              <span>Timed Study</span>
            </Button>
            <Button variant="outline" className="h-12 flex-col space-y-1">
              <Award className="h-5 w-5" />
              <span>Test Yourself</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Flashcards;