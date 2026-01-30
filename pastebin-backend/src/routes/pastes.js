const express = require("express");
const crypto = require("crypto");
const { createPaste } = require("../services/paste.service");

const router = express.Router();

function getBaseUrl(req) {
  const proto = (req.headers["x-forwarded-proto"] || req.protocol || "https").toString();
  const host = (req.headers["x-forwarded-host"] || req.headers.host).toString();
  return `${proto}://${host}`;
}

router.post("/", async (req, res) => {
  const { content, ttl_seconds, max_views } = req.body || {};

  if (typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ error: "content is required and must be a non-empty string" });
  }

  if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
    return res.status(400).json({ error: "ttl_seconds must be an integer >= 1" });
  }

  if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
    return res.status(400).json({ error: "max_views must be an integer >= 1" });
  }

  const id = crypto.randomBytes(8).toString("hex");
  const expiresAt = ttl_seconds ? new Date(Date.now() + ttl_seconds * 1000) : null;
  const maxViews = max_views ?? null;

  await createPaste({
    id,
    content,
    expiresAt,
    maxViews
  });

  const base = getBaseUrl(req);
  return res.status(201).json({
    id,
    url: `${base}/p/${id}`
  });
});

module.exports = router;
