
export type Page = 
  | 'home' 
  | 'performance' 
  | 'profile'
  | 'strabplay_home'
  | 'level1' 
  | 'level2' 
  | 'level3' 
  | 'level4' 
  | 'level5' 
  | 'level6';

export interface CompletedLevels {
  [levelId: string]: number;
}