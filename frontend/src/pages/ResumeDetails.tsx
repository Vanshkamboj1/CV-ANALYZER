import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import client from "../api/client";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore"; // Zustand auth store

interface ResumeData {
  id?: number;
  aiJson?: string;
  status?: string;
  createdAt?: string;
  personalDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  skills?: {
    languages?: string[];
    frameworksLibraries?: string[];
    tools?: string[];
  };
  education?: {
    degree?: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }[];
  internships?: {
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string[];
  }[];
  projects?: {
    title?: string;
    description?: string[];
  }[];
  achievements?: string[];
  summary?: string;
}

export default function ResumeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, hrId } = useAuthStore(); // Auth info from store
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      if (!id) return;

      if (!isAuthenticated || !hrId) {
        toast.error("Session expired — please sign in again.");
        navigate("/signin");
        return;
      }

      try {
        const res = await client.get(`/upload/${id}`);
        const data = res.data;

        // Parse AI JSON safely
        let parsedJson = {};
        try {
          parsedJson = data.aiJson ? JSON.parse(data.aiJson) : {};
        } catch {
          console.warn(" Invalid AI JSON structure in response");
        }

        setResume({ ...data, ...parsedJson });
      } catch (err: any) {
        console.error(" Failed to fetch resume:", err);
        const status = err.response?.status;
        if (status === 401) {
          toast.error("Session expired — please log in again.");
          navigate("/signin");
        } else if (status === 404) {
          toast.error("Resume not found.");
        } else {
          toast.error("Failed to fetch resume details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id, isAuthenticated, hrId, navigate]);

  if (loading) {
    return (
      <div className="p-6 text-gray-600 flex justify-center items-center min-h-[50vh]">
        Loading resume details...
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="p-6 text-red-500 font-medium text-center">
        Resume not found or inaccessible.
      </div>
    );
  }

  const {
    personalDetails,
    skills,
    education,
    internships,
    projects,
    achievements,
    summary,
    status,
    createdAt,
  } = resume;

  const topEducation = education?.[0];
  const topInternship = internships?.[0];
  const topProject = projects?.[0];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {personalDetails?.name || "Unnamed Candidate"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {personalDetails?.email} • {personalDetails?.phone}
          </p>
          <p className="text-sm text-muted-foreground">
            {personalDetails?.location}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Badge variant={status === "Analyzed" ? "default" : "secondary"}>
            {status || "Pending"}
          </Badge>
          <div className="text-xs text-muted-foreground">
            Uploaded:{" "}
            {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Card className="mb-4">
          <CardContent>
            <h3 className="font-semibold mb-1">Summary</h3>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {skills && (
        <Card className="mb-4">
          <CardContent>
            <h3 className="font-semibold mb-1">Key Skills</h3>
            <div className="text-sm text-muted-foreground">
              <strong>Languages:</strong>{" "}
              {skills.languages?.slice(0, 3).join(", ") || "—"}
              <br />
              <strong>Frameworks:</strong>{" "}
              {skills.frameworksLibraries?.slice(0, 3).join(", ") || "—"}
              <br />
              <strong>Tools:</strong>{" "}
              {skills.tools?.slice(0, 3).join(", ") || "—"}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {topEducation && (
        <Card className="mb-4">
          <CardContent>
            <h3 className="font-semibold mb-1">Education</h3>
            <div className="text-sm text-muted-foreground">
              <div className="font-medium">{topEducation.degree}</div>
              <div>
                {topEducation.institution} ({topEducation.startDate} -{" "}
                {topEducation.endDate})
              </div>
              {topEducation.gpa && <div>CGPA: {topEducation.gpa}</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Internship */}
      {topInternship && (
        <Card className="mb-4">
          <CardContent>
            <h3 className="font-semibold mb-1">Internship</h3>
            <div className="text-sm text-muted-foreground">
              <div className="font-medium">
                {topInternship.title} — {topInternship.company}
              </div>
              <div>
                {topInternship.location} ({topInternship.startDate} -{" "}
                {topInternship.endDate})
              </div>
              <ul className="list-disc pl-5 mt-1">
                {topInternship.description?.slice(0, 2).map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project */}
      {topProject && (
        <Card className="mb-4">
          <CardContent>
            <h3 className="font-semibold mb-1">Highlighted Project</h3>
            <div className="text-sm text-muted-foreground">
              <div className="font-medium">{topProject.title}</div>
              <ul className="list-disc pl-5 mt-1">
                {topProject.description?.slice(0, 2).map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <Card className="mb-4">
          <CardContent>
            <h3 className="font-semibold mb-1">Achievements</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {achievements.slice(0, 3).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button
          onClick={() => {
            const blob = new Blob([JSON.stringify(resume, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${resume.personalDetails?.name || "resume"}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download JSON
        </Button>

        <Button variant="ghost" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    </div>
  );
}
