
export type Page = 
  | 'login'
  | 'home' 
  | 'performance' 
  | 'profile'
  | 'strabplay_home'
  | 'support'
  | 'time_assessment'
  | 'administration'
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
  id: string;
  name: string;
  nickname?: string;
  username: string;
  password: string;
  age: string;
  condition: string;
  joinedDate: string;
  role?: 'admin' | 'patient';
  
  // Module Access Control
  amblyoLocked?: boolean;
  strabLocked?: boolean;

  // General Information
  customerId?: string;
  oaTestedDate?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  specialCondition?: string;

  // Medical Profile Fields
  medical_history?: string;
  va_method?: 'Snellen' | 'LogMAR';
  va_correction?: 'CC' | 'SC';
  va_od?: string;
  va_os?: string;
  
  // Binocular Status (Worth 4 Dot)
  binocular_near?: 'L suppression' | 'R suppression' | '4 lights' | '5 lights' | '';
  binocular_far?: 'L suppression' | 'R suppression' | '4 lights' | '5 lights' | '';
  
  // Stereo Acuity
  stereo_near?: string;
  stereo_far?: string;
  
  // Convergence
  convergence_cm?: string;
  
  // Prism Fusion Range
  prism_near_bi?: string;
  prism_near_bo?: string;
  prism_far_bi?: string;
  prism_far_bo?: string;
  
  // Accommodation
  acc_amp_near_bi?: string;
  acc_amp_near_bo?: string;
  acc_amp_far_bi?: string;
  acc_amp_far_bo?: string;
  acc_facility_near_bi?: string;
  acc_facility_near_bo?: string;
  acc_facility_far_bi?: string;
  acc_facility_far_bo?: string;

  // Deviation Angle
  dev_near_type?: 'BI' | 'BO';
  dev_near_value?: string;
  dev_far_type?: 'BI' | 'BO';
  dev_far_value?: string;
  
  // Fixation
  fixation_od?: string;
  fixation_os?: string;

  diagnosis?: string;
  rx_plans?: string;
  
  // Deprecated fields (kept for compatibility)
  medical_diagnosis?: string;
  acuity_right?: string;
  acuity_left?: string;
  therapy_focus?: string;
  doctor_notes?: string;
}

export interface LevelStats {
  levelId: string;
  stars: number;
  score: number;
  incorrect: number;
  contrast?: number;
  size?: number;
  timestamp: number;
  duration?: number; // Time spent in seconds
  category: 'amblyo' | 'strab';
  userId: string;
}

export interface CompletedLevels {
  [levelId: string]: number;
}

export interface UserProgress {
  userId: string;
  completedLevels: CompletedLevels;
  history: LevelStats[];
}

export interface GameHistory {
  history: LevelStats[];
}
