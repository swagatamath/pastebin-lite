require("dotenv").config();
const express = require("express");
const healthz = require("../src/routes/healthz");
const pastes = require("../src/routes/pastes");
const pasteById = require("../src/routes/pasteById");
const { initTable } = require("../src/services/paste.service");

const app = express();

app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});   

/* ------------------------------------- */

app.use(express.json({ limit: "256kb" }));

initTable().catch((e) => console.error("initTable failed:", e));

app.use("/api/healthz", healthz);
app.use("/api/pastes", pastes);
app.use("/", pasteById);

module.exports = app;

/* Local dev only */
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`Server listening on http://localhost:${PORT}`)
  );
}
