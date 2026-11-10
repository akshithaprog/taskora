import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { PRIORITY } from "../lib/utils";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

// A tiny preview of the product itself, in place of a stock illustration.
function Preview() {
  const rows = [
    { t: "Send portfolio link", p: "high", d: "Today" },
    { t: "Review pull request", p: "medium", d: "Tomorrow" },
    { t: "Water the plants", p: "low", d: "Fri" },
  ];
  return (
    <div className="mt-10 space-y-3">
      {rows.map((r, i) => (
        <div key={r.t} className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-line bg-card py-3 pl-5 pr-4 shadow-card" style={{ marginLeft: i * 18 }}>
          <span className={`absolute inset-y-0 left-0 w-1.5 ${PRIORITY[r.p].edge}`} />
          <span className={`h-5 w-5 rounded-full border-2 ${PRIORITY[r.p].ring}`} />
          <span className="flex-1 text-sm font-semibold">{r.t}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORITY[r.p].soft}`}>{PRIORITY[r.p].label}</span>
          <span className="hidden text-xs text-muted sm:inline">{r.d}</span>
        </div>
      ))}
    </div>
  );
}

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined, form: undefined })); };

  const validate = () => {
    const e = {};
    if (isRegister && !form.name.trim()) e.name = "Enter your name.";
    if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (isRegister) {
      if (form.password.length < 8) e.password = "Use at least 8 characters.";
      else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) e.password = "Include at least one letter and one number.";
    } else if (!form.password) e.password = "Enter your password.";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      isRegister ? await register({ ...form, name: form.name.trim(), email: form.email.trim() }) : await login({ email: form.email.trim(), password: form.password });
    } catch (err) {
      setErrors({ ...err.fields, form: Object.keys(err.fields).length ? undefined : err.message });
      setBusy(false);
    }
  };

  const Err = ({ k }) => (errors[k] ? <p className="mt-1.5 text-xs text-high" role="alert">{errors[k]}</p> : null);

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="hidden flex-col justify-between bg-side p-12 lg:flex">
        <Logo />
        <div>
          <h1 className="max-w-md text-5xl font-semibold leading-[1.08]">Make space for what matters.</h1>
          <p className="mt-4 max-w-sm text-muted">Plan your day, set priorities that you can see at a glance, and finish the things that count.</p>
          <Preview />
        </div>
        <p className="text-sm text-muted">Taskora keeps your tasks private to your account.</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} noValidate className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h2 className="text-3xl font-semibold">{isRegister ? "Create your account" : "Welcome back"}</h2>
          <p className="mt-2 text-sm text-muted">{isRegister ? "It takes less than a minute." : "Sign in to pick up where you left off."}</p>

          {errors.form && <div role="alert" className="mt-5 rounded-lg bg-high-soft px-3.5 py-2.5 text-sm text-high">{errors.form}</div>}
          {location.state?.expired && !errors.form && <div className="mt-5 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-accent">Please sign in to continue.</div>}

          <div className="mt-6 space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Name</label>
                <input id="name" autoComplete="name" className={`input ${errors.name ? "input-error" : ""}`} value={form.name} onChange={(e) => set("name", e.target.value)} />
                <Err k="name" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
              <input id="email" type="email" autoComplete="email" className={`input ${errors.email ? "input-error" : ""}`} value={form.email} onChange={(e) => set("email", e.target.value)} />
              <Err k="email" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <input id="password" type={show ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"}
                  className={`input pr-11 ${errors.password ? "input-error" : ""}`} value={form.password} onChange={(e) => set("password", e.target.value)} />
                <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Err k="password" />
              {isRegister && !errors.password && <p className="mt-1.5 text-xs text-muted">At least 8 characters, with a letter and a number.</p>}
            </div>
          </div>

          <button className="btn-primary mt-6 w-full !py-3" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}</button>
          <p className="mt-6 text-center text-sm text-muted">
            {isRegister ? "Already have an account? " : "New to Taskora? "}
            <Link to={isRegister ? "/login" : "/register"} className="font-semibold text-accent hover:underline">{isRegister ? "Sign in" : "Create an account"}</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
