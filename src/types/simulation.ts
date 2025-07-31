export interface DilemmaOption {
  id: string;
  text: string;
  impact: number; // -100 to 100
  riskLevel: 'low' | 'medium' | 'high';
  consequences: string;
}

export interface Dilemma {
  id: string;
  category: 'financial' | 'marketing' | 'hr' | 'strategy';
  title: string;
  description: string;
  scenario: string;
  options: DilemmaOption[];
  timeLimit: number; // seconds
  defaultOptionId: string; // most conservative option
}

export interface UserDecision {
  dilemmaId: string;
  optionId: string;
  timeSpent: number;
  wasAutomatic: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  cnpj?: string;
  empresa?: string;
  cargo?: string;
  decisions: UserDecision[];
  totalScore: number;
  profileType: 'innovator' | 'strategist' | 'operational' | 'sales' | 'visionary' | 'conservative';
  badges: Badge[];
  completedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  whatsapp: string;
  cnpj?: string;
  empresa?: string;
  cargo?: string;
  score: number;
  profileType: 'innovator' | 'strategist' | 'operational' | 'sales' | 'visionary' | 'conservative';
  badges: Badge[];
  timestamp: Date;
}

export const CategoryIcons = {
  financial: '💰',
  marketing: '📢',
  hr: '👥',
  strategy: '⚙️'
} as const;

export const CategoryLabels = {
  financial: 'Financeiro',
  marketing: 'Marketing',
  hr: 'Recursos Humanos',
  strategy: 'Estratégia'
} as const;