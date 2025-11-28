import axios from 'axios';

const instance = axios.create({
    // Trỏ về Server Node.js của chúng ta
    baseURL: 'http://localhost:5000/api', 
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default instance;