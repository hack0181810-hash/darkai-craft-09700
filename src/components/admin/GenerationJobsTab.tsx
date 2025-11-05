import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, XCircle, CheckCircle, Loader2, RotateCw, X } from "lucide-react";

interface GenerationJob {
  id: string;
  user_id: string;
  status: string;
  description: string;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}

interface GenerationJobsTabProps {
  jobs: GenerationJob[];
  searchTerm: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onRetryJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
}

export const GenerationJobsTab = ({
  jobs,
  searchTerm,
  filterStatus,
  onSearchChange,
  onFilterChange,
  onRetryJob,
  onCancelJob
}: GenerationJobsTabProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1 inline" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1 inline" />Pending</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600"><Loader2 className="h-3 w-3 mr-1 inline animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1 inline" />Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation Jobs</CardTitle>
        <CardDescription>Monitor and manage all plugin generation jobs</CardDescription>
        <div className="flex gap-4 mt-4">
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterStatus} onValueChange={onFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No generation jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="max-w-md truncate">{job.description}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {job.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRetryJob(job.id)}
                        >
                          <RotateCw className="h-3 w-3" />
                        </Button>
                      )}
                      {job.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onCancelJob(job.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
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
