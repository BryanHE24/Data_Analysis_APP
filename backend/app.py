from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# defines a fodler to store uploaded files.
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Rout for Uploading a file
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
        return jsonify({'message': 'File uploaded successfully', 'filename': file.filename})

# route for data analysis
@app.route('/analyze/<filename>')
def analyze_data(filename):
  try:
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    df = pd.read_csv(filepath)

    # Perform basic data analysis here
    description = df.describe().to_dict()
    columns = df.columns.tolist()
    dtypes = [str(t) for t in df.dtypes.tolist()] #make it serializable

    # Return analysis results
    return jsonify({
        'description': description,
        'columns': columns,
        'dtypes': dtypes
    })
  except FileNotFoundError:
    return jsonify({'error': 'File not found'}), 404
  except Exception as e:
    return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)