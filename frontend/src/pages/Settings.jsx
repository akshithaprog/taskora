import { useState } from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";

function Card({ title, sub, children }) {
  return (
    <section className="panel p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Row({ label, error, children, id }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-high" role="alert">{error}</p>}
    </div>
  );
}

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const toast = useToast();

  const [name, setName] = useState(user.name);
  const [nameError, setNameError] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [pw, setPw] = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const saveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setNameError("Enter your name.");
    setSavingName(true); setNameError("");
    try { const r = await api.updateMe({ name: name.trim() }); setUser(r.user); toast.success("Changes saved"); }
    catch (err) { setNameError(err.fields?.name || err.message); }
    setSavingName(false);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pw.current_password) errs.current_password = "Enter your current password.";
    if (pw.new_password.length < 8) errs.new_password = "Use at least 8 characters.";
    else if (!/[A-Za-z]/.test(pw.new_password) || !/\d/.test(pw.new_password)) errs.new_password = "Include at least one letter and one number.";
    if (pw.confirm !== pw.new_password) errs.confirm = "Passwords don't match.";
    setPwErrors(errs);
    if (Object.keys(errs).length) return;
    setSavingPw(true);
    try {
      await api.changePassword({ current_password: pw.current_password, new_password: pw.new_password });
      setPw({ current_password: "", new_password: "", confirm: "" });
      toast.success("Password updated");
    } catch (err) { setPwErrors(Object.keys(err.fields).length ? err.fields : { current_password: err.message }); }
    setSavingPw(false);
  };

  const setP = (k) => (e) => { setPw((p) => ({ ...p, [k]: e.target.value })); setPwErrors((x) => ({ ...x, [k]: undefined })); };
  const cls = (err) => `input ${err ? "input-error" : ""}`;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-1 text-muted">Manage your account and how Taskora looks.</p>
      </div>

      <Card title="Profile">
        <form onSubmit={saveName} noValidate className="space-y-4">
          <Row label="Name" error={nameError} id="s-name"><input id="s-name" className={cls(nameError)} value={name} onChange={(e) => { setName(e.target.value); setNameError(""); }} /></Row>
          <Row label="Email" id="s-email"><input id="s-email" className="input opacity-70" value={user.email} disabled /></Row>
          <button className="btn-primary" disabled={savingName || name.trim() === user.name}>{savingName ? "Saving…" : "Save changes"}</button>
        </form>
      </Card>

      <Card title="Password">
        <form onSubmit={savePassword} noValidate className="space-y-4">
          <Row label="Current password" error={pwErrors.current_password} id="p-cur"><input id="p-cur" type="password" autoComplete="current-password" className={cls(pwErrors.current_password)} value={pw.current_password} onChange={setP("current_password")} /></Row>
          <Row label="New password" error={pwErrors.new_password} id="p-new"><input id="p-new" type="password" autoComplete="new-password" className={cls(pwErrors.new_password)} value={pw.new_password} onChange={setP("new_password")} /></Row>
          <Row label="Confirm new password" error={pwErrors.confirm} id="p-conf"><input id="p-conf" type="password" autoComplete="new-password" className={cls(pwErrors.confirm)} value={pw.confirm} onChange={setP("confirm")} /></Row>
          <button className="btn-primary" disabled={savingPw}>{savingPw ? "Updating…" : "Update password"}</button>
        </form>
      </Card>

      <Card title="Appearance">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Dark mode</p>
            <p className="text-sm text-muted">Easier on the eyes in low light.</p>
          </div>
          <button role="switch" aria-checked={theme === "dark"} onClick={toggle} aria-label="Dark mode"
            className={`relative h-8 w-14 shrink-0 rounded-full transition ${theme === "dark" ? "bg-accent" : "bg-line"}`}>
            <span className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink shadow transition-all ${theme === "dark" ? "left-7" : "left-1"}`}>
              {theme === "dark" ? <Moon size={13} /> : <Sun size={13} />}
            </span>
          </button>
        </div>
      </Card>

      <Card title="Session">
        <button className="btn-ghost" onClick={logout}><LogOut size={16} />Sign out</button>
      </Card>
    </div>
  );
}
