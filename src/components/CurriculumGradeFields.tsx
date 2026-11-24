"use client";
import {useState} from "react";
import {CURRICULUM_OPTIONS, gradesFor} from "@/lib/grades";

type Props = { curriculum?: string; grade?: string };

export default function CurriculumGradeFields({ curriculum: startCurriculum = "", grade: startGrade = "" }: Props) {
  const [curriculum, setCurriculum] = useState(startCurriculum);
  const [grade, setGrade] = useState(startGrade);
  const levels = gradesFor(curriculum);
  // Older records may hold a grade that isn't in the list. Keep it visible so it isn't lost silently.
  const showOldGrade = grade !== "" && !levels.includes(grade);

  return (
    <>
      <div className="field">
        <label>Curriculum</label>
        <select name="curriculum" required value={curriculum}
          onChange={(e) => { setCurriculum(e.target.value); setGrade(""); }}>
          <option value="">Select curriculum</option>
          {CURRICULUM_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Grade / Level</label>
        <select name="grade" required value={grade} disabled={!curriculum}
          onChange={(e) => setGrade(e.target.value)}>
          <option value="">{curriculum ? "Select level" : "Choose curriculum first"}</option>
          {showOldGrade && <option value={grade}>{grade} (old value, please choose from the list)</option>}
          {levels.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
    </>
  );
}
