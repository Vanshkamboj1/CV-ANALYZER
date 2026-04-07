import { create } from "zustand";
import * as mock from "../api/mock";
import * as jobsApi from "../api/jobs";
import * as resumesApi from "../api/resumes";
import type { Job, Resume } from "@/types";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import client from "../api/client";

type State = {
  resumes: Resume[];
  jobs: Job[];
  loading: boolean;
  totalResumes: number;
  analyzedResumes: number;
  pendingResumes: number;
  fetchResumes: () => Promise<void>;
  fetchJobs: (hrId?: number) => Promise<void>;
  deleteResume: (id: string | number) => Promise<void>;
  deleteJob: (id: string | number) => Promise<void>;
  editJob: (id: string | number, payload: any) => Promise<void>;
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
        toast.error("Session expired — please sign in again.", { id: "session-expired" });
        set({ loading: false });
        return;
      }

      // call backend API (hrId required)
      let jobs = await jobsApi.fetchJobs(id);

      set({ jobs: jobs || [], loading: false });
    } catch (error) {
      console.error(" fetchJobs error:", error);
      toast.error("Failed to load job postings.");
      set({ loading: false });
    }
  },

  deleteResume: async (id) => {
    try {
      await client.delete(`/upload/${id}`);
      set((state) => {
        const removed = state.resumes.filter((r) => String(r.id) !== String(id));
        return { resumes: removed };
      });
      toast.success("Resume deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete resume");
    }
  },

  deleteJob: async (id) => {
    try {
      await client.delete(`/jobs/${id}`);
      set((state) => {
        const removed = state.jobs.filter((j) => String(j.id) !== String(id));
        return { jobs: removed };
      });
      toast.success("Job deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete job");
    }
  },

  editJob: async (id, payload) => {
    try {
      await jobsApi.updateJob(id, payload);
      set((state) => ({
        jobs: state.jobs.map((j) => {
          if (String(j.id) === String(id)) {
            return {
              ...j,
              title: payload.jobTitle || j.title,
              description: payload.jobDescription || j.description,
              skills: Array.isArray(payload.skills)
                ? payload.skills
                : typeof payload.skills === 'string'
                ? payload.skills.split(',').map((s: string) => s.trim())
                : j.skills,
            };
          }
          return j;
        }),
      }));
    } catch (error) {
      console.error("Failed to update job in store:", error);
    }
  },
}));
