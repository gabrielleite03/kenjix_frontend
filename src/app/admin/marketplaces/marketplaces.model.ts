export interface Marketplace {
  id: string;
  name: string;
  logo?: string;
  status: 'active' | 'inactive';
  commissionRate: number;
  integrationType: 'api' | 'manual' | 'webhook';
  apiUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  apiEndpoint?: string;
  createdAt: string;
}
