from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import io
import base64
import matplotlib.pyplot as plt
import seaborn as sns
from dotenv import load_dotenv
import google.generativeai as genai
import time

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = os.path.join('uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

def generate_visualizations(df):
    plots = {}
    plt.close('all')
    numerical_cols = df.select_dtypes(include=['number']).columns

    # Histogram for each numerical column
    for col in numerical_cols:
        plt.figure(figsize=(8, 6))
        df[col].hist()
        plt.title(f'Histogram of {col}')
        plots[f'histogram_{col}'] = save_plot()

    # Box plots for numerical columns
    plt.figure(figsize=(10, 6))
    df[numerical_cols].boxplot()
    plt.title('Box Plot of Numerical Columns')
    plots['boxplot'] = save_plot()

    # Scatter plot if more than one numerical column
    if len(numerical_cols) > 1:
        plt.figure(figsize=(8, 6))
        plt.scatter(df[numerical_cols[0]], df[numerical_cols[1]])
        plt.title(f'Scatter Plot: {numerical_cols[0]} vs {numerical_cols[1]}')
        plt.xlabel(numerical_cols[0])
        plt.ylabel(numerical_cols[1])
        plots['scatter'] = save_plot()

    # Bar plot of mean values
    plt.figure(figsize=(10, 6))
    df[numerical_cols].mean().plot(kind='bar')
    plt.title('Mean Values of Numerical Columns')
    plt.xticks(rotation=45)
    plots['mean_bar'] = save_plot()

    return plots

def save_plot():
    img = io.BytesIO()
    plt.tight_layout()
    plt.savefig(img, format='png')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode('utf8')
    plt.close()
    return plot_url

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.csv'):
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)
        
        try:
            df = pd.read_csv(filename)
            
            description = df.describe().to_dict()
            columns = df.columns.tolist()
            dtypes = [str(t) for t in df.dtypes.tolist()]
            shape = df.shape
            null_counts = df.isnull().sum().to_dict()
            
            plots = generate_visualizations(df)
            
            return jsonify({
                'message': 'File uploaded and analyzed successfully', 
                'filename': file.filename,
                'description': description,
                'columns': columns,
                'dtypes': dtypes,
                'shape': shape,
                'null_counts': null_counts,
                'plots': plots
            })
        except Exception as e:
            return jsonify({'error': f'Analysis error: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file type. Please upload a CSV'}), 400

@app.route('/query/<filename>', methods=['POST'])
def query_data(filename):
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        df = pd.read_csv(filepath)
        query = request.get_json()['query']

        data_string = df.to_string()
        prompt = f"You are a data analysis assistant. Analyze the following data:\n\n{data_string}\n\nUser Query: {query}\n\nResponse:"

        response = model.generate_content(prompt)
        answer = response.text

        return jsonify({'answer': answer})

    except Exception as e:
        return jsonify({'error': f'Query processing error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)