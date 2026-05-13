import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import SectionCard from "../components/SectionCard";
import usePageTitle from "../hooks/usePageTitle";
import useToast from "../hooks/useToast";
import api from "../services/api";
import { getToken, setToken } from "../services/tokenStorage";

const Login = () => {
  usePageTitle("Login");
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getToken()) {
      navigate("/notes", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/login", {
        username,
        password
      });
      setToken(response.data.token);
      pushToast({
        title: "Access granted",
        message: "Welcome to Secure Notes.",
        tone: "success"
      });
      navigate("/notes", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Login failed.";
      setError(message);
      pushToast({
        title: "Login failed",
        message,
        tone: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 px-6 py-12 md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="rounded-3xl border border-ink-800/70 bg-gradient-to-br from-ink-900/90 via-ink-900/80 to-ink-950/80 px-8 py-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                DevSecOps Zero Trust
              </p>
              <h1 className="mt-3 font-display text-3xl text-slate-100">
                Secure Notes Login
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                Sign in with your secure credentials to unlock protected notes
                and mission-critical telemetry.
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/20 text-teal-300">
              <Lock size={24} />
            </div>
          </div>
        </div>

        <SectionCard
          title="Authenticate"
          subtitle="Use the admin credentials configured in the Flask API"
        >
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Username"
                className="w-full rounded-xl border border-ink-700/70 bg-ink-850/70 px-4 py-3 text-sm text-slate-100 focus:border-teal-400/70 focus:outline-none"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-ink-700/70 bg-ink-850/70 px-4 py-3 text-sm text-slate-100 focus:border-teal-400/70 focus:outline-none"
                required
              />
            </div>
            {error && (
              <div className="rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-teal-400 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-slate-400"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowRight size={18} />
              )}
              Sign in
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
};

export default Login;
