// Handle API Requests
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = {
    uploadFile: (formData) => axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    sendQuery: (filename, query) => axios.post(`${API_BASE_URL}/query/${filename}`, { query }),
};

export default api;
