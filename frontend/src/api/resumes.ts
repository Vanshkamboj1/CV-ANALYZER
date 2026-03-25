import client from "./client";
import type { Resume } from "@/types";
import toast from "react-hot-toast";
import { getHrIdFromToken } from "@/lib/auth";

interface ResumeApiResponse {
  id?: number | string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  position?: string;
  status?: string;
  uploadedAt?: string;
  createdAt?: string;
  skills?: string[] | string;
  education?: string;
  experience?: string;
  projects?: string;
  [key: string]: any;
}

async function mapRemote(raw: ResumeApiResponse): Promise<Resume> {
  return {
    id: Number(raw.id ?? raw._id ?? raw.resumeId ?? 0),
    name: raw.name ?? raw.fileName ?? raw.filename ?? "",
    email: raw.email ?? "",
    phone: raw.phone ?? undefined,
    location: raw.location ?? undefined,
    position: raw.position ?? undefined,
    status: (raw.status as any) ?? "Pending",
    uploadedAt:
      raw.uploadedAt ??
      raw.uploaded_at ??
      raw.createdAt ??
      new Date().toISOString(),
    skills: raw.skills ?? undefined,
    education: raw.education ?? undefined,
    experience: raw.experience ?? undefined,
    projects: raw.projects ?? undefined,
  } as Resume;
}

export async function fetchResumes(): Promise<Resume[]> {
  try {
    const hrId = getHrIdFromToken();
    if (!hrId) {
      toast.error("Session expired — please log in again.");
      return [];
    }

    const { data } = await client.get(`/upload/hr/${hrId}`);

    const list = Array.isArray(data)
      ? data
      : Array.isArray(data.resumes)
      ? data.resumes
      : Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.files)
      ? data.files
      : [];

    return await Promise.all(list.map(mapRemote));
  } catch (err) {
    console.error("fetchResumes error:", err);
    toast.error("Failed to fetch resumes");
    return [];
  }
}

export async function uploadResume(file: File) {
  const hrId = getHrIdFromToken();
  if (!hrId) {
    toast.error("Session expired — please log in again.");
    throw new Error("Invalid or expired token");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const { data } = await client.post(`/upload/resume/${hrId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Resume uploaded successfully!");
    return data;
  } catch (err) {
    console.error("uploadResume error:", err);
    toast.error("Failed to upload resume");
    throw err;
  }
}

export default { fetchResumes, uploadResume };
