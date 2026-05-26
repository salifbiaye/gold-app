import { orders } from '../../data/mockData';
import { apiRequest } from '../api/client';
import { serviceConfig } from '../serviceConfig';

export type Order = {
  id: string;
  title: string;
  meta: string;
  detail: string;
  statusKey: string;
  status: string;
  statusColor: string;
};

export async function getOrders(): Promise<Order[]> {
  if (serviceConfig.useMock) return orders;
  return apiRequest<Order[]>('/orders');
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  if (serviceConfig.useMock) return orders.find((o) => o.id === id);
  return apiRequest<Order>(`/orders/${id}`);
}
