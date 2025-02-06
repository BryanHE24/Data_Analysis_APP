import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

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


  return (
    <div className="App">
      <h1>Data Analysis Dashboard</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      {analysisResults && (
        <div>
          <h2>Analysis Results:</h2>
          <pre>Shape: {JSON.stringify(analysisResults.shape)}</pre>
          <pre>Columns: {JSON.stringify(analysisResults.columns)}</pre>
           <h2>Descriptive Statistics:</h2>
          <pre>{JSON.stringify(analysisResults.description, null, 2)}</pre>
          <h2>Null Counts:</h2>
           <pre>{JSON.stringify(analysisResults.null_counts, null, 2)}</pre>

          <h2>Histograms:</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {analysisResults.plots && Object.entries(analysisResults.plots).map(([column, plot], index) => (
              <div key={index} style={{ width: '300px', margin: '10px' }}>
                <h3>{column}</h3>
                <img src={`data:image/png;base64,${plot}`} alt={`Histogram of ${column}`} style={{ maxWidth: '100%' }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;