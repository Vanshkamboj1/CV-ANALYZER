import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FeedbackModal from "../components/FeedbackModal";
import { fetchJobMatches, type MatchScore } from "@/api/matches";
import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/store/useStore";

export default function MatchesView() {
  const { id } = useParams(); // jobId
  const navigate = useNavigate();
  const { hrId, isAuthenticated } = useAuthStore();
  const { jobs } = useStore();

  const [jobTitle, setJobTitle] = useState<string>("");
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MatchScore | null>(null);

  //  Find job name from job list
  useEffect(() => {
    const currentJob = jobs.find((j) => String(j.id) === id);
    setJobTitle(currentJob?.title || "Job Details");
  }, [id, jobs]);

  //  Fetch matches from backend
  const loadMatches = async () => {
    if (!isAuthenticated || !hrId) {
      setError("Session expired — please sign in again.");
      return;
    }

    try {
      setLoading(true);
      const data = await fetchJobMatches(Number(id));
      setMatches(data);
    } catch (err: any) {
      console.error("Failed to load matches:", err);
      setError(err.message || "Unable to load match results.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadMatches();
  }, [id, hrId, isAuthenticated]);

  if (loading) return <div className="p-6">Loading match scores...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      {/*  Job title header */}
      <h2 className="text-2xl font-bold mb-6 text-indigo-600">
        {jobTitle} — Resume Matches
      </h2>

      {matches.length === 0 ? (
        <p>No resumes found for this job.</p>
      ) : (
        <div className="grid gap-3">
          {matches.map((m) => (
            <div
              key={m.resumeId}
              className={`p-4 border rounded-2xl flex justify-between items-center bg-white hover:shadow-md transition-all ${
                m.feedbackStatus === "ACCEPTED" ? "border-green-300 bg-green-50/30" : 
                m.feedbackStatus === "REJECTED" ? "border-red-300 bg-red-50/30" : ""
              }`}
            >
              <div>
                <div className="font-medium flex items-center gap-2">
                  {m.fileName}
                  {m.feedbackStatus === "ACCEPTED" && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-lg">Accepted</span>
                  )}
                  {m.feedbackStatus === "REJECTED" && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg">Rejected</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {m.matchedSkillsCount}/{m.totalJobSkills} skills matched
                </div>
                {m.feedbackText && (
                  <div className="text-xs text-gray-500 mt-2 italic truncate max-w-sm">
                    Feedback: "{m.feedbackText}"
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-40">
                  <div className="text-sm mb-1">Match: {m.matchScore}%</div>
                  <div className="h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      style={{ width: `${m.matchScore}%` }}
                      className={`h-full rounded ${
                        m.matchScore >= 75
                          ? "bg-green-500"
                          : m.matchScore >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                  </div>
                </div>

                {/*  View Resume Button */}
                <button
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-200"
                  onClick={() => navigate(`/resume/${m.resumeId}`)}
                >
                  View Resume
                </button>

                {/*  Add Feedback Button */}
                <button
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700"
                  onClick={() => {
                    setSelected(m);
                    setOpen(true);
                  }}
                >
                  {m.feedbackStatus !== "PENDING" && m.feedbackStatus ? "Edit Feedback" : "Add Feedback"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FeedbackModal
        open={open}
        onClose={() => setOpen(false)}
        candidate={selected}
        jobId={Number(id)}
        onSuccess={() => loadMatches()}
      />
    </div>
  );
}
