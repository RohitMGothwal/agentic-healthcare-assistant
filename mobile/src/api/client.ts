import axios from 'axios';
import Constants from 'expo-constants';

const manifest = (Constants.expoConfig || Constants.manifest) as any;
const baseURL = manifest?.extra?.apiBaseUrl || 'http://localhost:8000';

export const api = axios.create({
  baseURL,
  timeout: 10000,
});
