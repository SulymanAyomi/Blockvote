import { readFile } from "fs/promises";
import path from "path";
import type { StudentRecord } from "./types";

// MVP stand-in for a real registrar DB call.
// Swap the body of getStudentRecord() for a real query later —
// the return shape (StudentRecord | null) is the only contract that matters.

let cache: StudentRecord[] | null = null;

async function loadStudents(): Promise<StudentRecord[]> {
  if (cache) return cache;
  const filePath = path.join(process.cwd(), "src", "lib", "students.json");
  console.log(filePath)
  const raw = await readFile(filePath, "utf-8");
  cache = JSON.parse(raw) as StudentRecord[];
  return cache;
}

export async function getStudentRecord(studentId: string): Promise<StudentRecord | null> {
  const students = await loadStudents();
  const record = students.find((s) => s.studentId === studentId.trim());
  return record ?? null;
}
