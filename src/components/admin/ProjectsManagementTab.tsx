import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";

interface ProjectData {
  id: string;
  user_id: string;
  project_name: string;
  platform: string;
  created_at: string;
}

interface ProjectsManagementTabProps {
  projects: ProjectData[];
  onDeleteProject: (projectId: string) => void;
  onExportData: (type: string) => void;
}

export const ProjectsManagementTab = ({
  projects,
  onDeleteProject,
  onExportData
}: ProjectsManagementTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects Management</CardTitle>
        <CardDescription>View and manage all generated projects</CardDescription>
        <Button onClick={() => onExportData('projects')} className="w-fit mt-2" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Projects
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.project_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{project.platform}</Badge>
                  </TableCell>
                  <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteProject(project.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
