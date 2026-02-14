import React from 'react';
import { useTranslation } from 'react-i18next';

interface NetworkErrorProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  message,
  onRetry,
  showRetry = true,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 mb-4 bg-orange-100 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {t('error.network')}
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

export default NetworkError;
