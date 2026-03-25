import  { useState } from "react";

export default function FeedbackModal({ open, onClose, candidate }: { open:boolean, onClose:()=>void, candidate:any }) {
  const [text, setText] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="bg-white p-6 rounded shadow z-10 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-2">Add feedback — {candidate?.name}</h3>
        <label htmlFor="candidate-feedback" className="block text-sm font-medium mb-1">Feedback for {candidate?.name}</label>
        <textarea
          id="candidate-feedback"
          className="w-full p-3 border rounded mb-3"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          title={`Feedback for ${candidate?.name}`}
          placeholder="Write your feedback here..."
        />
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { /* persist feedback to backend */ alert("Saved feedback"); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}
