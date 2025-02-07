import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function HomePage() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      navigate(`/analyze/${uploadedFile.name}`, { 
        state: { datasetInfo: response.data } 
      });
    } catch (error) {
      console.error('Upload error', error);
    }
  };

  return (
    <div className="home-page">
      <div className="welcome-container">
        <h1>Dataset Analyzer</h1>
        <div className="upload-section">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload}
            id="file-upload"
            className="file-input"
          />
          <label htmlFor="file-upload" className="upload-button">
            Upload Dataset
          </label>
        </div>
      </div>
    </div>
  );
}

function AnalysisPage() {
  const { filename } = useParams();
  const location = useLocation();
  const [dataset, setDataset] = useState(location.state?.datasetInfo);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);

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

  if (!dataset) return <div>Loading dataset analysis...</div>;

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
                {dataset.columns.map((columns, index) => (
                  <li key={index}>{columns}</li>
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analyze/:filename" element={<AnalysisPage />} />
      </Routes>
    </Router>
  );
}

export default App;