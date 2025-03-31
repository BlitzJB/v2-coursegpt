import React from 'react';

type BackButtonProps = {
  onClick: () => void;
  label: string;
};

const BackButton: React.FC<BackButtonProps> = ({ onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {label}
    </button>
  );
};

export default BackButton; 