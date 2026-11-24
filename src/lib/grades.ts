// Grade/level lists used by every grade dropdown in the system.
export const CBC_LEVELS = [
  "Playgroup", "PP1", "PP2",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
] as const;

export const CAMBRIDGE_LEVELS = [
  "KG 1", "KG 2", "KG 3",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10",
] as const;

export const CURRICULUM_OPTIONS = [
  { value: "CBC", label: "CBC" },
  { value: "CAMBRIDGE", label: "Cambridge" },
] as const;

export function gradesFor(curriculum: string): readonly string[] {
  if (curriculum === "CBC") return CBC_LEVELS;
  if (curriculum === "CAMBRIDGE") return CAMBRIDGE_LEVELS;
  return [];
}

export function isValidGrade(curriculum: string, grade: string): boolean {
  return gradesFor(curriculum).includes(grade);
}
