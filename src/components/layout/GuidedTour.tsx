import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TOUR_KEY = 'business_nexus_tour_completed';

interface Step {
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  target: string;
}

const entrepreneurSteps: Step[] = [
  { title: 'Welcome to Business Nexus!', description: 'This quick tour will show you around the platform. Let\'s get started!', position: 'bottom', target: 'Welcome' },
  { title: 'Dashboard', description: 'Your main hub. View pending requests, connections, meetings, and wallet balance at a glance.', position: 'bottom', target: 'Dashboard overview' },
  { title: 'Find Investors', description: 'Browse through our network of investors looking for startups like yours.', position: 'right', target: 'Find Investors' },
  { title: 'Messages & Video', description: 'Connect with investors via messaging or start a video call directly from the platform.', position: 'right', target: 'Messages' },
  { title: 'Calendar', description: 'Set your availability and schedule meetings with potential investors.', position: 'right', target: 'Calendar' },
  { title: 'Payments', description: 'Manage your wallet, deposit funds, and receive investments.', position: 'right', target: 'Payments' },
  { title: 'Document Chamber', description: 'Upload, preview, and sign documents securely.', position: 'right', target: 'Document Chamber' },
  { title: 'You\'re all set!', description: 'Start exploring and growing your network. Need help? Visit the Help & Support page.', position: 'top', target: 'Ready' },
];

const investorSteps: Step[] = [
  { title: 'Welcome to Business Nexus!', description: 'This quick tour will show you around the platform. Let\'s get started!', position: 'bottom', target: 'Welcome' },
  { title: 'Dashboard', description: 'Your main hub. Browse startups, track connections, and manage your portfolio.', position: 'bottom', target: 'Dashboard overview' },
  { title: 'Find Startups', description: 'Discover promising startups and filter by industry.', position: 'right', target: 'Find Startups' },
  { title: 'Messages & Video', description: 'Connect with entrepreneurs via messaging or video calls.', position: 'right', target: 'Messages' },
  { title: 'Calendar', description: 'Schedule meetings with entrepreneurs and manage your availability.', position: 'right', target: 'Calendar' },
  { title: 'Payments', description: 'Manage your wallet and fund startups directly from the platform.', position: 'right', target: 'Payments' },
  { title: 'Document Chamber', description: 'Upload, preview, and sign deals securely.', position: 'right', target: 'Document Chamber' },
  { title: 'You\'re all set!', description: 'Start discovering and funding the next big idea. Need help? Visit the Help & Support page.', position: 'top', target: 'Ready' },
];

export const GuidedTour: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed && user) {
      setTimeout(() => setIsOpen(true), 800);
    }
  }, [user]);

  const steps = user?.role === 'entrepreneur' ? entrepreneurSteps : investorSteps;

  const handleComplete = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setIsOpen(false);
  };

  const handleRestart = () => {
    localStorage.removeItem(TOUR_KEY);
    setCurrentStep(0);
    setIsOpen(true);
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleSkip} />

      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 pointer-events-auto animate-fade-in">
          <div className="relative p-6">
            <button onClick={handleSkip} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>

            <div className="flex items-center gap-1 mb-4">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= currentStep ? 'bg-primary-500' : 'bg-gray-200'}`} />
              ))}
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  onClick={handleRestart}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Restart
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={handleSkip} className="text-sm text-gray-500 hover:text-gray-700">
                  Skip
                </button>

                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 flex items-center gap-1"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    className="px-4 py-2 bg-success-600 text-white text-sm font-medium rounded-lg hover:bg-success-700"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
