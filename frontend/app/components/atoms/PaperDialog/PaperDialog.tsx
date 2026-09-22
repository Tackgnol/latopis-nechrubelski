import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import type { PaperDialogProps } from "./PaperDialog.models";
import "./PaperDialog.styles.css";

export function PaperDialog({
  isOpen,
  onOpenChange,
  title,
  intro,
  closeLabel,
  children,
}: PaperDialogProps) {
  return (
    <ModalOverlay
      className="paper-dialog-overlay"
      isDismissable
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Modal className="paper-dialog-modal">
        <Dialog className="paper-dialog">
          <header className="paper-dialog-header">
            <div>
              <Heading slot="title" className="paper-dialog-title">
                {title}
              </Heading>
              <p className="paper-dialog-intro">{intro}</p>
            </div>
            <Button
              className="paper-dialog-close"
              onPress={() => onOpenChange(false)}
            >
              {closeLabel}
            </Button>
          </header>
          {children}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
