import React, { useState } from 'react';
import { X, Check, CreditCard, Smartphone } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { cn } from '../utils/cn';
import { apiCall } from '../api/client';
import toast from 'react-hot-toast';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier?: string;
}

const pricingTiers = [
  {
    id: 'flash-lite',
    name: 'Flash Lite',
    price: 'Free',
    description: 'Perfect for getting started',
    features: [
      '100 flashcards per month',
      'Basic quiz generation',
      'Web access only',
      'Community support',
    ],
  },
  {
    id: 'flash-core',
    name: 'Flash Core',
    price: '300',
    currency: 'KSH',
    description: 'Great for students',
    features: [
      '1,000 flashcards per month',
      'Advanced quiz generation',
      'Mobile app access',
      'Priority support',
      'Basic analytics',
    ],
    popular: true,
  },
  {
    id: 'flash-prime',
    name: 'Flash Prime',
    price: '999',
    currency: 'KSH',
    description: 'For serious learners',
    features: [
      '5,000 flashcards per month',
      'AI-powered insights',
      'Custom study plans',
      'Advanced analytics',
      'Voice narration',
      'Offline access',
    ],
  },
  {
    id: 'flash-prime-plus',
    name: 'Flash Prime Plus',
    price: '1,999',
    currency: 'KSH',
    description: 'Professional learning',
    features: [
      'Unlimited flashcards',
      'Team collaboration',
      'Advanced AI features',
      'Custom integrations',
      'Priority phone support',
      'White-label options',
    ],
  },
  {
    id: 'flash-titan',
    name: 'Flash Titan',
    price: 'Contact Sales',
    description: 'Enterprise solution',
    features: [
      'Everything in Prime Plus',
      'Dedicated account manager',
      'Custom development',
      'SLA guarantees',
      'On-premise deployment',
      'Advanced security',
    ],
  },
];

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, selectedTier }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mpesa'>('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const tier = pricingTiers.find(t => t.id === selectedTier) || pricingTiers[1];

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Mock payment processing for demo
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Payment initiated successfully!');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Subscribe to {tier.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tier.name}
                </h3>
                <div className="text-right">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {tier.price === 'Contact Sales' ? tier.price : `${tier.currency} ${tier.price}`}
                  </span>
                  {tier.price !== 'Contact Sales' && tier.price !== 'Free' && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">/month</p>
                  )}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{tier.description}</p>
              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {tier.price !== 'Free' && tier.price !== 'Contact Sales' && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment Method
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2',
                      paymentMethod === 'card'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    )}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Credit Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('mpesa')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2',
                      paymentMethod === 'mpesa'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    )}
                  >
                    <Smartphone className="h-5 w-5" />
                    <span>M-Pesa</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        value={cardData.cvc}
                        onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              )}

              <div className="flex space-x-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : `Pay ${tier.currency} ${tier.price}`}
                </Button>
              </div>
            </>
          )}

          {tier.price === 'Contact Sales' && (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Get in touch with our sales team for custom enterprise solutions.
              </p>
              <Button onClick={() => window.open('mailto:sales@flashlearn.ai')} className="w-full">
                Contact Sales Team
              </Button>
            </div>
          )}

          {tier.price === 'Free' && (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You're already on the free plan! Upgrade anytime to unlock more features.
              </p>
              <Button onClick={() => { onClose(); window.location.href = '/dashboard'; }} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PricingModal;