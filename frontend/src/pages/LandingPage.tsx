import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore"; // Zustand global store

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Auth verified, ready for dashboard actions");
    }
  }, [isAuthenticated]);

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to continue");
      navigate("/signin");
      return;
    }
    navigate("/uploadresume");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 text-gray-900">
      {/* ---------- HERO SECTION ---------- */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6 bg-gradient-to-b from-blue-100 to-white">
        <motion.h1
          className="text-5xl font-bold mb-4 text-blue-900"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Dynamic CV Analyzer for HRs
        </motion.h1>

        <motion.p
          className="text-lg text-gray-600 max-w-2xl mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Empower your recruitment process with AI. Instantly analyze resumes,
          extract key details, and make data-driven hiring decisions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 items-center"
        >
          <Button
            onClick={handleGetStarted}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started"}
          </Button>

          <Link
            to="/jobs"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Browse Jobs
          </Link>
        </motion.div>
      </section>

      {/* ---------- ABOUT SECTION ---------- */}
      <section className="py-24 px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold mb-4 text-blue-700">
            About the Platform
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Designed for modern HR teams, our AI system automatically extracts
            candidate details — education, skills, experience, and achievements
            — providing quick insights and reducing manual screening time by
            70%.
          </p>
        </motion.div>
      </section>

      {/* ---------- FEATURES GRID ---------- */}
      <section className="py-24 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-center text-blue-700 mb-12"
          >
            Key Features
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "AI Resume Analysis",
                desc: "Automatically extract skills, education, and experience from PDFs.",
              },
              {
                title: "Job Match Insights",
                desc: "Match candidates with open positions based on key qualifications.",
              },
              {
                title: "Dashboard Overview",
                desc: "Monitor uploads, analysis results, and candidate statuses in one view.",
              },
              {
                title: "Real-Time Status",
                desc: "Track resume uploads from Pending → Analyzed → Failed.",
              },
              {
                title: "Data Security",
                desc: "All uploads and analyses are securely processed and stored.",
              },
              {
                title: "HR Collaboration",
                desc: "Share analyzed resumes with your recruitment team easily.",
              },
            ].map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold text-blue-700 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- DEMO ---------- */}
      <section className="py-20 bg-blue-50 px-10">
        <h2 className="text-3xl font-semibold text-center mb-10 text-gray-800">
          See it in Action
        </h2>
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl overflow-hidden">
          <img
            src="/demo-preview.png"
            alt="Dashboard Preview"
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* ---------- WORKFLOW SECTION ---------- */}
      <section className="py-24 px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold text-blue-700 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Upload Resume",
                desc: "Upload PDF files directly from your device.",
              },
              {
                step: "2",
                title: "AI Analysis",
                desc: "The AI extracts structured information in seconds.",
              },
              {
                step: "3",
                title: "Review Results",
                desc: "See extracted data, experience, and skills neatly organized.",
              },
              {
                step: "4",
                title: "Job Match",
                desc: "Compare resumes against job requirements instantly.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm"
              >
                <div className="text-4xl font-extrabold text-blue-600 mb-3">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="py-24 px-6 bg-blue-50">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold text-blue-700 mb-12">
            What HRs Say
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "HR Lead, TechNova",
                quote:
                  "Our screening time reduced drastically! The AI’s accuracy is impressive.",
              },
              {
                name: "Amit Verma",
                role: "Talent Head, Cloudify",
                quote:
                  "Finally, a tool that understands HR pain points. Highly recommended!",
              },
              {
                name: "Neha Patel",
                role: "Recruiter, InnovateX",
                quote:
                  "I love the interface — smooth, quick, and reliable. Perfect for fast hiring cycles.",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl shadow p-6 text-left"
              >
                <p className="text-gray-600 italic mb-4">“{t.quote}”</p>
                <h4 className="font-semibold text-blue-700">{t.name}</h4>
                <p className="text-sm text-gray-500">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="mt-20 py-6 text-center text-gray-500 border-t">
        © {new Date().getFullYear()} Resume Analyzer. All rights reserved.
      </footer>
    </div>
  );
}
