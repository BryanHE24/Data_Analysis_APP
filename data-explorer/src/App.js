import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage'; // Import HomePage
import AnalysisPage from './components/AnalysisPage'
import './styles/App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* HomePage route */}
        <Route path="/analyze/:filename" element={<AnalysisPage />} /> {/* Analysis route */}
      </Routes>
    </Router>
  );
};

export default App;
