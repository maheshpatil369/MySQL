import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, CornerDownLeft, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) { // Opening
      setError(''); // Clear previous errors
      // Optionally, focus input after a slight delay for transition
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const newMessage = { sender: 'user', text: inputValue.trim() };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(geminiApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: newMessage.text }] }],
          // Add generationConfig or safetySettings if needed
          // generationConfig: {
          //   temperature: 0.7,
          //   topK: 1,
          //   topP: 1,
          //   maxOutputTokens: 2048,
          // },
          // safetySettings: [
          //   { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          //   // ... other safety settings
          // ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to get response from assistant.');
      }

      const data = await response.json();
      
      let botResponse = 'Sorry, I could not understand that.';
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        botResponse = data.candidates[0].content.parts[0].text;
      } else if (data.promptFeedback && data.promptFeedback.blockReason) {
        botResponse = `Blocked: ${data.promptFeedback.blockReason}`;
         if (data.promptFeedback.safetyRatings) {
            botResponse += ` (Safety: ${data.promptFeedback.safetyRatings.map(r => `${r.category} - ${r.probability}`).join(', ')})`;
        }
      }

      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: botResponse }]);
    } catch (err) {
      console.error('Error sending message to Gemini:', err);
      setError(err.message || 'An error occurred.');
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform duration-200 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-20 right-6 w-full max-w-sm h-[70vh] max-h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 z-40"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-white">Personal Assistant</h3>
              <button onClick={toggleChat} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-100 dark:bg-gray-900/50">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-xl ${
                    msg.sender === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                  }`}>
                    {msg.sender === 'bot' && msg.text.startsWith('Error:') ? (
                      <span className="text-red-500 dark:text-red-400">{msg.text}</span>
                    ) : (
                      msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Assistant is typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {error && (
              <div className="p-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-t border-red-200 dark:border-red-700">
                {error}
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  rows="1"
                  className="flex-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                  style={{ maxHeight: '80px', overflowY: 'auto' }} // Prevent excessive growth
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || inputValue.trim() === ''}
                  className="p-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBotWidget;