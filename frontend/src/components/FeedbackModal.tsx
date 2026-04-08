import { useState, useEffect } from "react";
import { saveFeedback } from "../api/matches";
import toast from "react-hot-toast";

export default function FeedbackModal({ open, onClose, candidate, jobId, onSuccess }: { open: boolean, onClose: () => void, candidate: any, jobId: number, onSuccess: () => void }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && candidate) {
      setText(candidate.feedbackText || "");
      setStatus(candidate.feedbackStatus || "PENDING");
    }
  }, [open, candidate]);

  if (!open) return null;

  const handleSave = async () => {
    if (!jobId || !candidate?.resumeId) return;
    setLoading(true);
    try {
      await saveFeedback(jobId, candidate.resumeId, text, status);
      toast.success("Feedback saved successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white p-6 rounded-2xl shadow z-10 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Feedback — {candidate?.fileName}</h3>
        
        <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="status" 
              value="PENDING" 
              checked={status === "PENDING"} 
              onChange={(e) => setStatus(e.target.value)} 
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm">Pending</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="status" 
              value="ACCEPTED" 
              checked={status === "ACCEPTED"} 
              onChange={(e) => setStatus(e.target.value)} 
              className="text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-green-700 font-medium">Accept</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="status" 
              value="REJECTED" 
              checked={status === "REJECTED"} 
              onChange={(e) => setStatus(e.target.value)} 
              className="text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-red-700 font-medium">Reject</span>
          </label>
        </div>

        <label htmlFor="candidate-feedback" className="block text-sm font-medium mb-1 text-gray-700">Notes (Optional)</label>
        <textarea
          id="candidate-feedback"
          className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your feedback here..."
        />
        
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-70" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
