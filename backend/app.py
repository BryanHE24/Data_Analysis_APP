from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import io
import base64
import matplotlib.pyplot as plt
from dotenv import load_dotenv
import google.generativeai as genai
import time  # Import the time module

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join('uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

# Rate limiting variables
REQUEST_INTERVAL = 1  # Minimum time (in seconds) between requests
last_request_time = 0

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)
        print(f"File saved successfully: {filename}")
        return jsonify({'message': 'File uploaded successfully', 'filename': file.filename})


@app.route('/analyze/<filename>')
def analyze_data(filename):
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        df = pd.read_csv(filepath)

        # Basic statistics
        description = df.describe().to_dict()
        columns = df.columns.tolist()
        dtypes = [str(t) for t in df.dtypes.tolist()]
        shape = df.shape
        null_counts = df.isnull().sum().to_dict()

        # Data Visualization (example: histogram for each numerical column)

        plots = {}
        for col in df.select_dtypes(include=['number']).columns:
            plt.figure()  # Create a new figure for each plot
            df[col].hist()
            plt.title(f'Histogram of {col}')
            plt.xlabel(col)
            plt.ylabel('Frequency')

            # Convert plot to base64 string
            img = io.BytesIO()
            plt.savefig(img, format='png')
            img.seek(0)
            plot_url = base64.b64encode(img.getvalue()).decode('utf8')
            plots[col] = plot_url
            plt.close()  # Close the figure to free memory

        # Return analysis results
        return jsonify({
            'description': description,
            'columns': columns,
            'dtypes': dtypes,
            'shape': shape,
            'null_counts': null_counts,
            'plots': plots  # Include the plots in the response
        })
    except FileNotFoundError:
        error_message = f"File not found: {filename}"
        print(error_message)
        return jsonify({'error': error_message}), 404
    except Exception as e:
        error_message = f"Error analyzing data: {str(e)}"
        print(error_message)
        return jsonify({'error': error_message}), 500

def load_data_into_string(filepath):
    try:
        df = pd.read_csv(filepath)
        return df.to_string()
    except Exception as e:
        return f"Error loading data: {str(e)}"

@app.route('/query/<filename>', methods=['POST'])
def query_data(filename):
    global last_request_time  # Access the global variable

    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        query = request.get_json()['query']
        print(f"Received query: {query} for file: {filename}")

        # Rate limiting
        current_time = time.time()
        time_since_last_request = current_time - last_request_time
        if time_since_last_request < REQUEST_INTERVAL:
            sleep_time = REQUEST_INTERVAL - time_since_last_request
            print(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)

        # Load data from the CSV file into a string
        data_string = load_data_into_string(filepath)

        # Construct the prompt for Gemini
        prompt = f"You are a data analysis assistant. Analyze the following data:\n\n{data_string}\n\nUser Query: {query}\n\nResponse:"

        # Generate content with the model
        response = model.generate_content(prompt)
        answer = response.text

        print(f"Gemini API response: {answer}")

        # Update the last request time
        last_request_time = time.time()

        return jsonify({'answer': answer})

    except FileNotFoundError:
        error_message = f"File not found: {filename}"
        print(error_message)
        return jsonify({'error': error_message}), 404
    except Exception as e:
        error_message = f"Error processing query: {str(e)}"
        print(error_message)
        return jsonify({'error': error_message}), 500

if __name__ == '__main__':
    app.run(debug=True)