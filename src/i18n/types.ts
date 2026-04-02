export type Locale = 'en' | 'sv';

export interface TranslationStrings {
  ui: {
    siteTitle: string;
    chooseChapter: string;
    speciesGuides: string;
    aboutTitle: string;
    aboutText: string;
  };
  chapters: Record<
    string,
    {
      title: string;
      subtitle: string;
      stages: Array<{
        name: string;
        narrative: string;
      }>;
    }
  >;
}
