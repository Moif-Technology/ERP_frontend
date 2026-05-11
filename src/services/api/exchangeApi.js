import httpClient from '../http/httpClient.js';

export const listCurrencies = () =>
  httpClient.get('/api/exchange/currencies');

export const activateCurrency = (code) =>
  httpClient.post(`/api/exchange/currencies/${code}/activate`);

export const deactivateCurrency = (code) =>
  httpClient.post(`/api/exchange/currencies/${code}/deactivate`);

export const setBaseCurrency = (code) =>
  httpClient.post(`/api/exchange/currencies/${code}/set-base`);

export const listRates = (params) =>
  httpClient.get('/api/exchange/rates', { params });

export const createRate = (body) =>
  httpClient.post('/api/exchange/rates', body);

export const updateRate = (rateId, body) =>
  httpClient.put(`/api/exchange/rates/${rateId}`, body);

export const deleteRate = (rateId) =>
  httpClient.delete(`/api/exchange/rates/${rateId}`);

export const getLatestRate = (from, to) =>
  httpClient.get('/api/exchange/rates/latest', { params: { from, to } });
