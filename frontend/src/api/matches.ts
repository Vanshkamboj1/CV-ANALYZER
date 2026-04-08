import client from "./client";
import toast from "react-hot-toast";

export interface MatchScore {
  resumeId: number;
  fileName: string;
  matchScore: number;
  matchedSkillsCount: number;
  totalJobSkills: number;
  feedbackText?: string;
  feedbackStatus?: string;
}

export async function saveFeedback(jobId: number, resumeId: number, text: string, status: string) {
  const { data } = await client.post(`/jobs/${jobId}/resumes/${resumeId}/feedback`, {
    feedbackText: text,
    status
  });
  return data;
}

/**
 * Fetch all resume match scores for a specific job.
 */
export async function fetchJobMatches(jobId: number): Promise<MatchScore[]> {
  try {
    const { data } = await client.get(`/jobs/${jobId}/matches`);

    const list = Array.isArray(data)
      ? data
      : Array.isArray(data.matches)
      ? data.matches
      : Array.isArray(data.data)
      ? data.data
      : [];

    return list;
  } catch (err: any) {
    console.error("fetchJobMatches error:", err);
    toast.error("Failed to fetch match results.");
    return [];
  }
}
