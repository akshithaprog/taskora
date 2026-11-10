import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useToast } from "./ToastContext";

const TasksContext = createContext(null);
export const useTasks = () => useContext(TasksContext);

export function TasksProvider({ children }) {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshStats = useCallback(() => api.stats().then(setStats).catch(() => {}), []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [t, s] = await Promise.all([api.listTasks(), api.stats()]);
      setTasks(t.tasks); setStats(s);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Runs an API call, shows a toast, refreshes the stats. Failures show an error toast and re-throw
  // so forms can keep themselves open.
  const run = async (fn, okMessage) => {
    try { await fn(); if (okMessage) toast.success(okMessage); refreshStats(); }
    catch (e) { toast.error(e.message); throw e; }
  };

  const addTask = (body) => run(async () => {
    const { task } = await api.createTask(body);
    setTasks((l) => [task, ...l]);
  }, "Task added");

  const editTask = (id, body) => run(async () => {
    const { task } = await api.updateTask(id, body);
    setTasks((l) => l.map((t) => (t.id === id ? task : t)));
  }, "Changes saved");

  const removeTask = (id) => run(async () => {
    await api.deleteTask(id);
    setTasks((l) => l.filter((t) => t.id !== id));
  }, "Task deleted");

  const toggleTask = (id) => run(async () => {
    const { task } = await api.toggleTask(id);
    setTasks((l) => l.map((t) => (t.id === id ? task : t)));
    toast.success(task.completed ? "Marked as done" : "Task reopened");
  }).catch(() => {});

  const categories = [...new Set(tasks.map((t) => t.category).filter(Boolean))].sort();

  return (
    <TasksContext.Provider value={{ tasks, stats, loading, error, reload: load, addTask, editTask, removeTask, toggleTask, categories }}>
      {children}
    </TasksContext.Provider>
  );
}
