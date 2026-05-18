export type MatchRecord = {
  id: string;
  date: string;
  weekday: string;
  round_no: number;
  player_a_name: string;
  player_b_name: string;
  player_a_score: number;
  player_b_score: number;
  winner: string;
  score_diff: number;
  table_fee: number;
  payer: string;
  note: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type MatchInput = {
  date: string;
  round_no: number;
  player_a_score: number;
  player_b_score: number;
  table_fee: number;
  payer: string;
  note: string;
};

export type Filters = {
  dateFrom?: string;
  dateTo?: string;
  payer?: string;
  winner?: string;
  roundFrom?: string;
  roundTo?: string;
};
