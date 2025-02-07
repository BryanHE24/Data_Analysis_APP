import React from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function DescriptiveStatistics({ description }) {
  if (!description) {
    return <Typography>No descriptive statistics available.</Typography>;
  }

  const columns = Object.keys(description);
  const metrics = Object.keys(description[columns[0]]);

  return (
    <div>
      <Typography variant="h6">Descriptive Statistics:</Typography>
      <TableContainer component={Paper}>
        <Table aria-label="descriptive statistics table">
          <TableHead>
            <TableRow>
              <TableCell>Metric</TableCell>
              {columns.map((column) => (
                <TableCell key={column} align="right">{column}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric}>
                <TableCell component="th" scope="row">{metric}</TableCell>
                {columns.map((column) => (
                  <TableCell key={column} align="right">{description[column][metric]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default DescriptiveStatistics;