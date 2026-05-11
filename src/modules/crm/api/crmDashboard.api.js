import httpClient from '../../../services/http/httpClient';

export async function getCrmDashboard() {
  const { data } = await httpClient.get('/api/crm/dashboard');
  return data;
}
