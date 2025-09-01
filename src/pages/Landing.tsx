import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, BookOpen, Zap, Target, Users, Check, Star, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PricingModal from '../components/PricingModal';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const { user } = useAuth();
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Advanced AI generates personalized flashcards and quizzes from your content.',
    },
    {
      icon: BookOpen,
      title: 'Smart Flashcards',
      description: 'Interactive flashcards with spaced repetition and adaptive learning algorithms.',
    },
    {
      icon: Zap,
      title: 'Instant Generation',
      description: 'Upload any document and get flashcards and quizzes generated in seconds.',
    },
    {
      icon: Target,
      title: 'Progress Tracking',
      description: 'Detailed analytics and insights to track your learning progress over time.',
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Share and collaborate on study materials with classmates and study groups.',
    },
    {
      icon: Star,
      title: 'Voice Narration',
      description: 'Listen to your flashcards with AI-powered voice narration for audio learning.',
    },
  ];

  const pricingTiers = [
    {
      id: 'flash-lite',
      name: 'Flash Lite',
      price: 'Free',
      description: 'Perfect for getting started',
      features: ['100 flashcards/month', 'Basic quiz generation', 'Web access', 'Community support'],
      buttonText: 'Get Started',
      popular: false,
    },
    {
      id: 'flash-core',
      name: 'Flash Core',
      price: 'KSH 300',
      description: 'Great for students',
      features: ['1,000 flashcards/month', 'Advanced quizzes', 'Mobile app', 'Priority support', 'Basic analytics'],
      buttonText: 'Choose Core',
      popular: true,
    },
    {
      id: 'flash-prime',
      name: 'Flash Prime',
      price: 'KSH 999',
      description: 'For serious learners',
      features: ['5,000 flashcards/month', 'AI insights', 'Custom study plans', 'Voice narration', 'Offline access'],
      buttonText: 'Choose Prime',
      popular: false,
    },
    {
      id: 'flash-prime-plus',
      name: 'Flash Prime Plus',
      price: 'KSH 1,999',
      description: 'Professional learning',
      features: ['Unlimited flashcards', 'Team collaboration', 'Advanced AI', 'Custom integrations', 'Phone support'],
      buttonText: 'Choose Prime Plus',
      popular: false,
    },
    {
      id: 'flash-titan',
      name: 'Flash Titan',
      price: 'Contact Sales',
      description: 'Enterprise solution',
      features: ['Everything in Prime Plus', 'Dedicated manager', 'Custom development', 'SLA guarantees', 'On-premise'],
      buttonText: 'Contact Sales',
      popular: false,
    },
  ];

  const handlePricingSelect = (tierId: string) => {
    setSelectedTier(tierId);
    if (user) {
      setIsPricingOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      setIsAuthModalOpen(true);
    }
  };
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-full">
                  <Brain className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Learn Smarter with
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> AI-Powered </span>
              Flashcards
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform any document into interactive flashcards and quizzes. Our AI understands your content and creates 
              personalized learning experiences that adapt to your progress.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="w-full sm:w-auto" onClick={handleGetStarted}>
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Modern Learning
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to accelerate your learning and achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} hover className="p-6 text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Learning Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Start free and scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`p-6 relative ${tier.popular ? 'ring-2 ring-indigo-500 scale-105' : ''}`}
                hover
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {tier.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {tier.price}
                    </span>
                    {tier.price !== 'Free' && tier.price !== 'Contact Sales' && (
                      <span className="text-gray-600 dark:text-gray-300">/month</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePricingSelect(tier.id)}
                  variant={tier.popular ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {tier.buttonText}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of students already learning smarter with FlashLearn AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted}>
              Start Your Free Trial
            </Button>
            <Button variant="outline" size="lg">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        selectedTier={selectedTier}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signup"
      />
    </div>
  );
};

export default Landing;