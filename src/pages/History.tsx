import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { History as HistoryIcon, Code2 } from "lucide-react";

export default function History() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate("/auth");
      } else {
        setUser(data.user);
        fetchProjects(data.user.id);
      }
    });
  }, [navigate]);

  const fetchProjects = async (userId: string) => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) {
      setProjects(data);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-8">
          History
        </h1>

        <Card className="p-8 bg-card/50 backdrop-blur border-border/50">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50 mb-6">
            <HistoryIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Your Projects</h2>
          </div>

          {projects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No projects yet</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Code2 className="w-5 h-5 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{project.project_name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
