require("dotenv").config();
const express = require("express");
const cors = require("cors");

const healthz = require("../src/routes/healthz");
const pastes = require("../src/routes/pastes");
const pasteById = require("../src/routes/pasteById");
const { initTable } = require("../src/services/paste.service");

const app = express();


app.use(cors()); // allow same-origin + dev, no preflight issues

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
