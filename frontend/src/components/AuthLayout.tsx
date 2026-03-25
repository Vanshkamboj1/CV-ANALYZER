import { motion } from "framer-motion";
import { useEffect } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  useEffect(() => {
    document.title = `${title} | CV Analyzer`;
  }, [title]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <motion.main
        role="main"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        <h1 className="text-3xl font-semibold text-gray-800 text-center">{title}</h1>
        <p className="text-gray-500 text-center mt-1 mb-6">{subtitle}</p>
        {children}
      </motion.main>
    </div>
  );
}
