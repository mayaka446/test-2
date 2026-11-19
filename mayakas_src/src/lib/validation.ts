import { z } from "zod";
export const curriculumSchema = z.enum(["CBC","CAMBRIDGE"]);
export const attendanceStatusSchema = z.enum(["PRESENT","ABSENT","LATE","EXCUSED"]);
export function todayAtMidnight(value?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  date.setHours(0,0,0,0);
  return date;
}
export function gradeForScore(score:number, curriculum:"CBC"|"CAMBRIDGE", bands:{minScore:number;maxScore:number;grade:string;description:string|null}[]) {
  const band=bands.find(b=>score>=b.minScore && score<=b.maxScore);
  if (band) return {grade:band.grade, comment:band.description || band.grade};
  if (curriculum==="CBC") {
    if(score>=80)return {grade:"EE",comment:"Exceeding Expectation"};
    if(score>=60)return {grade:"ME",comment:"Meeting Expectation"};
    if(score>=40)return {grade:"AE",comment:"Approaching Expectation"};
    return {grade:"BE",comment:"Below Expectation"};
  }
  if(score>=90)return {grade:"A*",comment:"Outstanding"};
  if(score>=80)return {grade:"A",comment:"Excellent"};
  if(score>=70)return {grade:"B",comment:"Very good"};
  if(score>=60)return {grade:"C",comment:"Good"};
  if(score>=50)return {grade:"D",comment:"Satisfactory"};
  if(score>=40)return {grade:"E",comment:"Basic pass"};
  if(score>=30)return {grade:"F",comment:"Below pass standard"};
  return {grade:"U",comment:"Ungraded"};
}
