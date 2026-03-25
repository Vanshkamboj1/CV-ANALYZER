import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import client from "../api/client";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore"; 

export default function UploadResume() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  // const [responseText, setResponseText] = useState("");

  const { hrId, isAuthenticated } = useAuthStore(); 

  //  Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file.");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

 const handleUpload = async () => {
  if (!file) {
    toast.error("Please select a PDF first.");
    return;
  }

  if (!isAuthenticated || !hrId) {
    toast.error("Session expired — please sign in again.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("hrUserId", hrId.toString()); // ✅ backend expects this

  setUploading(true);
  setProgress(0);
  // setResponseText("");

  // Simulated progress (~20s to 90%)
  const totalDuration = 20000;
  const stepTime = 200;
  const steps = totalDuration / stepTime;
  const increment = 90 / steps;

  const fakeProgress = setInterval(() => {
    setProgress((prev) => {
      if (prev < 90) return Math.min(prev + increment, 90);
      return prev;
    });
  }, stepTime);

  try {
    const response = await client.post("/upload/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    clearInterval(fakeProgress);
    setProgress(100);

    toast.success("Resume uploaded & parsed successfully!");
    console.log("Backend response:", response.data);

    // setResponseText(JSON.stringify(response.data, null, 2));

    // 🧹 Reset file input smoothly after success
    setTimeout(() => {
      setFile(null);
      const input = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (input) input.value = "";
      setProgress(0);
      // setResponseText("");
    }, 2500);
  } catch (error: any) {
    clearInterval(fakeProgress);
    console.error(" Upload failed:", error);
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to upload resume. Please try again.";
    toast.error(msg);
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="space-y-5 bg-white p-6 rounded-2xl shadow-md relative overflow-hidden">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">
          Upload Resume PDF
        </h2>

        {/* File Input */}
        <label htmlFor="resumeFile" className="sr-only">
          Upload resume PDF
        </label>
        <input
          id="resumeFile"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          title="Choose a PDF resume to upload"
          aria-label="Upload resume PDF"
          className="w-full p-3 border border-indigo-300 rounded cursor-pointer hover:border-indigo-500 focus:outline-none"
        />

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-4">
            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-300 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Uploading... {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {uploading ? "Uploading..." : "Upload & Parse"}
        </Button>

        {/* {responseText && (
          <pre className="bg-gray-50 text-sm p-3 rounded-md overflow-auto mt-4 max-h-60">
            {responseText}
          </pre>
        )} */}
      </div>
    </div>
  );
}
