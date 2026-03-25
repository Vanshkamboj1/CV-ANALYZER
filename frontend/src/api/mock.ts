import type { Job, Resume } from "@/types";


const resumes: Resume[] = [ /* use the extended array you have */ ];

const jobs: Job[] = [
  {
    id: "job-1",
    title: "AI Engineer",
    description: "Build ML systems",
    skills: ["Python", "TensorFlow", "ML"],
    postedOn: "2025-10-10",
  },
  // add more...
];

export async function fetchResumes() {
  await new Promise(r => setTimeout(r, 300));
  return resumes;
}

export async function fetchResumeById(id: number) {
  await new Promise(r => setTimeout(r, 300));
  return resumes.find(r => r.id === id);
}

export async function fetchJobs() {
  await new Promise(r => setTimeout(r, 300));
  return jobs;
}

export async function saveJob(job: Job) {
  await new Promise(r => setTimeout(r, 300));
  jobs.push(job);
  return job;
}
