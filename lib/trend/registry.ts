import type { TrendConfig } from './types';
import { SCS } from './scs';
import { DENKI } from './denki';

/**
 * トレンド速攻ページの設定の一覧。新しい波は、設定ファイルを作ってここに1行足し、
 * app/check/<id>/page.tsx を置けば公開できる。
 */
export const TRENDS: Record<string, TrendConfig> = {
  scs: SCS,
  denki: DENKI,
};
