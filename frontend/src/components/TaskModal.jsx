import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { PRIORITIES, PRIORITY, todayStr } from "../lib/utils";
import { useTasks } from "../context/TasksContext";

const empty = (date) => ({ title: "", description: "", priority: "medium", due_date: date || "", category: "", tags: [] });

// Defined outside TaskModal so inputs keep focus while typing.
const Field = ({ label, error, children, htmlFor }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">{label}</label>
    {children}
    {error && <p className="mt-1.5 text-xs text-high" role="alert">{error}</p>}
  </div>
);

export default function TaskModal({ open, task, defaultDate, onClose }) {
  const { addTask, editTask, categories } = useTasks();
  const [form, setForm] = useState(empty());
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(task ? { title: task.title, description: task.description, priority: task.priority, due_date: task.due_date || "", category: task.category, tags: task.tags } : empty(defaultDate));
    setTagInput(""); setErrors({}); setSaving(false);
    setTimeout(() => titleRef.current?.focus(), 50);
  }, [open, task, defaultDate]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const set = (key, value) => { setForm((f) => ({ ...f, [key]: value })); setErrors((e) => ({ ...e, [key]: undefined })); };

  const addTag = (raw) => {
    const tag = raw.trim().replace(/^#/, "");
    if (!tag) return;
    if (form.tags.length >= 8) return setErrors((e) => ({ ...e, tags: "You can add up to 8 tags." }));
    if (tag.length > 24) return setErrors((e) => ({ ...e, tags: "Keep each tag under 24 characters." }));
    if (!form.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) set("tags", [...form.tags, tag]);
    setTagInput("");
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Give your task a title.";
    else if (form.title.trim().length > 120) e.title = "Use 120 characters or fewer.";
    if (form.description.length > 1000) e.description = "Keep the description under 1000 characters.";
    if (form.category.trim().length > 40) e.category = "Use 40 characters or fewer.";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    const tags = tagInput.trim() ? [...form.tags, tagInput.trim().replace(/^#/, "")] : form.tags;
    const body = { ...form, title: form.title.trim(), category: form.category.trim(), due_date: form.due_date || null, tags };
    setSaving(true);
    try {
      task ? await editTask(task.id, body) : await addTask(body);
      onClose();
    } catch (err) {
      setErrors(err.fields || {});   // field-level messages from the server, if any
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.form onSubmit={submit} noValidate role="dialog" aria-modal="true" aria-label={task ? "Edit task" : "New task"}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.18 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-card p-6 shadow-pop sm:rounded-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{task ? "Edit task" : "New task"}</h2>
              <button type="button" className="icon-btn -mr-2" onClick={onClose} aria-label="Close"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <Field label="Title" error={errors.title} htmlFor="t-title">
                <input id="t-title" ref={titleRef} className={`input ${errors.title ? "input-error" : ""}`} placeholder="What needs doing?"
                  value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={140} />
              </Field>
              <Field label="Description" error={errors.description} htmlFor="t-desc">
                <textarea id="t-desc" rows={3} className={`input resize-none ${errors.description ? "input-error" : ""}`} placeholder="Add a few details (optional)"
                  value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>

              <Field label="Priority" error={errors.priority}>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Priority">
                  {PRIORITIES.map((p) => {
                    const on = form.priority === p;
                    return (
                      <button type="button" key={p} role="radio" aria-checked={on} onClick={() => set("priority", p)}
                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${on ? `${PRIORITY[p].soft} ${PRIORITY[p].ring}` : "border-line text-muted hover:bg-hover"}`}>
                        <span className={`h-2 w-2 rounded-full ${PRIORITY[p].dot}`} />{PRIORITY[p].label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Due date" error={errors.due_date} htmlFor="t-due">
                  <input id="t-due" type="date" className={`input ${errors.due_date ? "input-error" : ""}`} value={form.due_date}
                    onChange={(e) => set("due_date", e.target.value)} min={task ? undefined : todayStr()} />
                </Field>
                <Field label="Category" error={errors.category} htmlFor="t-cat">
                  <input id="t-cat" list="category-list" className={`input ${errors.category ? "input-error" : ""}`} placeholder="e.g. Work"
                    value={form.category} onChange={(e) => set("category", e.target.value)} />
                  <datalist id="category-list">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                </Field>
              </div>

              <Field label="Tags" error={errors.tags} htmlFor="t-tags">
                <div className={`input flex flex-wrap items-center gap-1.5 !py-2 ${errors.tags ? "input-error" : ""}`}>
                  {form.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                      #{t}
                      <button type="button" aria-label={`Remove tag ${t}`} onClick={() => set("tags", form.tags.filter((x) => x !== t))}><X size={12} /></button>
                    </span>
                  ))}
                  <input id="t-tags" className="min-w-[8rem] flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted" placeholder={form.tags.length ? "" : "Type a tag, press Enter"}
                    value={tagInput} onChange={(e) => setTagInput(e.target.value.replace(",", ""))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
                      else if (e.key === "Backspace" && !tagInput && form.tags.length) set("tags", form.tags.slice(0, -1));
                    }} onBlur={() => addTag(tagInput)} />
                </div>
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving…" : task ? "Save changes" : "Add task"}</button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
