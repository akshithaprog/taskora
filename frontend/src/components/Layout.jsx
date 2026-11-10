import { createContext, useCallback, useContext, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import TaskModal from "./TaskModal";
import ConfirmDialog from "./ConfirmDialog";
import { TasksProvider, useTasks } from "../context/TasksContext";

// Gives every page access to "open the task form", "ask to delete" and the search text.
const TaskUIContext = createContext(null);
export const useTaskUI = () => useContext(TaskUIContext);

const LIST_ROUTES = ["/tasks", "/my-day", "/upcoming", "/completed", "/overdue"];

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { removeTask } = useTasks();
  const [menu, setMenu] = useState(false);
  const [search, setSearchText] = useState("");
  const [modal, setModal] = useState({ open: false, task: null, date: "" });
  const [toDelete, setToDelete] = useState(null);

  const setSearch = (value) => {
    setSearchText(value);
    if (value && !LIST_ROUTES.includes(location.pathname)) navigate("/tasks");  // results live on a list page
  };
  const openCreate = useCallback((date = "") => setModal({ open: true, task: null, date }), []);
  const openEdit = useCallback((task) => setModal({ open: true, task, date: "" }), []);
  const closeModal = useCallback(() => setModal((m) => ({ ...m, open: false })), []);

  return (
    <TaskUIContext.Provider value={{ search, setSearch, openCreate, openEdit, askDelete: setToDelete }}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar open={menu} onClose={() => setMenu(false)} />
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <Topbar onMenu={() => setMenu(true)} />
          <motion.main key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-8 sm:py-9">
            <Outlet />
          </motion.main>
        </div>
      </div>

      <TaskModal open={modal.open} task={modal.task} defaultDate={modal.date} onClose={closeModal} />
      <ConfirmDialog open={!!toDelete} title="Delete this task?"
        message={toDelete ? `“${toDelete.title}” will be removed permanently. This can't be undone.` : ""}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => { await removeTask(toDelete.id); setToDelete(null); }} />
    </TaskUIContext.Provider>
  );
}

export default function Layout() {
  return <TasksProvider><Shell /></TasksProvider>;
}
