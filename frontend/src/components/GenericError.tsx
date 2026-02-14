import React from 'react';
import { useTranslation } from 'react-i18next';

interface GenericErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  icon?: 'warning' | 'error' | 'info';
}

export const GenericError: React.FC<GenericErrorProps> = ({
  title,
  message,
  onRetry,
  showRetry = true,
  icon = 'error',
}) => {
  const { t } = useTranslation();

  const getIconColor = () => {
    switch (icon) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'info':
        return 'bg-blue-100 text-blue-600';
      case 'error':
      default:
        return 'bg-red-100 text-red-600';
    }
  };

  const getIcon = () => {
    switch (icon) {
      case 'warning':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        );
      case 'info':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        );
      case 'error':
      default:
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${getIconColor()}`}>
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {getIcon()}
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || t('error.general')}
      </h3>
      {message && (
        <p className="text-gray-600 mb-4 max-w-md">
          {message}
        </p>
      )}
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded transition-colors"
        >
          {t('error.retry')}
        </button>
      )}
    </div>
  );
};

export default GenericError;
