import React from 'react';

const ComingSoon: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Coming Soon!
        </h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          This feature is coming soon. Look out for it in our next release!
        </p>

        {/* Release Date */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-600 font-medium mb-1">Expected Release Date</p>
          <p className="text-2xl font-bold text-blue-800">August 29, 2025</p>
        </div>

        {/* Additional Message */}
        <p className="text-sm text-gray-500">
          We're working hard to bring you amazing new features. Stay tuned!
        </p>

        {/* Decorative Element */}
        <div className="mt-8 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
