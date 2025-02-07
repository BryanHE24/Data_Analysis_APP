import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';

// Analysis page that shows dataset details and AI Assistant
const AnalysisPage = () => {
  const { filename } = useParams();
  const location = useLocation();
  const [dataset, setDataset] = useState(location.state?.datasetInfo || null);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatasetAnalysis = async () => {
      try {
        // Check if dataset is already passed through location.state, else fetch from backend
        if (!dataset) {
          const response = await axios.get(`http://localhost:5000/analyze/${filename}`);
          setDataset(response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dataset analysis:', error);
        setLoading(false);
      }
    };

    fetchDatasetAnalysis();
  }, [filename, dataset]);

  const handleQuery = async () => {
    if (!query.trim()) return;

    const userMessage = { type: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post(`http://localhost:5000/query/${filename}`, { query });
      const aiMessage = { type: 'ai', text: response.data.answer };
      setMessages(prev => [...prev, aiMessage]);
      setQuery('');
    } catch (error) {
      console.error('Query error', error);
    }
  };

  if (loading) {
    return <div>Loading dataset analysis...</div>;
  }

  if (!dataset) {
    return <div>No data found for this dataset.</div>;
  }

  return (
    <div className="analysis-page">
      <div className="main-analysis">
        <div className="dataset-overview">
          <h1>Dataset Analysis</h1>

          <div className="overview-grid">
            <div className="overview-card">
              <h3>Total Columns</h3>
              <p>{dataset.columns.length}</p>
            </div>
            <div className="overview-card">
              <h3>Total Rows</h3>
              <p>{dataset.shape[0]}</p>
            </div>
            <div className="overview-card">
              <h3>Columns</h3>
              <ul>
                {dataset.columns.map((col, index) => (
                  <li key={index}>{col}</li>
                ))}
              </ul>
            </div>
            <div className="overview-card">
              <h3>Null Value Counts</h3>
              {Object.entries(dataset.null_counts).map(([col, count]) => (
                <div key={col}>{col}: {count}</div>
              ))}
            </div>
          </div>

          <div className="statistical-description">
            <h2>Statistical Summary</h2>
            <div className="description-grid">
              {Object.entries(dataset.description).map(([column, stats]) => (
                <div key={column} className="description-card">
                  <h3>{column}</h3>
                  {Object.entries(stats).map(([stat, value]) => (
                    <div key={stat} className="stat-row">
                      <span className="stat-name">{stat}</span>
                      <span className="stat-value">{value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
              <br></br>
          <div className="visualizations">
            <h2>Data Visualizations</h2>
            <div className="plots-grid">
              {Object.entries(dataset.plots || {}).map(([plotName, plotUrl]) => (
                <div key={plotName} className="plot-card">
                  <h3>{plotName.replace('_', ' ').toUpperCase()}</h3>
                  <img 
                    src={`data:image/png;base64,${plotUrl}`} 
                    alt={`Plot of ${plotName}`} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
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
    </div>
  );
}

export default AnalysisPage;
