type ConfirmationModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmationModal({
  isOpen,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70">
      <div className="w-96 rounded-xl bg-gray-900 p-6">
        <h2 className="text-xl font-bold text-yellow-400">
          Confirm Submission
        </h2>

        <p className="mt-4 text-gray-300">
          Are you sure you want to submit your predictions?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg bg-gray-700 px-4 py-2 text-white"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-lg bg-yellow-400 px-4 py-2 font-bold text-black"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
