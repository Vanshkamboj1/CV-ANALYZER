import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FeedbackModal from "../components/FeedbackModal";
import { fetchJobMatches, retryAIEvaluation, type MatchScore } from "@/api/matches";
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

  const handleRetryAI = async (resumeId: number) => {
    try {
      // Optimitically Update UI
      setMatches((prev) =>
        prev.map((m) =>
          m.resumeId === resumeId ? { ...m, aiScore: null, aiReasoning: null } : m
        )
      );
      // Trigger Backend
      await retryAIEvaluation(Number(id), resumeId);
      // Give backend 1s to save states then refetch (or just wait for user to refresh again)
      setTimeout(() => loadMatches(), 1500);
    } catch (err) {
      console.error("Retry failed:", err);
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
              <div className="flex-1 pr-6">
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
                  {m.matchedSkillsCount}/{m.totalJobSkills} skills matched (Keyword Match)
                </div>
                {m.feedbackText && (
                  <div className="text-xs text-gray-500 mt-2 italic truncate max-w-sm">
                    Feedback: "{m.feedbackText}"
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-sm">
                  <div className="font-semibold text-indigo-700 flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <div className="flex flex-wrap items-center gap-2">
                       ✨ AI Evaluation
                       {m.aiScore === -1 ? (
                         <span className="text-xs bg-red-100 px-2 py-0.5 rounded-full text-red-700 font-medium">
                           Service Busy
                         </span>
                       ) : m.aiScore !== undefined && m.aiScore !== null ? (
                         <span className="text-xs bg-indigo-200 px-2 py-0.5 rounded-full text-indigo-900">
                           {m.aiScore}% Deep Match
                         </span>
                       ) : (
                         <span className="text-xs bg-indigo-100/50 px-2 py-0.5 rounded-full text-indigo-600 animate-pulse">
                           Analyzing...
                         </span>
                       )}
                    </div>
                    {/* Refresh / Retry Button */}
                    <button
                      onClick={() => handleRetryAI(Number(m.resumeId))}
                      className="text-xs flex flex-row items-center gap-1.5 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md font-medium transition-colors shadow-sm"
                      title="Force a refresh of this resume's AI score"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 1 0 2.13-5.88L9 8"></path>
                      </svg>
                      {m.aiScore === -1 ? 'Retry AI' : 'Refresh'}
                    </button>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-xs">
                    {m.aiReasoning || "AI is currently deeply analyzing this candidate against the job's core requirements. Check back in a few seconds (or click Refresh)."}
                  </p>
                </div>
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
