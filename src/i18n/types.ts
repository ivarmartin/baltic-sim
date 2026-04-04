export type Locale = 'en' | 'sv';

export interface StageTranslation {
  name: string;
  narrative: string;
  /** Scene description for AI guide mode (not displayed to users). */
  aiPrompt?: string;
  /** Ordered narrative beats the AI should cover (~one per exchange). */
  narrativeBeats?: string[];
  /** One-liner transition hint to the next scene. */
  nextSceneHook?: string;
  /** References cited in this stage, pointing into the chapter's reference catalog. */
  refs?: StageRef[];
}

export interface ChapterTranslation {
  title: string;
  subtitle: string;
  /** Chapter-level context for AI guide mode (not displayed to users). */
  aiPrompt?: string;
  stages: Record<string, StageTranslation>;
  /** Catalog of reference entries used by this chapter's stages. */
  references?: Record<string, ReferenceEntry>;
  /** Chapter-level refs not tied to a specific stage (e.g., pan-Baltic assessment). */
  chapterRefs?: { title: string; refs: StageRef[] };
}

export interface ReferenceEntry {
  /** Full citation string. */
  citation: string;
  /** URL to the source. */
  url: string;
  /** Short link text shown to the user. */
  linkText: string;
}

export interface StageRef {
  /** Key into the chapter's `references` catalog. */
  refId: string;
  /** What this reference supports in *this* stage's context. */
  description: string;
}

export interface TranslationStrings {
  ui: {
    siteTitle: string;
    chooseChapter: string;
    speciesGuides: string;
    aboutTitle: string;
    aboutText: string;
    referencesTitle: string;
    referencesSubtitle: string;
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
