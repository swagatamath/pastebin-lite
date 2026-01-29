const pool = require("../db/postgres");

async function initTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pastes (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      expires_at TIMESTAMPTZ NULL,
      remaining_views INT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function createPaste({ id, content, expiresAt, maxViews }) {
  await pool.query(
    `INSERT INTO pastes (id, content, expires_at, remaining_views)
     VALUES ($1, $2, $3, $4)`,
    [id, content, expiresAt, maxViews],
  );
}

async function fetchPasteAtomic({ id, now }) {
  const result = await pool.query(
    `
    UPDATE pastes
    SET remaining_views =
      CASE
        WHEN remaining_views IS NULL THEN NULL
        ELSE remaining_views - 1
      END
    WHERE id = $1
      AND (expires_at IS NULL OR expires_at > $2)
      AND (remaining_views IS NULL OR remaining_views > 0)
    RETURNING content, remaining_views, expires_at
    `,
    [id, now],
  );

  return result.rows[0] || null;
}

async function getPasteForHtml({ id, now }) {
  const result = await pool.query(
    `
    SELECT content
    FROM pastes
    WHERE id = $1
      AND (expires_at IS NULL OR expires_at > $2)
      AND (remaining_views IS NULL OR remaining_views > 0)
    `,
    [id, now],
  );
  return result.rows[0] || null;
}

module.exports = {
  initTable,
  createPaste,
  fetchPasteAtomic,
  getPasteForHtml,
};
