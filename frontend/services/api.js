import axios from 'axios';

// Replace with your local IP if testing on a physical device
const API = axios.create({
  baseURL: 'http://192.168.0.223:5000/api', 
});

export const fetchEchoes = () => API.get('/echoes');
export const postEcho = (echoData) => API.post('/echoes', echoData);

export default API;