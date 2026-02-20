const express = require("express");
const cors = require("cors");

console.log("Starting simple test server...");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  console.log("Test endpoint called");
  res.json({ success: true, message: "Simple test server working!" });
});

app.put("/member-requests/:requestId/accept", (req, res) => {
  const { requestId } = req.params;
  console.log("Accept called for requestId:", requestId);
  res.json({ success: true, message: "Member accepted" });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`);
  console.log("Test with: http://localhost:5001/test");
});
