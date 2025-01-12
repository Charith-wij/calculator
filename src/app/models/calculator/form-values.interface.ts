import { GridItemStatus } from "./calculations-grid-item.model";
import { ComparableItem } from "./calculator-form.model";

export interface PropertyFormInitialValues {
    metaData: {
      address: string;
      guidePrice: number | null;
      floorArea: number | null;
      rightmoveLink: string;
      auctionSiteLink: string;
      notes: string;
      status: GridItemStatus
    };
    purchaseInformation: {
      purchasePrice: string;
      stampDuty: null;
      legalAndAuctionFees: number;
      refurbCost: string;
    };
    borrowingInformation: {
      depositPercentage: number;
      dipositAmount: null;
      mortgagePercentage: number;
      mortgageAmount: null;
      monthsOnBridging: number;
      mortgageFeePercentage: number;
      mortgageFeeAmount: null;
      mortgageInterestRate: number;
      mortgageInterestAmount: null;
    };
    comparables: Array<ComparableItem>;
    BTLInformation: {
      monthlyRent: string;
      lettingAgentFee: number;
      lettingAgentFeeAmount: null;
      monthlyRunningCosts: number;
    };
    BRRInformation: {
      newMarketValue: null;
      refinancedLTV: number;
      refinancedLTVAmount: null;
      refinancingArrangementFee: number;
      refinanceFeeAmount: null;
      refinancingInterestRate: number;
      refinanceInterestAmount: null;
    };
    BTSInformation: {
      salePrice: null;
      legalFeesBTS: number;
      estateAgentFee: number;
      estateAgentFeeAmount: null;
    };
  }