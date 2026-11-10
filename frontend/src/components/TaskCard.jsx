import { Calendar, Check, Folder, Pencil, Trash2 } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import { PRIORITY, formatDue, isOverdue } from "../lib/utils";
import { useTaskUI } from "./Layout";
import { useTasks } from "../context/TasksContext";

export default function TaskCard({ task }) {
  const { openEdit, askDelete } = useTaskUI();
  const { toggleTask } = useTasks();
  const p = PRIORITY[task.priority];
  const overdue = isOverdue(task);

  return (
    <li className="panel group relative overflow-hidden transition hover:shadow-pop">
      {/* The coloured edge carries the priority at a glance */}
      <span className={`absolute inset-y-0 left-0 w-1.5 ${p.edge} ${task.completed ? "opacity-40" : ""}`} />
      <div className="flex items-start gap-3.5 py-4 pl-5 pr-3 sm:pr-4">
        <button onClick={() => toggleTask(task.id)} aria-label={task.completed ? "Reopen task" : "Mark task as done"}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${p.ring} ${task.completed ? `${p.fill} text-white` : "bg-card hover:bg-hover"}`}>
          {task.completed && <Check size={14} strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className={`font-sans text-[15px] font-semibold leading-snug tracking-normal ${task.completed ? "text-muted line-through" : ""}`}>{task.title}</h3>
            <PriorityBadge priority={task.priority} />
          </div>
          {task.description && <p className="mt-1 line-clamp-1 text-sm text-muted">{task.description}</p>}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
            <span className={`inline-flex items-center gap-1.5 ${overdue ? "font-semibold text-high" : ""}`}>
              <Calendar size={13} />{overdue ? `Overdue · ${formatDue(task.due_date)}` : formatDue(task.due_date)}
            </span>
            {task.category && <span className="inline-flex items-center gap-1.5"><Folder size={13} />{task.category}</span>}
            {task.tags.map((t) => <span key={t} className="rounded-md bg-hover px-1.5 py-0.5">#{t}</span>)}
          </div>
        </div>

        <div className="flex shrink-0 gap-0.5 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <button className="icon-btn" onClick={() => openEdit(task)} aria-label={`Edit ${task.title}`}><Pencil size={16} /></button>
          <button className="icon-btn hover:!text-high" onClick={() => askDelete(task)} aria-label={`Delete ${task.title}`}><Trash2 size={16} /></button>
        </div>
      </div>
    </li>
  );
}
