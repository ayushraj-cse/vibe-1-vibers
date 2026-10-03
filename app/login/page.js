"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "employee", label: "Employee" },
  { value: "rider", label: "Rider" },
];

const DEMO_ACCOUNTS = [
  { label: "Student", username: "student_demo", password: "demo1234" },
  { label: "Employee", username: "employee_demo", password: "demo1234" },
  { label: "Rider", username: "rider_demo", password: "demo1234" },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Make sure the fixed demo accounts exist as soon as the login page loads,
  // so they're ready to use without signing up by hand.
  useEffect(() => {
    fetch("/api/dev/seed", { method: "POST" }).catch(() => {});
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function useDemo(acc) {
    setMode("login");
    setError("");
    setForm((f) => ({ ...f, username: acc.username, password: acc.password }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload =
        mode === "login"
          ? { username: form.username, password: form.password }
          : form;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-9 w-9 rounded-md bg-amber-500 text-stone-900 font-bold flex items-center justify-center text-lg">
              T
            </span>
            <span className="text-xl font-semibold tracking-tight text-stone-900">
              Lawazia Mobility Desk
            </span>
          </div>
          <p className="text-sm text-stone-500">One Toto. College · Station · Office.</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-6">
          <div className="flex mb-6 rounded-md bg-stone-100 p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md py-1.5 transition ${
                mode === "login" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-md py-1.5 transition ${
                mode === "signup" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Full name</label>
                <input
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Username</label>
              <input
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
            </div>
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => update("role", r.value)}
                      className={`rounded-md border px-2 py-1.5 text-sm transition ${
                        form.role === r.value
                          ? "border-amber-500 bg-amber-50 text-stone-900 font-medium"
                          : "border-stone-300 text-stone-500"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-stone-900 text-white py-2.5 text-sm font-medium hover:bg-stone-800 transition disabled:opacity-60"
            >
              {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>

        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-stone-700 mb-2">
            Demo accounts (click one to fill the login form)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                type="button"
                onClick={() => useDemo(acc)}
                className="rounded-md border border-amber-300 bg-white px-2 py-2 text-left hover:bg-amber-100 transition"
              >
                <p className="text-xs font-semibold text-stone-900">{acc.label}</p>
                <p className="text-[11px] text-stone-500 truncate">{acc.username}</p>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            Password for all demo accounts: <span className="font-mono">demo1234</span>
          </p>
        </div>
      </div>
    </main>
  );
}
