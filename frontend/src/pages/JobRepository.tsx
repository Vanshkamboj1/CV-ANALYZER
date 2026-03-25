import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function JobRepository() {
  const { jobs, fetchJobs } = useStore();
  const { hrId, isAuthenticated } = useAuthStore();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  //Load jobs only if authenticated & HR ID is available
  useEffect(() => {
    if (!isAuthenticated || !hrId) {
      toast.error("Session expired — please sign in again.");
      navigate("/signin");
      return;
    }

    const loadJobs = async () => {
      setLoading(true);
      try {
        await fetchJobs(); // load jobs from store action (no args expected)
        toast.success("Jobs loaded successfully");
      } catch (err: any) {
        console.error("❌ Failed to fetch jobs:", err);
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load jobs. Please try again.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [fetchJobs, hrId, isAuthenticated, navigate]);

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(q.toLowerCase()) ||
      j.skills.join(" ").toLowerCase().includes(q.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-500" />
        <p className="text-sm">Loading job listings...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-3xl font-bold text-indigo-500">Job Repository</h2>
        <input
          placeholder="Search title or skills..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border border-indigo-300 rounded-xl px-4 py-2 w-80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          {jobs.length === 0
            ? "No jobs found. Try posting one!"
            : "No matching jobs for your search."}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="p-4 border rounded-2xl flex justify-between items-center bg-white hover:shadow-md transition-all"
            >
              <div>
                <div className="font-medium text-lg">{job.title}</div>
                <div className="text-sm text-muted-foreground">
                  {job.skills.join(", ")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Posted on: {job.postedOn}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/job/${job.id}/matches`)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition"
                >
                  View Matches
                </button>
                <button className="bg-pink-100 text-pink-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-pink-200 transition">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
