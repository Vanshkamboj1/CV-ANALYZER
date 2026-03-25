import client from "./client";
import type { Job } from "@/types";
import toast from "react-hot-toast";

interface JobApiResponse {
  id?: string | number;
  jobTitle?: string;
  jobDescription?: string;
  skills?: string[] | string;
  postedOn?: string;
  createdAt?: string;
  [key: string]: any;
}

async function mapRemoteToJob(raw: JobApiResponse): Promise<Job> {
  return {
    id: String(raw.id ?? raw._id ?? raw.jobId ?? raw.job_id ?? ""),
    title: raw.jobTitle ?? raw.title ?? raw.name ?? "",
    description: raw.jobDescription ?? raw.description ?? "",
    skills:
      typeof raw.skills === "string"
        ? raw.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : Array.isArray(raw.skills)
        ? raw.skills
        : [],
    postedOn:
      raw.postedOn ??
      raw.createdAt ??
      raw.posted_on ??
      new Date().toISOString().slice(0, 10),
  };
}

// accept hrId and hit correct backend route
export async function fetchJobs(hrId: number): Promise<Job[]> {
  try {
    const { data } = await client.get(`/jobs/hr/${hrId}`);

    const list = Array.isArray(data)
      ? data
      : Array.isArray(data.jobs)
      ? data.jobs
      : Array.isArray(data.data)
      ? data.data
      : [];

    return await Promise.all(list.map(mapRemoteToJob));
  } catch (err: any) {
    console.error("fetchJobs error:", err);
    toast.error(
      err?.response?.data?.message || "Failed to load job postings."
    );
    return [];
  }
}

export async function saveJob(payload: any) {
  try {
    const { data } = await client.post("/jobs/create", payload);
    toast.success("Job created successfully!");
    return data;
  } catch (err) {
    toast.error("Failed to create job");
    console.error("saveJob error:", err);
    throw err;
  }
}

export default { fetchJobs, saveJob };
