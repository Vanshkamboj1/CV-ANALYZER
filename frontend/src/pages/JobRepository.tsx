import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function JobRepository() {
  const { jobs, fetchJobs, deleteJob, editJob } = useStore();
  const { hrId, isAuthenticated } = useAuthStore();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);
  const [editJobData, setEditJobData] = useState<any>(null);
  const navigate = useNavigate();

  //Load jobs only if authenticated & HR ID is available
  useEffect(() => {
    if (!isAuthenticated || !hrId) {
      toast.error("Session expired — please sign in again.", { id: "session-expired" });
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
                <button 
                  onClick={() => setEditJobData(job)}
                  className="bg-pink-100 text-pink-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-pink-200 transition">
                  Edit
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(job.id)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Job Posting?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. All candidate matches and data for this job will be definitively lost.
            </p>
            <div className="flex justify-end gap-3 flex-wrap">
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                onClick={() => {
                  deleteJob(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editJobData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-lg w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Job Posting</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={editJobData.title}
                  onChange={(e) => setEditJobData({ ...editJobData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editJobData.description}
                  onChange={(e) => setEditJobData({ ...editJobData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={Array.isArray(editJobData.skills) ? editJobData.skills.join(", ") : editJobData.skills}
                  onChange={(e) => setEditJobData({ ...editJobData, skills: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                onClick={() => setEditJobData(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                onClick={async () => {
                   await editJob(editJobData.id, {
                     jobTitle: editJobData.title,
                     jobDescription: editJobData.description,
                     skills: typeof editJobData.skills === "string" 
                       ? editJobData.skills.split(",").map((s: string) => s.trim()) 
                       : editJobData.skills
                   });
                   setEditJobData(null);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
