const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "invoices");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/invoices", (req, res) => {
  try {
    const invoice = req.body;
    const timestamp = Date.now();
    const filename = `invoice_${timestamp}.json`;
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(invoice, null, 2), "utf8");
    res.json({ ok: true, file: filename });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.get("/api/invoices", (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
    res.json({ ok: true, files });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.get("/api/invoices/:name", (req, res) => {
  const fp = path.join(DATA_DIR, req.params.name);
  if (fs.existsSync(fp)) res.download(fp);
  else res.status(404).json({ ok: false, error: "Not found" });
});

app.listen(PORT, () => console.log("Server running on port", PORT));
