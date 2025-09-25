import { useAppStore } from "@/store/useAppStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";

export const ConfirmationModal = () => {
  const { confirmState, confirmCancel, confirmAccept } = useAppStore();
  if (!confirmState) return null;
  return (
    <Dialog open onOpenChange={(open) => !open && confirmCancel()}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle id="confirmation-title">
            {confirmState.title}
          </DialogTitle>
          <DialogDescription id="confirmation-message">
            {confirmState.message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-4 pt-2">
          <Button
            id="cancel-confirmation-btn"
            variant="secondary"
            onClick={confirmCancel}
          >
            Cancel
          </Button>
          <Button
            id="confirm-action-btn"
            variant="destructive"
            onClick={confirmAccept}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
