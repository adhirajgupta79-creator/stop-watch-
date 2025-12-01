import React from 'react';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-8 drop-shadow-lg text-center">
        Gemini AI Chatbot
      </h1>
      <Chatbot />
    </div>
  );
};

export default App;