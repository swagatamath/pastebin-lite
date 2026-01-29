const express = require("express")
const pool = require("../db/postgres")

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.status(200).type("application/json").send({ ok: true })
  } catch (e) {
    return res.status(200).type("application/json").send({ ok: false })
  }
})

module.exports = router;
