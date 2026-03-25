import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, Tag, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import client from "../api/client";
import { useAuthStore } from "@/store/authStore"; // ✅ new import

interface JobPayload {
  hrUserId: number;
  jobTitle: string;
  jobDescription: string;
  skills: string;
  status: string;
}

export default function JobUpload() {
  const [formData, setFormData] = useState<JobPayload>({
    hrUserId: 0, // will be overwritten
    jobTitle: "",
    jobDescription: "",
    skills: "",
    status: "Open",
  });

  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { hrId, isAuthenticated } = useAuthStore(); // ✅ read from Zustand

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess(false);
  };

  const validateForm = (): boolean => {
    if (!formData.jobTitle.trim()) {
      setError("Job title is required");
      return false;
    }
    if (!formData.jobDescription.trim()) {
      setError("Job description is required");
      return false;
    }
    if (!formData.skills.trim()) {
      setError("Skills are required");
      return false;
    }
    if (formData.jobDescription.length < 20) {
      setError("Job description must be at least 20 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!isAuthenticated || !hrId) {
      toast.error("Session expired — please sign in again.");
      setError("Authentication required");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess(false);

    try {
      const payload = { ...formData, hrUserId: hrId };
      const response = await client.post("/jobs/create", payload);

      console.log("✅ Job created successfully:", response.data);
      toast.success("Job posted successfully!");
      setSuccess(true);

      setTimeout(() => {
        setFormData({
          hrUserId: hrId,
          jobTitle: "",
          jobDescription: "",
          skills: "",
          status: "Open",
        });
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("❌ Upload failed:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create job. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen  ">
      <div className="max-w-2xl mx-auto bg-white shadow-sm rounded-2xl border border-gray-100 p-8 transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-full mb-4">
            <Briefcase className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Post a New Job
          </h1>
          <p className="text-gray-500 text-sm">
            Create and publish a new job opening instantly
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-lg border border-green-200 bg-green-50 text-green-700">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Job posted successfully!</p>
              <p className="text-sm text-green-600">
                The form will reset in a moment...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Job Title */}
          <div>
            <label
              htmlFor="jobTitle"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1"
            >
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Job Title
            </label>
            <input
              id="jobTitle"
              name="jobTitle"
              type="text"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="e.g., Senior Backend Developer"
              disabled={uploading}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              maxLength={100}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {formData.jobTitle.length}/100
            </p>
          </div>

          {/* Skills */}
          <div>
            <label
              htmlFor="skills"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1"
            >
              <Tag className="w-4 h-4 text-indigo-600" />
              Required Skills
            </label>
            <input
              id="skills"
              name="skills"
              type="text"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., React, Spring Boot, PostgreSQL"
              disabled={uploading}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {formData.skills.length}/200
            </p>
          </div>

          {/* Job Description */}
          <div>
            <label
              htmlFor="jobDescription"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              Job Description
            </label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="Describe the responsibilities, requirements, and what makes this role exciting..."
              disabled={uploading}
              rows={7}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed resize-y"
              maxLength={2000}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Minimum 20 characters</span>
              <span>{formData.jobDescription.length}/2000</span>
            </div>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="text-sm font-semibold text-gray-700 mb-1 block"
            >
              Job Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={uploading}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={uploading || success}
            className="w-full py-4 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Job Post...
              </span>
            ) : success ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Job Posted Successfully!
              </span>
            ) : (
              "Post Job Opening"
            )}
          </Button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-700">
          <strong>Note:</strong> All fields are required. Make your job
          description clear and engaging to attract top candidates.
        </div>
      </div>
    </div>
  );
}
