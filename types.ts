
export type Page = 
  | 'home' 
  | 'performance' 
  | 'level1' 
  | 'level2' 
  | 'level3' 
  | 'level4' 
  | 'level5' 
  | 'level6';

export interface CompletedLevels {
  [levelId: string]: boolean;
}
