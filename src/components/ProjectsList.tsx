import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Project {
  id: string;
  project_name: string;
  description: string;
  language: string;
  platform: string;
  mc_version: string;
  created_at: string;
  files: any[];
  scripts: string[];
  metadata: any;
}

export const ProjectsList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProjects((data || []).map((p: any) => ({
        ...p,
        language: p.language || "java",
        files: Array.isArray(p.files) ? p.files : [],
        scripts: Array.isArray(p.scripts) ? p.scripts : [],
        metadata: typeof p.metadata === 'object' ? p.metadata : {},
      })));
    } catch (error: any) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await (supabase as any).from("projects").delete().eq("id", id);
      if (error) throw error;
      setProjects(projects.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch (error: any) {
      toast.error("Failed to delete project");
    }
  };

  const openProject = (project: Project) => {
    navigate("/sandbox", { state: { project } });
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No projects yet. Create your first plugin!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {projects.map((project, i) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="p-6 hover:border-primary/50 transition-all cursor-pointer group">
            <div onClick={() => openProject(project)}>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {project.project_name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {project.description || "No description"}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="px-2 py-1 rounded bg-primary/10 text-primary">{project.platform}</span>
                <span>{project.mc_version}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => openProject(project)}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Open
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteProject(project.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
