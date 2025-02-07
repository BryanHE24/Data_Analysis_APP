import React from 'react';
import { Typography, List, ListItem, ListItemText } from '@mui/material';

function ColumnsDisplay({ columns }) {
  return (
    <div>
      <Typography variant="h6">Columns:</Typography>
      <List>
        {columns.map((column, index) => (
          <ListItem key={index}>
            <ListItemText primary={column} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default ColumnsDisplay;
