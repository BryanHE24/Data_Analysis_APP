import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

function SummaryDisplay({ summary }) {
 return (
   <Box mt={2} mb={2}>
     <Paper elevation={2} style={{ padding: '16px' }}>
       <Typography variant="h6">Summary:</Typography>
       <Typography variant="body1">{summary}</Typography>
     </Paper>
   </Box>
 );
}

export default SummaryDisplay;