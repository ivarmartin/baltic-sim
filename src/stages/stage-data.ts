/**
 * Re-exports from chapter-data for backward compatibility.
 * The canonical source of stage/chapter data is now chapter-data.ts.
 */
export type { StageDefinition, EnvironmentPreset, Chapter } from './chapter-data';
export { chapters, getChapterCameraViews } from './chapter-data';
