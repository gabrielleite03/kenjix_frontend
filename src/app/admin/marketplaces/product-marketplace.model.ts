export interface ProductMarketplace {
  id: string;
  productId: number;
  marketplaceId: number;
  externalId?: string;
  productUrl: string;
  price?: number;
  listingType?: string;
  status?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceProductDisplay extends ProductMarketplace {
  productName: string;
  productImage: string;
  productSku: string;
  marketplaceName: string;
  marketplaceLogo: string;
}
