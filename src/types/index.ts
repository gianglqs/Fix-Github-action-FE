export type Option = {
   value: string | number;
};
export type FilterOptions = Record<string, Option[]>;

export type InitReducer = {
   serverTimeZone: string;
   lastUpdatedTime: string;
   lastUpdatedBy: string;
   loadingPage: boolean;
};
