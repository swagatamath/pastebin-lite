const express = require("express");
const { fetchPasteAtomic, getPasteForHtml } = require("../services/paste.service");

const router = express.Router();

function nowForExpiryOnly(req) {
  if (process.env.TEST_MODE === "1") {
    const h = req.get("x-test-now-ms");
    if (h) {
      const n = Number(h);
      if (Number.isFinite(n)) return new Date(n);
    }
  }
  return new Date();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

router.get("/api/pastes/:id", async (req, res) => {
  const now = nowForExpiryOnly(req);
  const id = req.params.id;

  const row = await fetchPasteAtomic({ id, now });
  if (!row) {
    return res.status(404).type("application/json").send({ error: "Not found" });
  }

  return res.status(200).type("application/json").send({
    content: row.content,
    remaining_views: row.remaining_views === null ? null : row.remaining_views,
    expires_at: row.expires_at === null ? null : new Date(row.expires_at).toISOString()
  });
});


router.get("/p/:id", async (req, res) => {
  const now = nowForExpiryOnly(req);
  const id = req.params.id;

  const row = await getPasteForHtml({ id, now });
  if (!row) {
    return res.status(404).send("Not Found");
  }

  const safe = escapeHtml(row.content);

  return res.status(200).type("text/html").send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Paste ${id}</title>
</head>
<body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px;">
  <h2 style="margin: 0 0 12px;">Paste</h2>
  <pre style="white-space: pre-wrap; word-break: break-word; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">${safe}</pre>
</body>
</html>`);
});

module.exports = router;
