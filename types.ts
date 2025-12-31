
export type Page = 
  | 'login'
  | 'home' 
  | 'performance' 
  | 'profile'
  | 'strabplay_home'
  | 'support'
  | 'time_assessment'
  | 'level1' 
  | 'level2' 
  | 'level3' 
  | 'level4' 
  | 'level5' 
  | 'level6'
  | 'strab_level1'
  | 'strab_level2'
  | 'strab_level3'
  | 'strab_level4'
  | 'strab_level5'
  | 'strab_level6'
  | 'strab_level7'
  | 'strab_level8'
  | 'strab_level9';

export type Language = 'en' | 'si';

export interface UserProfile {
  name: string;
  age: string;
  condition: string;
  joinedDate: string;
}

export interface LevelStats {
  levelId: string;
  stars: number;
  score: number;
  incorrect: number;
  contrast?: number;
  size?: number;
  timestamp: number;
  category: 'amblyo' | 'strab';
}

export interface CompletedLevels {
  [levelId: string]: number;
}

export interface GameHistory {
  history: LevelStats[];
}