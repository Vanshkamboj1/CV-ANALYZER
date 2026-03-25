import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import toast from "react-hot-toast";
import { getHrIdFromToken } from "@/lib/auth";
import { motion } from "framer-motion";

export const Hero = () => {
  const {
    totalResumes,
    analyzedResumes,
    pendingResumes,
    fetchResumes,
    loading,
  } = useStore();

  useEffect(() => {
    const load = async () => {
      const hrId = getHrIdFromToken();
      if (!hrId) {
        toast.error("Session expired — please sign in again.");
        return;
      }

      try {
        await fetchResumes();
      } catch (err: any) {
        console.error("❌ Failed to fetch resumes:", err);
        toast.error(
          err?.response?.data?.message || "Unable to fetch resume stats."
        );
      }
    };
    load();
  }, [fetchResumes]);

  const cards = [
    { title: "Total Resumes", value: totalResumes ?? 0, icon: "📄" },
    { title: "Analyzed Resumes", value: analyzedResumes ?? 0, icon: "✅" },
    { title: "Pending Resumes", value: pendingResumes ?? 0, icon: "⏳" },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold text-indigo-500">
          CV Analyzer Dashboard
        </h2>
        <p className="text-slate-700 mt-3">
          Manage and analyze candidate resumes with{" "}
          <span className="text-indigo-500 font-semibold">AI-powered</span>{" "}
          extraction
        </p>
      </div>

      {/* Metrics Section */}
      <div className="flex flex-wrap gap-4 mt-12 w-full items-center">
        {loading ? (
          <div className="text-sm text-gray-500 animate-pulse">
            Loading metrics...
          </div>
        ) : (
          cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex bg-white h-28 w-72 rounded-xl p-5 justify-between items-center border-l-4 border-indigo-400 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex flex-col items-start gap-2 text-slate-900">
                <div className="font-semibold text-lg">{card.title}</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {card.value}
                </div>
              </div>
              <div className="text-3xl">{card.icon}</div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
