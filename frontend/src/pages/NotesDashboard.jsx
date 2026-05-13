import { useEffect, useMemo, useState } from "react";
import { Activity, Loader2, Plus, Trash2 } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import ActivityFeed from "../components/ActivityFeed";
import api from "../services/api";
import { clearToken, getToken } from "../services/tokenStorage";
import useToast from "../hooks/useToast";

const activity = [
  {
    id: "evt-1",
    title: "New incident note added to Hello",
    time: "10 min ago",
    actor: "policy-engine"
  },
  {
    id: "evt-2",
    title: "Runbook approval granted",
    time: "22 min ago",
    actor: "security-lead"
  },
  {
    id: "evt-3",
    title: "Threat intel ingestion completed",
    time: "1h ago",
    actor: "intel-bot"
  }
];

const NotesDashboard = () => {
  usePageTitle("Notes Dashboard");
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const outletContext = useOutletContext() || {};
  const searchTerm = outletContext.searchTerm || "";
  const [token, setTokenState] = useState(getToken());
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lastSync, setLastSync] = useState(null);

  const filteredNotes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return notes;
    }
    return notes.filter((note) => {
      const title = note.title?.toLowerCase() || "";
      const content = note.content?.toLowerCase() || "";
      return (
        title.includes(normalizedSearch) || content.includes(normalizedSearch)
      );
    });
  }, [notes, searchTerm]);

  const stats = useMemo(() => {
    const total = filteredNotes.length;
    return {
      total,
      latest: filteredNotes[filteredNotes.length - 1]?.title || "-",
      averageLen: total
        ? Math.round(
            filteredNotes.reduce(
              (sum, note) => sum + note.content.length,
              0
            ) / total
          )
        : 0
    };
  }, [filteredNotes]);

  const handleAuthError = (message) => {
    clearToken();
    setTokenState(null);
    setNotes([]);
    setLastSync(null);
    pushToast({
      title: "Session expired",
      message,
      tone: "warn"
    });
    setError(message);
    navigate("/login", { replace: true });
  };

  const loadNotes = async () => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/notes");
      setNotes(response.data.notes || []);
      setLastSync(new Date());
    } catch (err) {
      if (err?.response?.status === 401) {
        handleAuthError("Please sign in to continue.");
        return;
      }
      setError("Unable to load notes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadNotes();
    }
  }, [token, navigate]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!title || !content) {
      setError("Title and content are required.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const response = await api.post("/notes", { title, content });
      setNotes((prev) => [...prev, response.data.note]);
      setTitle("");
      setContent("");
      pushToast({
        title: "Note added",
        message: "Secure note saved successfully.",
        tone: "success"
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        handleAuthError("Your token expired.");
        return;
      }
      const message =
        err?.response?.data?.message || "Unable to save note.";
      setError(message);
      pushToast({
        title: "Save failed",
        message,
        tone: "error"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      pushToast({
        title: "Note deleted",
        message: "The note has been removed.",
        tone: "info"
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        handleAuthError("Please sign in again.");
        return;
      }
      pushToast({
        title: "Delete failed",
        message: "Unable to remove the note.",
        tone: "error"
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Mission Control
          </p>
          <h2 className="font-display text-2xl text-slate-100">
            Notes Intelligence Hub
          </h2>
        </div>
        <div className="rounded-full border border-ink-700/70 bg-ink-900/70 px-4 py-2 text-xs text-slate-400">
          Last sync: {lastSync ? lastSync.toLocaleTimeString() : "--"}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
        <SectionCard
          title="Analyst Notes"
          subtitle="Secure notes stored in the Flask API"
        >
          <form className="space-y-3" onSubmit={handleCreate}>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Note title"
                className="w-full rounded-xl border border-ink-700/70 bg-ink-850/70 px-4 py-3 text-sm text-slate-100 focus:border-teal-400/70 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-3 text-sm font-semibold text-ink-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-slate-400"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                Add note
              </button>
            </div>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write the secure note content..."
              rows={4}
              className="w-full rounded-xl border border-ink-700/70 bg-ink-850/70 px-4 py-3 text-sm text-slate-100 focus:border-teal-400/70 focus:outline-none"
            />
          </form>

          <div className="mt-5 space-y-4">
            {isLoading ? (
              <div className="rounded-xl border border-ink-800/70 bg-ink-900/60 px-4 py-6 text-sm text-slate-400">
                Loading secure notes...
              </div>
            ) : notes.length === 0 ? (
              <div className="rounded-xl border border-ink-800/70 bg-ink-900/60 px-4 py-6 text-sm text-slate-400">
                No notes yet. Add the first secure note.
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="rounded-xl border border-ink-800/70 bg-ink-900/60 px-4 py-6 text-sm text-slate-400">
                No notes match "{searchTerm}".
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-ink-800/70 bg-ink-900/60 px-4 py-4"
                >
                  <div>
                    <p className="text-sm text-slate-100">{note.title}</p>
                    <p className="text-xs text-slate-500">{note.content}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    className="flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1 text-xs text-rose-200"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Signals and Changes"
          subtitle="Latest telemetry from controls"
          action={
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Activity size={14} />
              Live feed
            </div>
          }
        >
          <ActivityFeed items={activity} />
        </SectionCard>
      </div>

      <SectionCard
        title="Governance Snapshot"
        subtitle="Operational posture at a glance"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total notes"
            value={`${stats.total}`}
            detail="Stored in Secure Notes"
          />
          <StatCard
            title="Latest note"
            value={stats.latest}
            detail="Most recent title"
          />
          <StatCard
            title="Avg content"
            value={`${stats.averageLen} chars`}
            detail="Average note length"
          />
        </div>
      </SectionCard>
    </div>
  );
};

export default NotesDashboard;
