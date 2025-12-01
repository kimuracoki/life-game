export type LifeEvent = {
  title: string;
  from: number; // 年齢(歳)の下限
  to: number;   // 年齢(歳)の上限（含む）
  money: number;
  get?: string;           // 取得するアイテム名
  lost?: string;          // 失うアイテム名
  employment?: string;    // 新しく就く職
  unemployment?: boolean; // true なら現在の職を失う
  join?: string;          // 加わる仲間
  leave?: string;         // 離れる仲間
};

export type LifeEventsData = {
  events: LifeEvent[];
};