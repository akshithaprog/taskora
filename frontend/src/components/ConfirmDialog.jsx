import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    try { await onConfirm(); } catch { /* the error toast is already shown */ }
    setBusy(false);
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
          <motion.div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-line bg-card p-6 shadow-pop">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-high-soft text-high"><Trash2 size={18} /></span>
            <h2 id="confirm-title" className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm text-muted">{message}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
              <button className="btn-danger" onClick={confirm} disabled={busy}>{busy ? "Deleting…" : confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
