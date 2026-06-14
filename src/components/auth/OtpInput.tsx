import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({ length = 6, value, onChange, onComplete }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newVal = val.slice(-1);
    const otp = value.split('');
    otp[index] = newVal;
    const joined = otp.join('').slice(0, length);
    onChange(joined);

    if (newVal && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (joined.length === length && onComplete) {
      setTimeout(onComplete, 300);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasteData);
    const nextIndex = pasteData.length < length ? pasteData.length : length - 1;
    inputsRef.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={el => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
        />
      ))}
    </div>
  );
};
