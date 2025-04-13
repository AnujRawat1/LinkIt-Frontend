import axios from 'axios';

export const baseURL = 'https://linkit-wi8h.onrender.com';  


export const httpClient = axios.create({
    baseURL: baseURL,
});