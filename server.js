import express from "express";
import cors from "cors";
import { extractFigmaData } from "./extractor.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// Add root route handler
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/extract", async (req, res) => {
  const { fileId, nodeIds, token, fileName } = req.body;
  console.log("Received data:", { fileId, nodeIds, token, fileName });


  try {
    const result = await extractFigmaData({
      fileId,
      ids: nodeIds,
      token,
      fileName,
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

