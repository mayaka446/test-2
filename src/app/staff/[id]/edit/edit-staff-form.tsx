"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {readPhotoFile} from "@/lib/photo";

export default function EditStaffForm({ staff }: { staff: any }) {
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
    const r = await fetch(`/api/staff/${staff.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      router.push("/staff");
      router.refresh();
    } else {
      setMsg(j.error || "Could not save changes.");
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete ${staff.name}? This cannot be undone.`)) return;
    setSaving(true);
    setMsg("");
    const r = await fetch(`/api/staff/${staff.id}`, { method: "DELETE" });
    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      router.push("/staff");
      router.refresh();
    } else {
      setMsg(j.error || "Could not delete.");
      setSaving(false);
    }
  }

  const fields: [string, string, string][] = [
    ["employeeNo", "Employee number", "text"],
    ["name", "Full name", "text"],
    ["email", "Email", "email"],
    ["phone", "Phone", "tel"],
    ["department", "Department", "text"],
    ["jobTitle", "Job title", "text"],
  ];

  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        {staff.photoUrl && (
          <div className="field">
            <label>Current photo</label>
            <img src={staff.photoUrl} alt="" width={96} height={96} style={{ borderRadius: "50%", objectFit: "cover" }} />
          </div>
        )}
        {fields.map(([n, l, t]) => (
          <div className="field" key={n}>
            <label>{l}</label>
            <input name={n} type={t} defaultValue={staff[n]} required={["employeeNo", "name", "email", "jobTitle"].includes(n)} />
          </div>
        ))}
        <div className="field"><label>Replace photo (optional)</label><input name="photo" type="file" accept="image/*" /></div>
      </div>
      <div className="actions">
        <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        <a className="btn" href="/staff">Cancel</a>
        <button type="button" className="btn" onClick={remove} disabled={saving} style={{ marginLeft: "auto" }}>
          Delete staff member
        </button>
      </div>
      {msg && <p className="sub">{msg}</p>}
    </form>
  );
}
