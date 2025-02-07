import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import '../styles/App.css';

const QueryBox = ({ filename }) => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const handleQuery = async () => {
        if (!query.trim()) return;

        const userMessage = { type: 'user', text: query };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            const response = await api.sendQuery(filename, query);
            const aiMessage = { type: 'ai', text: response.data.answer };
            setMessages(prev => [...prev, aiMessage]);
            setQuery('');
        } catch (error) {
            console.error('Query error', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="query-box">
            <div className="chat-header">
                <h3>AI Data Assistant</h3>
            </div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type}`}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                ))}
                {loading && <div className="message loading">Loading...</div>}
                <div ref={chatEndRef} />
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about your dataset"
                    onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                />
                <button onClick={handleQuery}>Ask</button>
            </div>
        </div>
    );
};

export default QueryBox;