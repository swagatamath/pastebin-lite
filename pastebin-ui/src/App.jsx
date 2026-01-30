import { useMemo, useState } from "react";

const API_BASE = ""; 

function numOrNull(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1) return NaN;
  return n;
}

export default function App() {
  // Create form state
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");

  // Results
  const [createRes, setCreateRes] = useState(null);
  const [createErr, setCreateErr] = useState("");

  // Fetch state
  const [pasteId, setPasteId] = useState("");
  const [fetchRes, setFetchRes] = useState(null);
  const [fetchErr, setFetchErr] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ HTML view is also same domain now
  const pasteUrl = useMemo(() => {
    if (!createRes?.id) return "";
    return `/p/${createRes.id}`;
  }, [createRes]);

  async function checkHealth() {
    setFetchErr("");
    setFetchRes(null);
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/healthz`);
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      setFetchRes({ healthz: data });
    } catch (e) {
      setFetchErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function createPaste() {
    setCreateErr("");
    setCreateRes(null);

    const ttlVal = numOrNull(ttl);
    const mvVal = numOrNull(maxViews);

    if (!content.trim()) {
      setCreateErr("Content is required.");
      return;
    }
    if (Number.isNaN(ttlVal)) {
      setCreateErr("ttl_seconds must be an integer ≥ 1");
      return;
    }
    if (Number.isNaN(mvVal)) {
      setCreateErr("max_views must be an integer ≥ 1");
      return;
    }

    const body = { content: content.trim() };
    if (ttlVal != null) body.ttl_seconds = ttlVal;
    if (mvVal != null) body.max_views = mvVal;

    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/pastes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await r.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Non-JSON response (HTTP ${r.status}). Check server logs.`);
      }

      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      setCreateRes(data);
      setPasteId(data.id); // auto-fill for fetch test
    } catch (e) {
      setCreateErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function fetchPaste() {
    setFetchErr("");
    setFetchRes(null);

    if (!pasteId.trim()) {
      setFetchErr("Paste ID is required.");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch(
        `${API_BASE}/api/pastes/${encodeURIComponent(pasteId.trim())}`
      );
      const text = await r.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Non-JSON response (HTTP ${r.status}).`);
      }

      if (!r.ok) throw new Error(data?.error || "Not found");
      setFetchRes(data);
    } catch (e) {
      setFetchErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, Arial", maxWidth: 880, margin: "28px auto", padding: 16 }}>
      <h2 style={{ margin: 0 }}>Pastebin-Lite Tester</h2>
      <p style={{ marginTop: 8, color: "#555" }}>
        Backend: <code>same domain</code>
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Create */}
        <div style={{ flex: "1 1 420px", border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Create Paste</h3>

          <label style={{ display: "block", marginBottom: 6 }}>Content *</label>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your paste text..."
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 6 }}>ttl_seconds (optional)</label>
              <input
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
                placeholder="e.g. 60"
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 6 }}>max_views (optional)</label>
              <input
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder="e.g. 2"
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              onClick={createPaste}
              disabled={loading}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
            >
              {loading ? "Working..." : "Create"}
            </button>

            <button
              onClick={() => {
                setContent("");
                setTtl("");
                setMaxViews("");
                setCreateRes(null);
                setCreateErr("");
              }}
              disabled={loading}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}
            >
              Clear
            </button>
          </div>

          {createErr && (
            <div style={{ marginTop: 12, padding: 10, background: "#ffecec", border: "1px solid #ffb3b3", borderRadius: 10 }}>
              <b>Error:</b> {createErr}
            </div>
          )}

          {createRes && (
            <div style={{ marginTop: 12, padding: 10, background: "#eef8ff", border: "1px solid #b3ddff", borderRadius: 10 }}>
              <div><b>ID:</b> <code>{createRes.id}</code></div>
              <div style={{ marginTop: 6 }}>
                <b>URL:</b>{" "}
                <a href={pasteUrl} target="_blank" rel="noreferrer">
                  {pasteUrl}
                </a>
              </div>
              <div style={{ marginTop: 6 }}>
                <a href={`/api/pastes/${createRes.id}`} target="_blank" rel="noreferrer">
                  Open API JSON (counts views)
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Fetch */}
        <div style={{ flex: "1 1 420px", border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Fetch Paste</h3>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={pasteId}
              onChange={(e) => setPasteId(e.target.value)}
              placeholder="Paste ID (e.g. abc123...)"
              style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            />
            <button
              onClick={fetchPaste}
              disabled={loading}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
            >
              {loading ? "Working..." : "Fetch"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button
              onClick={checkHealth}
              disabled={loading}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}
            >
              Check /api/healthz
            </button>

            {pasteId?.trim() && (
              <a
                href={`/p/${pasteId.trim()}`}
                target="_blank"
                rel="noreferrer"
                style={{ alignSelf: "center" }}
              >
                Open HTML view
              </a>
            )}
          </div>

          {fetchErr && (
            <div style={{ marginTop: 12, padding: 10, background: "#ffecec", border: "1px solid #ffb3b3", borderRadius: 10 }}>
              <b>Error:</b> {fetchErr}
            </div>
          )}

          {fetchRes && (
            <div style={{ marginTop: 12, padding: 10, background: "#f6fff2", border: "1px solid #c7f2b5", borderRadius: 10 }}>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
{JSON.stringify(fetchRes, null, 2)}
              </pre>
              {fetchRes.content && (
                <>
                  <hr style={{ margin: "12px 0" }} />
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Content Preview</div>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
{fetchRes.content}
                  </pre>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <p style={{ marginTop: 14, color: "#666" }}>
        Tip: If you set <code>max_views</code>, each successful API fetch reduces remaining views.
      </p>
    </div>
  );
}
