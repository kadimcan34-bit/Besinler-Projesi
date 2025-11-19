export interface NutritionData {
  estimatedCalories: number;
  macros: {
    protein: number; // percentage
    carbs: number; // percentage
    fat: number; // percentage
  };
  ingredients: string[];
  healthScore: number; // 1-10
  analysis: string; // General summary
  ageBasedAdvice: string; // Specific advice for the user's age
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  groundingUrls?: Array<{ title: string; uri: string }>;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface UserProfile {
  age: number;
}
