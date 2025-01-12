import { GridItemStatus } from "./calculations-grid-item.model";

export interface CalculatorForm {
    metaData: MetaData;
    purchaseInformation: PurchaseInformation;
    borrowingInformation: BorrowingInformation;
    comparables: ComparableItem[];
    BTLInformation: BTLInformation;
    BRRInformation: BRRInformation;
    BTSInformation: BTSInformation;
}

export interface MetaData {
    address: string;
    guidePrice: number;
    floorArea: number;
    rightmoveLink: string;
    auctionSiteLink: string;
    notes: string;
    status: GridItemStatus;
    imageUrl: string;
}

export interface PurchaseInformation {
    purchasePrice: number;
    stampDuty: number;
    legalAndAuctionFees: number;
    refurbCost: number;
}

export interface BorrowingInformation {
    depositPercentage: number;
    dipositAmount: number | null;
    mortgagePercentage: number;
    mortgageAmount: number;
    monthsOnBridging: number;
    mortgageArrangementFee: number;
    mortgageFeeAmount: number | null;
    mortgageInterestRate: number;
    mortgageInterestAmount: number | null;
}

export interface ComparableItem {
    propertyAddress: string;
    salePrice: number;
    bedsBaths?: string;
    condition?: string;
    sqMetre: number;
    pricePerSqm: number;
    link: string;
  }
  
export interface BTLInformation {
    monthlyRent: number;
    lettingAgentFee: number;
    lettingAgentFeeAmount: number | null;
    monthlyRunningCosts: number;
}

export interface BRRInformation {
    newMarketValue: number;
    refinancedLTV: number;
    refinancedLTVAmount: number | null;
    refinancingArrangementFee: number;
    refinanceFeeAmount: number | null;
    refinancingInterestRate: number;
    refinanceInterestAmount: number | null;
}

export interface BTSInformation {
    salePrice: number;
    legalFeesBTS: number;
    estateAgentFee: number;
    estateAgentFeeAmount: number | null;
}

//  Results

export interface CalculatedFigures {
    exitOptionBTL: ExitOptionBTL;
    exitOptionBRR: ExitOptionBRR;
    exitOptionBTS: ExitOptionBTS;
}

export interface ExitOptionBTL {
    totalInvestmentCosts: number;
    monthlyCashflow: number;
    grossYield: number;
    netYield: number;
    returnOnInvestment: number;
}

export interface ExitOptionBRR {
    refinancedMonthlyCashflow: number;
    cashOutFromRefinancing: number;
    moneyLeftInDeal: number;
    monthsBeforeNoMoneyLeft: number;
    returnOnInvestment: number;
}

export interface ExitOptionBTS {
    totalInvestmentCosts: number;
    totalSellingCosts: number;
    profitFromDeal: number;
    returnOnInvestment: number;
}
