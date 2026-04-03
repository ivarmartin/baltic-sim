export type Locale = 'en' | 'sv';

export interface StageTranslation {
  name: string;
  narrative: string;
  /** Scene description for AI guide mode (not displayed to users). */
  aiPrompt?: string;
}

export interface ChapterTranslation {
  title: string;
  subtitle: string;
  /** Chapter-level context for AI guide mode (not displayed to users). */
  aiPrompt?: string;
  stages: Record<string, StageTranslation>;
}

export interface TranslationStrings {
  ui: {
    siteTitle: string;
    chooseChapter: string;
    speciesGuides: string;
    aboutTitle: string;
    aboutText: string;
    modeLinear: string;
    modeAiGuided: string;
    chatPlaceholder: string;
    chatSend: string;
  };
  chapters: Record<string, ChapterTranslation>;
  /** Global AI guide configuration (not displayed to users). */
  ai?: {
    coreSystemPrompt: string;
  };
}
