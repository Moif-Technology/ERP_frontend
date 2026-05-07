import httpClient from '../../../services/http/httpClient';

const BASE = '/api/garage/vehicles';

export async function getVehicleByRegNo(regNo) {
  const { data } = await httpClient.get(BASE, { params: { q: regNo } });
  const vehicles = data.vehicles || [];
  return vehicles.find((v) => v.regNo?.toUpperCase() === regNo.toUpperCase()) || null;
}
