import React from 'react';
import { Typography, List, ListItem, ListItemText } from '@mui/material';

function NullCountsDisplay({ nullCounts }) {
  return (
    <div>
      <Typography variant="h6">Null Value Counts:</Typography>
      <List>
        {Object.entries(nullCounts).map(([column, count], index) => (
          <ListItem key={index}>
            <ListItemText primary={`${column}: ${count}`} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default NullCountsDisplay;