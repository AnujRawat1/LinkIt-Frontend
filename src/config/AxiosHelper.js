import axios from 'axios';

export const baseURL = 'https://linkit-latest.onrender.com';  

export const httpClient = axios.create({
    baseURL: baseURL,
});