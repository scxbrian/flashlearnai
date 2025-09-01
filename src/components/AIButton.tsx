import React, { useState } from 'react';
import { Brain, MessageCircle, X, Send } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Button from './Button';
import Card from './Card';
import { apiCall } from '../api/client';
import toast from 'react-hot-toast';

const AIButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'ai', content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const getContextualPrompt = () => {
    const path = location.pathname;
    const prompts = {
      '/dashboard': 'How can I help you with your learning dashboard today?',
      '/flashcards': 'Need help with your flashcards? I can suggest study techniques or help create new ones.',
      '/upload': 'I can help you optimize your file uploads or suggest the best content types for flashcard generation.',
      '/quiz': 'Looking for quiz strategies or need explanations for difficult questions?',
      '/profile': 'I can help you optimize your profile settings or manage your subscription.',
      '/': 'Welcome to FlashLearn AI! How can I assist you today?',
    };
    return prompts[path as keyof typeof prompts] || 'How can I help you today?';
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      console.log('🤖 Sending AI request:', userMessage);
      console.log('📍 Current location:', location.pathname);
      
      const response = await apiCall('/api/ai/contextual', {
        method: 'POST',
        data: {
          message: userMessage,
          tab: location.pathname.replace('/', '') || 'dashboard',
          context: location.pathname,
        },
      });
      
      console.log('✅ AI response received:', response.data);
      setConversation(prev => [...prev, { role: 'ai', content: response.data.response }]);
    } catch (error) {
      console.error('❌ AI service error:', error);
      // Fallback response if backend not available
      const fallbackResponse = `I'm here to help! There seems to be an issue with the AI service. Error: ${error.message}`;
      setConversation(prev => [...prev, { role: 'ai', content: fallbackResponse }]);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40"
        aria-label="Open AI Assistant"
      >
        <Brain className="h-6 w-6" />
      </button>

      {/* AI Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg h-[600px] sm:h-[500px] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {conversation.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">{getContextualPrompt()}</p>
                </div>
              )}

              {conversation.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex space-x-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white resize-none"
                  rows={2}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  size="sm"
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default AIButton;