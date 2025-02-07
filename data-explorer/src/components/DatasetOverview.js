import '../styles/App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalysisPage = ({ filename }) => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState(''); // Store conversation context

  // Quick replies for frequently asked questions
  const quickReplies = [
    { text: 'Show dataset overview', action: () => handleQuery('Show dataset overview') },
    { text: 'What are the column names?', action: () => handleQuery('What are the column names?') },
    { text: 'Show data visualizations', action: () => handleQuery('Show data visualizations') },
  ];

  // Handle query submission
  const handleQuery = async (query) => {
    if (!query.trim()) return;

    // Add user's message to the context
    const userMessage = { type: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);

    try {
      const response = await axios.post(`http://localhost:5000/query/${filename}`, { query, context });
      const aiMessage = { type: 'ai', text: response.data.answer };

      // Update context with the new response
      setContext(prevContext => prevContext + '\n' + query + '\n' + response.data.answer);

      // Add AI response to the messages
      setMessages(prev => [...prev, aiMessage]);
      setQuery('');
    } catch (error) {
      console.error('Query error', error);
    } finally {
      setIsTyping(false); // Hide typing indicator
    }
  };

  // Auto-scroll chat to the latest message
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-messages');
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [messages]);

  return (
    <div className="analysis-page">
      <div className="main-analysis">
        {/* Dataset and other content */}
      </div>

      <div className="ai-assistant">
        <div className="chat-header">
          <h3>AI Data Assistant</h3>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.text}
            </div>
          ))}
          {/* Add typing indicator */}
          {isTyping && (
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
        </div>

        <div className="quick-replies">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={reply.action}
              className="quick-reply-button"
            >
              {reply.text}
            </button>
          ))}
        </div>

        <div className="chat-input">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your dataset"
            onKeyPress={(e) => e.key === 'Enter' && handleQuery(query)}
          />
          <button onClick={() => handleQuery(query)}>Ask</button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
