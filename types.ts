export enum Sentiment {
  Neutral = "Neutral",
  Positive = "Positive",
  Negative = "Negative"
}

export enum DecisionType {
  Buy = "buy",
  NotBuy = "not-buy",
  NoDecision = "no-decision",
  Error = "error",
  None = "none"
}

export interface DecisionResult {
  type: DecisionType;
  title: string;
  reason: string;
  className: string;
}

export interface StockData {
  companyCode: string;
  peRatio: string; // Keeping as string for input handling, parsing later
  rsiRatio: string;
  sentiment: Sentiment;
  peThreshold: string;
  rsiThreshold: string;
  notes: string;
}