"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {readPhotoFile} from "@/lib/photo";
import CurriculumGradeFields from "@/components/CurriculumGradeFields";

export default function EditStudentForm({ student }: { student: any }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSaving(true);
    setMsg("");
    const data: Record<string, any> = Object.fromEntries(new FormData(form));
    const file = data.photo as File | undefined;
    delete data.photo;
    if (file && file.size > 0) {
      try {
        data.photoUrl = await readPhotoFile(file);
      } catch (err: any) {
        setMsg(err.message);
        setSaving(false);
        return;
      }
    }
    data.active = (form.elements.namedItem("active") as HTMLInputElement).checked;
    const r = await fetch(`/api/students/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      router.push("/students");
      router.refresh();
    } else {
      setMsg(j.error || "Could not save changes.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        {student.photoUrl && (
          <div className="field">
            <label>Current photo</label>
            <img src={student.photoUrl} alt="" width={96} height={96} style={{ borderRadius: 12, objectFit: "cover" }} />
          </div>
        )}
        <div className="field"><label>Admission number</label><input value={student.admissionNo} readOnly /></div>
        <div className="field"><label>First name</label><input name="firstName" defaultValue={student.firstName} required /></div>
        <div className="field"><label>Last name</label><input name="lastName" defaultValue={student.lastName} required /></div>
        <div className="field"><label>Date of birth</label><input name="dateOfBirth" type="date" defaultValue={student.dateOfBirth} /></div>
        <CurriculumGradeFields curriculum={student.curriculum} grade={student.grade} />
        <div className="field"><label>Stream</label><input name="stream" defaultValue={student.stream} /></div>
        <div className="field"><label>Parent / guardian name</label><input name="guardianName" defaultValue={student.guardianName} /></div>
        <div className="field"><label>Guardian phone</label><input name="guardianPhone" type="tel" defaultValue={student.guardianPhone} /></div>
        <div className="field"><label>Guardian email</label><input name="guardianEmail" type="email" defaultValue={student.guardianEmail} /></div>
        <div className="field"><label>Replace photo (optional)</label><input name="photo" type="file" accept="image/*" /></div>
        <div className="field">
          <label>
            <input name="active" type="checkbox" defaultChecked={student.active} /> Active student
          </label>
        </div>
      </div>
      <div className="actions">
        <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        <a className="btn" href="/students">Cancel</a>
      </div>
      {msg && <p className="sub">{msg}</p>}
    </form>
  );
}
