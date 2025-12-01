import React from 'react';
import Stopwatch from './components/Stopwatch';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-8 drop-shadow-lg text-center">
        Simple Stopwatch
      </h1>
      <Stopwatch />
    </div>
  );
};

export default App;