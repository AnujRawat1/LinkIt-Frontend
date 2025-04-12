import axios from 'axios';

export const baseURL =
  window.location.protocol === 'https:'
    ? 'https://linkit-ten.vercel.app' 
    : 'http://localhost:8080';  


export const httpClient = axios.create({
    baseURL: baseURL,
});