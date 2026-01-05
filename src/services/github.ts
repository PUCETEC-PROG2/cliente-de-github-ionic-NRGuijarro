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
  // Request more results and show newest first so repos created from the app appear immediately
  const res = await api.get('/user/repos', {
    params: {
      sort: 'created',
      direction: 'desc',
      per_page: 100
    }
  });
  return res.data;
}

export async function createRepo(payload: { name: string; description?: string; private?: boolean }) {
  const res = await api.post('/user/repos', payload);
  return res.data;
}

export async function updateRepo(owner: string, repo: string, payload: { name?: string; description?: string; private?: boolean }) {
  const res = await api.patch(`/repos/${owner}/${repo}`, payload);
  return res.data;
}

export async function deleteRepo(owner: string, repo: string) {
  const res = await api.delete(`/repos/${owner}/${repo}`);
  return res.status === 204;
}
