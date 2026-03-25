import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";

const ResumeList: React.FC = () => {
  const navigate = useNavigate();
  const { resumes, loading, fetchResumes } = useStore();

  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-center text-indigo-600">
            Resume List
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchResumes}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {loading && <div className="text-center py-4">Loading...</div>}

            {!loading && resumes.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-3">
                  No resumes uploaded yet.
                </p>
                <Button onClick={() => navigate("/uploadresume")}>
                  Upload Resume
                </Button>
              </div>
            )}

            {resumes
              .filter((r) => ((r.status ?? "") as string).toLowerCase() !== "failed")
              .map((r) => {
                const id = String(r.id ?? "");
                const fileName = (r.name ?? "Unknown").replace(/\.pdf$/i, "");
                const uploadedAt = (r.uploadedAt ?? "").toString().slice(0, 10);
                const status = (r.status as string) ?? "Pending";

                return (
                  <div
                    key={id}
                    className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/30 transition-all"
                  >
                    <div>
                      <h3 className="font-medium">{fileName}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded: {uploadedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          status.toLowerCase() === "analyzed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/resume/${id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ResumeList;
