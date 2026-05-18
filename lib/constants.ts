export const PLAYER_A = "陈振明";
export const PLAYER_B = "何烈";
export const PLAYERS = [PLAYER_A, PLAYER_B] as const;

export type PlayerName = (typeof PLAYERS)[number];

export const PLAYER_EMAILS: Record<PlayerName, string> = {
  [PLAYER_A]: process.env.NEXT_PUBLIC_PLAYER_A_EMAIL ?? "",
  [PLAYER_B]: process.env.NEXT_PUBLIC_PLAYER_B_EMAIL ?? ""
};

export const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function getWeekday(date: string) {
  return weekdays[new Date(`${date}T00:00:00`).getDay()];
}

export function todayText() {
  const now = new Date();
  const tzDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return tzDate.toISOString().slice(0, 10);
}
