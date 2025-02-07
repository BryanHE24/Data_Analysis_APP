import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import { UploadFile, QuestionAnswer } from '@mui/icons-material';
import { styled } from '@mui/system';

import ShapeDisplay from './components/ShapeDisplay';
import ColumnsDisplay from './components/ColumnsDisplay';
import DescriptiveStatistics from './components/DescriptiveStatistics';
import NullCountsDisplay from './components/NullCountsDisplay';
import SummaryDisplay from './components/SummaryDisplay';
import ChartComponent from './components/ChartComponent';

// Styled components for better visual separation
const AnalysisSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const ChatBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '500px', // Fixed height for the chat box
  overflowY: 'scroll', // Enable vertical scrolling
  display: 'flex',
  flexDirection: 'column',
}));

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [query, setQuery] = useState('');
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [chatMessages, setChatMessages] = useState([]); // Array to hold chat messages
  const [summary, setSummary] = useState('');  // State to store summary - NEW

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
      console.log('Upload response:', response.data);
      setUploadedFilename(response.data.filename);
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
      console.log('Analysis response:', response.data);
    } catch (error) {
      console.error('Error analyzing data:', error);
      alert('Error analyzing data');
    }
  };

  useEffect(() => {
    if (analysisResults) {
      generateSummary();
    }
  }, [analysisResults]);

  const generateSummary = async () => {
    if (analysisResults) {
      const shape = `Shape: (${analysisResults.shape[0]}, ${analysisResults.shape[1]})`;
      const columns = `Columns: ${analysisResults.columns.join(', ')}`;
      const nullCounts = `Null Counts: ${Object.entries(analysisResults.null_counts).map(([col, count]) => `${col}: ${count}`).join(', ')}`;

      const prompt = `You are a data analyst. Summarize the following dataset information:\n\n${shape}\n${columns}\n${nullCounts}\n\nSummary:`;

      try {
        const response = await axios.post(`http://localhost:5000/query/${uploadedFilename}`, { query: prompt }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Summary response:', response.data);
        setSummary(response.data.answer);
      } catch (error) {
        console.error('Error generating summary:', error);
        setSummary('Error generating summary.');
      }
    }
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleQuerySubmit = async (event) => {
    event.preventDefault();
    if (!uploadedFilename) {
      alert('Please upload a file first.');
      return;
    }

    // Add user message to chat
    setChatMessages([...chatMessages, { text: query, isUser: true }]);
    setQuery(''); // Clear the input field

    try {
      const response = await axios.post(
        `http://localhost:5000/query/${uploadedFilename}`,
        { query: query },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Query response:', response.data);

      // Add AI response to chat
      setChatMessages(prevMessages => [...prevMessages, { text: response.data.answer, isUser: false }]);

    } catch (error) {
      console.error('Error querying data:', error.response ? error.response.data : error.message);
      alert(`Error querying data: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Data Analysis Dashboard
      </Typography>

      <AnalysisSection>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFile />}
            >
              Upload File
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!selectedFile}
            >
              Analyze Data
            </Button>
          </Grid>
        </Grid>

        {analysisResults && (
          <Box mt={3}>
            <Typography variant="h6">Analysis Results:</Typography>
            <SummaryDisplay summary={summary} /> {/* Display the summary here */}
            <ShapeDisplay shape={analysisResults.shape} />
            <ColumnsDisplay columns={analysisResults.columns} />
            <DescriptiveStatistics description={analysisResults.description} />
            <NullCountsDisplay nullCounts={analysisResults.null_counts} />

            <Typography variant="h6">Histograms:</Typography>
            <Grid container spacing={2}>
              {analysisResults.plots && Object.entries(analysisResults.plots).map(([column, plot], index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper elevation={3} style={{ padding: '10px' }}>
                    <Typography variant="subtitle2">{column}</Typography>
                    <ChartComponent column={column} plot={plot} /> {/* Plot the graphs */}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </AnalysisSection>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ChatBox>
            <List>
              {chatMessages.map((message, index) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemText
                    primary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {message.isUser ? 'You:' : 'AI Assistant:'}
                        </Typography>
                      </React.Fragment>
                    }
                    secondary={message.text}
                  />
                </ListItem>
              ))}
            </List>
          </ChatBox>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper style={{ padding: '16px' }}>
            <Typography variant="h6" gutterBottom>
              Ask a Question:
            </Typography>
            <form onSubmit={handleQuerySubmit}>
              <TextField
                label="Enter your question"
                variant="outlined"
                fullWidth
                value={query}
                onChange={handleQueryChange}
                InputProps={{
                  endAdornment: (
                    <Button type="submit" position="end">
                      <QuestionAnswer />
                    </Button>
                  ),
                }}
              />
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;