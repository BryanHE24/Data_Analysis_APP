import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';

function HomePage() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;  // Ensure a file is selected

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Check if response is successful
      if (response.data) {
        navigate(`/analyze/${uploadedFile.name}`, { 
          state: { datasetInfo: response.data } 
        });
      }
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

export default HomePage;