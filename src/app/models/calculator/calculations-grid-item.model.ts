export interface CalculationsGridItem {
    address: string;
    guidePrice: number;
    purchasePrice: number;
    auctionFees: number;
    refurbCost: number;
    MRV: number;
    profit: number;
    cashLeftIn: number;
    notes: string;
    status: GridItemStatus;
}

export enum GridItemStatus {
    newItem = 'New',
    activeItem = 'Active',
    expiredItem = 'Expired'
}