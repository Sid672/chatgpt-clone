import React from 'react';

interface DotsLoaderProps {
  size?: number;
  color?: string;
}

export default function DotsLoader({ size = 14, color = '#fff' }: DotsLoaderProps) {
  return (
    <div className="flex items-center space-x-1">
      <div
        className="rounded-full animate-bounce"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          animationDelay: '0ms',
          animationDuration: '1.4s',
        }}
      />
      <div
        className="rounded-full animate-bounce"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          animationDelay: '160ms',
          animationDuration: '1.4s',
        }}
      />
      <div
        className="rounded-full animate-bounce"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          animationDelay: '320ms',
          animationDuration: '1.4s',
        }}
      />
    </div>
  );
}
