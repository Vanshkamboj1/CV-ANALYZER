import { create } from "zustand";
import * as mock from "../api/mock";
import * as jobsApi from "../api/jobs";
import * as resumesApi from "../api/resumes";
import type { Job, Resume } from "@/types";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

type State = {
  resumes: Resume[];
  jobs: Job[];
  loading: boolean;
  totalResumes: number;
  analyzedResumes: number;
  pendingResumes: number;
  fetchResumes: () => Promise<void>;
  fetchJobs: (hrId?: number) => Promise<void>;
};

export const useStore = create<State>((set) => ({
  resumes: [],
  jobs: [],
  loading: false,
  totalResumes: 0,
  analyzedResumes: 0,
  pendingResumes: 0,

  fetchResumes: async () => {
    set({ loading: true });
    let r = await resumesApi.fetchResumes();
    if (!r || r.length === 0) {
      r = await mock.fetchResumes();
    }
    const analyzed = r.filter(
      (x) => (x.status ?? "").toLowerCase() === "analyzed"
    ).length;
    const pending = r.filter(
      (x) => (x.status ?? "").toLowerCase() === "pending"
    ).length;
    const total = analyzed + pending;

    set({
      resumes: r,
      totalResumes: total,
      analyzedResumes: analyzed,
      pendingResumes: pending,
      loading: false,
    });
  },

  fetchJobs: async (hrId?: number) => {
    set({ loading: true });
    try {
      const id = hrId ?? useAuthStore.getState().hrId;
      if (!id) {
        toast.error("Session expired — please sign in again.");
        set({ loading: false });
        return;
      }

      // call backend API (hrId required)
      let jobs = await jobsApi.fetchJobs(id);

      if (!jobs || jobs.length === 0) {
        jobs = await mock.fetchJobs();
      }

      set({ jobs, loading: false });
    } catch (error) {
      console.error(" fetchJobs error:", error);
      toast.error("Failed to load job postings.");
      set({ loading: false });
    }
  },
}));
