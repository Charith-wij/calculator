export interface Asset {
    completionDate: string;
    assetType: string;
    profitAtExit: number | null;
    cashflowPerMonth: number | null;
    propertyValue: number;
    purchasePrice: number;
    mortgage: number | null;
    equity: number | null;
    cashLeftIn?: number;
}