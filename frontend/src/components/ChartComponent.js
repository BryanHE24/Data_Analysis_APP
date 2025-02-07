import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function ChartComponent({ column, plot }) {
    // Convert base64 plot to chart data
    const chartData = {
        labels: [], // You'll need to extract labels from your data
        datasets: [
            {
                label: column,
                data: [], // You'll need to extract data values from your data
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
            },
        ],
    };
    // Basic options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Chart for ${column}`,
            },
        },
    };

    return (
        <div>
            <Bar options={options} data={chartData} />
        </div>
    );
}

export default ChartComponent;