import React from 'react';
import { Typography } from '@mui/material';

function ShapeDisplay({ shape }) {
  return (
    <div>
      <Typography variant="subtitle1">Shape: ({shape[0]}, {shape[1]})</Typography>
    </div>
  );
}

export default ShapeDisplay;