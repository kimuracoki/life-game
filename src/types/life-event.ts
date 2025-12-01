export type LifeEvent = {
  title: string;
  from: number; // 年齢(歳)の下限
  to: number;   // 年齢(歳)の上限（含む）
  money: number;
  get?: string;          // 取得するアイテム名（空文字の場合は無視）
  lost?: string;         // 失うアイテム名（空文字の場合は無視）
  employment?: string;   // 新しく就く職（空文字の場合は変更なし）
  unemployment?: boolean; // true なら現在の職を失う
};

export type LifeEventsData = {
  events: LifeEvent[];
};