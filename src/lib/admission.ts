import { prisma } from "@/lib/prisma";

// Generates the next admission number for a school, e.g. "DEMO/2026/0001".
// The number is based on the school's slug and the current year, and
// increments from the highest number already issued for that school and year.
export async function generateAdmissionNo(schoolId: string | null, year: number = new Date().getFullYear()): Promise<string> {
  const school = schoolId
    ? await prisma.school.findUnique({ where: { id: schoolId }, select: { slug: true } })
    : null;
  const prefix = (school?.slug ?? "SCH").replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6) || "SCH";
  const pattern = `${prefix}/${year}/`;

  const existing = await prisma.student.findMany({
    where: { schoolId, admissionNo: { startsWith: pattern } },
    select: { admissionNo: true },
  });

  let highest = 0;
  for (const s of existing) {
    const n = parseInt(s.admissionNo.slice(pattern.length), 10);
    if (!Number.isNaN(n) && n > highest) highest = n;
  }

  return `${pattern}${String(highest + 1).padStart(4, "0")}`;
}
