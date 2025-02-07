from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pandas as pd
from services.analysis_service import analyze_dataset
from services.query_service import process_query
from utils.file_handler import save_file

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
UPLOAD_FOLDER = os.path.join('uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '' or not file.filename.endswith('.csv'):
        return jsonify({'error': 'Invalid file type. Please upload a CSV'}), 400

    filepath = save_file(file, app.config['UPLOAD_FOLDER'])
    try:
        df = pd.read_csv(filepath)
        response_data = analyze_dataset(df, file.filename)
        return jsonify(response_data)
    except pd.errors.EmptyDataError:
        return jsonify({'error': 'Uploaded CSV file is empty'}), 400
    except pd.errors.ParserError:
        return jsonify({'error': 'Error parsing CSV file'}), 400
    except Exception as e:
        return jsonify({'error': f'Analysis error: {str(e)}'}), 500

@app.route('/query/<filename>', methods=['POST'])
def query_data(filename):
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        df = pd.read_csv(filepath)
        query = request.get_json().get('query', '').strip()
        if not query:
            return jsonify({'error': 'Query cannot be empty'}), 400

        answer = process_query(df, query)
        return jsonify({'answer': answer})
    except pd.errors.EmptyDataError:
        return jsonify({'error': 'CSV file is empty or corrupt'}), 400
    except Exception as e:
        return jsonify({'error': f'Query processing error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
