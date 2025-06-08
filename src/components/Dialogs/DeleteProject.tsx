import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteProject } from "../../../actions/project";
import { toast } from "sonner";
import { useState } from "react";

type DeleteProjectProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  projectId: string;
  onSuccess?: () => void;
};

const DeleteProject = ({
  open,
  setOpen,
  projectId,
  onSuccess,
}: DeleteProjectProps) => {
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteProject(projectId);
      if (res.success) {
        toast.success("Project deleted successfully");
        setOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error("Failed to delete project");
      }
    } catch (err) {
      toast.error("An error occurred while deleting the project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Delete Project
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          Do you want to delete this project?
        </div>
        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProject;
