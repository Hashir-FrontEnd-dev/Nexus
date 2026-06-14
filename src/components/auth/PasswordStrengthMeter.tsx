import React from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const getStrength = (pwd: string): { score: number; label: string; color: string; bg: string } => {
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-error-500', bg: 'bg-error-50' };
    if (score <= 2) return { score, label: 'Fair', color: 'bg-warning-500', bg: 'bg-warning-50' };
    if (score <= 3) return { score, label: 'Good', color: 'bg-accent-500', bg: 'bg-accent-50' };
    return { score, label: 'Strong', color: 'bg-success-500', bg: 'bg-success-50' };
  };

  const { score, label, color, bg } = getStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= score ? color : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${bg} px-2 py-0.5 rounded inline-block`}>
        {label}
      </p>
      {score < 5 && (
        <ul className="text-xs text-gray-500 space-y-0.5 mt-1">
          {password.length < 6 && <li>&bull; At least 6 characters</li>}
          {(!/[a-z]/.test(password) || !/[A-Z]/.test(password)) && <li>&bull; Uppercase &amp; lowercase letters</li>}
          {!/\d/.test(password) && <li>&bull; At least one number</li>}
          {!/[^a-zA-Z0-9]/.test(password) && <li>&bull; At least one special character</li>}
        </ul>
      )}
    </div>
  );
};
