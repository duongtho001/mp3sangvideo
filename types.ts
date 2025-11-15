export interface AudioPrompt {
  id: number;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface StoryboardPrompt {
  segment: number;
  prompt: string;
}

export interface Storyboard {
  characterDescriptions: string;
  settingDescription: string;
  storyboard: StoryboardPrompt[];
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  fileName: string;
  prompts: AudioPrompt[];
  scriptText: string;
  storyboard: Storyboard;
  voiceGender?: string | null;
  characterNationality?: string;
  generationStyle?: 'direct' | 'narrative';
  characterCount?: string;
}