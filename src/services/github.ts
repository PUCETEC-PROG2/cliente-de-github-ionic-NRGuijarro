import axios from 'axios';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
    Accept: 'application/vnd.github.v3+json'
  }
});

export async function getUser() {
  const res = await api.get('/user');
  return res.data;
}

export async function getUserRepos() {
  const res = await api.get('/user/repos');
  return res.data;
}

export async function createRepo(payload: { name: string; description?: string; private?: boolean }) {
  const res = await api.post('/user/repos', payload);
  return res.data;
}
