import { ReactNode } from "react";
import Button from "../button";
import Modal from "../modal";
import clsx from "clsx";

const ConfirmationModal = ({ onAccept, onReject, icon, title, accept, reject, showReject, className, danger }: {
    onAccept?: () => void;
    onReject?: () => void;
    icon: ReactNode;
    title: string;
    accept?: string;
    reject?: string;
    showReject?: boolean;
    className?: string
    danger?: boolean;
}) => {
    return (
        <Modal className={clsx("!w-[50%] !max-w-md", className && className)}>
            {icon}
            <span className="max-w-xs text-center text-2xl">
                {title}
            </span>
            <Button type={danger ? "danger" : "primary"} onClick={onAccept}>
                {accept}
            </Button>
            {showReject && <Button
                variant="text"
                className="!hover:bg-inherit !bg-inherit text-primary-500"
                onClick={onReject}
            >
                {reject}
            </Button>}
        </Modal>
    );
};

export default ConfirmationModal;