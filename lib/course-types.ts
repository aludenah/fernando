export type ChapterTopic = {
  id: string; title: string; pages: string; concept: string;
  formulas: string[]; example: string; tip: string;
};
export type Chapter = {
  id: string; title: string; subject: string; chapter: number; source: string;
  convention: string; objectives: string[]; taskIds: string[]; topics: ChapterTopic[];
};
