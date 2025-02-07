import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/App.css';

// handles dataset uploads
const FileUpload = () => {
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    const handleFileUpload = async (event) => {
        const uploadedFile = event.target.files[0];
        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            const response = await api.uploadFile(formData);
            navigate(`/analyze/${uploadedFile.name}`, { 
                state: { datasetInfo: response.data }
            });
        } catch (error) {
            console.error('Upload error', error);
        }
    };

    return (
        <div className="upload-container">
            <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload}
                id="file-upload"
                className="file-input"
            />
            <label htmlFor="file-upload" className="upload-button">
                Upload Dataset
            </label>
        </div>
    );
};

export default FileUpload;
