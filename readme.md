# Dataset Analyzer Web App

A full-stack web application that allows users to upload CSV datasets, analyze the data with statistical summaries and visualizations, and interact with an AI-powered assistant for querying the dataset.
## Features
- Upload CSV files for analysis
- Generate statistical summaries (mean, median, etc.)
- Display data visualizations (histograms, box plots, scatter plots)
- AI-powered query assistant for dataset insights/hesitations
- User-friendly interface with React and Flask backend

## Technologies Used
**Frontend:**
- React.js (with React Router)
- Axios (for API requests)
- CSS for styling

**Backend:**
- Flask (Python)
- Flask-CORS
- Pandas (for data handling)
- Matplotlib & Seaborn (for data visualizations)
- Google Gemini AI API (for AI-powered queries)
- dotenv (for environment variables management)

## Installation & Setup
**Prerequisites:**

- Node.js & npm (for frontend)
- Python 3.x & pip (for backend)

**Backend Setup:**
Clone the repository:
```bash
git clone 
cd backend
```

**Install Python dependencies:**
```bash
pip install -r requirements.txt
```

**Set up environment variables:**

Create a .env file in the root directory and add Gemini API Key
```bash 
GOOGLE_API_KEY=<your-api-key>
```

**Run the Flask server:**
```bash 
python app.py
```

**Frontend Setup:**
Navigate to the frontend folder:
```bash 
cd .. 
cd data-explorer/
```

**Install dependencies:**
```bash 
npm install
```
**Start the React app:**
```bash
npm start
``` 
## Usage

1) Upload a CSV file from the homepage.
2) View dataset analysis, including summary statistics and visualizations.
3) Interact with the AI assistant to ask questions about the dataset.

## API Endpoints for reference

- Upload Dataset:
```bash
Endpoint: POST /upload
```
**Description: Uploads a CSV file, performs analysis, and returns statistics & visualizations.**

- Query AI Assistant:
```bash
Endpoint: POST /query/<filename>
```
**Description: Processes user queries related to the dataset using Google Gemini AI.**

## Project Structure

/ (root)
│── app.py               # Flask backend
│── /frontend            # React frontend
│── ├── src
│── │   ├── App.js       # Main React component
│── │   ├── index.js     # React entry point
│── │   ├── App.css      # Styling
│── │   ├── pages/
│── │   │   ├── HomePage.js      # File upload page
│── │   │   ├── AnalysisPage.js  # Dataset analysis & AI assistant
│── ├── public/
│── ├── package.json
│── .env                 # Environment variables
│── requirements.txt      # Backend dependencies

## License

This project is licensed under the MIT License.

## Author

Bryan ST Herrera Estrada (GitHub: [BryanHE24])