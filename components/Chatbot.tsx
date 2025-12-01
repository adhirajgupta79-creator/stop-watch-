import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface Message {
  type: 'user' | 'ai';
  text: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { type: 'user', text: input.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Initialize GoogleGenAI right before the call to ensure the latest API key is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelName = 'gemini-3-pro-preview';

      const streamResponse = await ai.models.generateContentStream({
        model: modelName,
        contents: userMessage.text,
      });

      let aiResponseText = '';
      const newAiMessage: Message = { type: 'ai', text: '' };
      setMessages((prevMessages) => [...prevMessages, newAiMessage]);

      for await (const chunk of streamResponse) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          aiResponseText += c.text;
          setMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage.type === 'ai') {
              return [...prevMessages.slice(0, -1), { ...lastMessage, text: aiResponseText }];
            }
            return prevMessages; // Should not happen if logic is correct
          });
        }
      }
    } catch (e: any) {
      console.error("Gemini API Error:", e);
      if (e.message && e.message.includes("Requested entity was not found.")) {
        setError("API Key issue: Please ensure a valid, paid API key is selected. A link to the billing documentation (ai.google.dev/gemini-api/docs/billing) must be provided in the dialog. Users must select a API key from a paid GCP project.");
        // Optionally prompt user to open the key selection dialog if applicable in the environment
        // if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        //   window.aistudio.openSelectKey();
        // }
      } else {
        setError("Failed to fetch response from Gemini. Please try again.");
      }
      setMessages((prevMessages) => {
        // Remove the empty AI message if an error occurred before any text was received
        if (prevMessages[prevMessages.length - 1]?.type === 'ai' && prevMessages[prevMessages.length - 1]?.text === '') {
          return prevMessages.slice(0, -1);
        }
        return prevMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  }, [sendMessage, isLoading]);

  return (
    <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-lg lg:max-w-xl xl:max-w-2xl flex flex-col items-center border border-white border-opacity-20 h-[80vh] min-h-[400px]">
      <div className="flex-1 w-full overflow-y-auto custom-scrollbar mb-4 p-2">
        {messages.length === 0 && (
          <div className="flex justify-center items-center h-full text-gray-300 text-lg text-center">
            Start a conversation with Gemini!
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-3 ${
              msg.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg shadow-md break-words ${
                msg.type === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-gray-800 text-gray-100 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="max-w-[80%] p-3 rounded-lg shadow-md bg-gray-800 text-gray-100 rounded-bl-none">
              <span className="animate-pulse">Typing...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-400 text-center mt-4 p-2 bg-red-900 bg-opacity-30 rounded-lg">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full flex">
        <input
          type="text"
          className="flex-1 p-3 rounded-l-lg bg-gray-700 bg-opacity-70 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
          placeholder="Ask Gemini anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          aria-label="Chat input"
        />
        <button
          onClick={sendMessage}
          className="p-3 rounded-r-lg bg-purple-700 hover:bg-purple-800 text-white font-bold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || input.trim() === ''}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;