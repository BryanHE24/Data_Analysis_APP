import React, { useState } from 'react';
import axios from 'axios';

function App() {
 
  const [selectedFile, setSelectedFile] = useState(null);  // State Variables: selectedFile stores the selected file
  const [analysisResults, setAnalysisResults] = useState(null);   // analysisResults stores the data analysis results from the backend.

  // handleFileChange updates the selectedFile state when a file is selected.
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  // handleUpload creates a FormData object to send the file to the backend
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    // uses axios to make a POST request to the /upload endpoint. Handles success and error responses. Calls analyzeData to trigger the analysis after a successful upload.
    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data); // Log success message

      // After successful upload, trigger analysis
      analyzeData(response.data.filename);

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };
  // Makes a GET request to the /analyze/:filename endpoint with the filename returned from the upload. Sets the analysisResults state with the data received from the backend
  const analyzeData = async (filename) => {
    try {
        const response = await axios.get(`http://localhost:5000/analyze/${filename}`);
        setAnalysisResults(response.data);
        console.log(response.data)
    } catch (error) {
        console.error('Error analyzing data:', error);
        alert('Error analyzing data');
    }
  };

  // JSX: Renders a file input, an upload button, and a section to display the analysis results (initially hidden).
  return (
    <div className="App">
      <h1>Data Analysis Dashboard</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      {analysisResults && (
        <div>
          <h2>Analysis Results:</h2>
          <pre>{JSON.stringify(analysisResults, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;