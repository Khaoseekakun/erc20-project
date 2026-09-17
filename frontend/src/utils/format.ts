export const shortAddress = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;
export const tokenFormat = (value: string) => `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(Number(value || 0))} ERCBWT`;
export const assetFormat = (value: string, symbol: string) => `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 4, minimumFractionDigits: 2 }).format(Number(value || 0))} ${symbol}`;
export const ethFormat = (value: string) => `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(Number(value || 0))} ETH`;
export const thaiDate = (date: string) => new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
