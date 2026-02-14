import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface NotFoundProps {
  message?: string;
  showHomeButton?: boolean;
}

export const NotFound: React.FC<NotFoundProps> = ({
  message,
  showHomeButton = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-20 h-20 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <svg
          className="w-10 h-10 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">404</h2>
      <h3 className="text-xl font-semibold text-gray-700 mb-4">
        {t('error.notFound')}
      </h3>
      {message && (
        <p className="text-gray-600 mb-6 max-w-md">
          {message}
        </p>
      )}
      {showHomeButton && (
        <button
          onClick={handleGoHome}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded transition-colors"
        >
          {t('navigation.home')}
        </button>
      )}
    </div>
  );
};

export default NotFound;
