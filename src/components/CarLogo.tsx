import React from 'react';

interface CarLogoProps {
  className?: string;
  size?: number;
}

export const CarLogo: React.FC<CarLogoProps> = ({ className = "", size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Car Body */}
      <path
        d="M15 25 L85 25 L85 20 L80 15 L70 10 L30 10 L20 15 L15 20 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
      />
      
      {/* Front Wheel - Letter C */}
      <circle
        cx="25"
        cy="30"
        r="8"
        fill="#FFD700"
        stroke="currentColor"
        strokeWidth="2"
      />
      <text
        x="25"
        y="35"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="Arial, sans-serif"
      >
        C
      </text>
      
      {/* Rear Wheel - Letter D */}
      <circle
        cx="75"
        cy="30"
        r="8"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
      <text
        x="75"
        y="35"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="white"
        fontFamily="Arial, sans-serif"
      >
        D
      </text>
      
      {/* Ground Line */}
      <line
        x1="17"
        y1="38"
        x2="83"
        y2="38"
        stroke="currentColor"
        strokeWidth="3"
      />
      
      {/* Speed Lines */}
      <line
        x1="87"
        y1="32"
        x2="95"
        y2="32"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="87"
        y1="35"
        x2="93"
        y2="35"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="87"
        y1="38"
        x2="91"
        y2="38"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
};
