console.log("Starting test server...");
console.log("Node version:", process.version);
console.log("Current directory:", process.cwd());

const express = require("express");
const cors = require("cors");

console.log("Express and cors loaded...");

try {
  const app = express();

  app.use(cors());
  app.use(express.json());

  console.log("Middleware configured...");

  // Test endpoint
  app.get("/test", (req, res) => {
    console.log("Test endpoint called");
    res.status(200).json({ 
      success: true, 
      message: "Test server is working!",
      timestamp: new Date().toISOString()
    });
  });

  // Mock member request endpoint
  app.post("/member-requests", (req, res) => {
    console.log("=== DEBUG: Member request received:", req.body);
    
    const { teamName, teamCode, memberName, memberEmail, memberUid } = req.body;
    
    const mockRequest = {
      _id: 'mock-' + Date.now(),
      teamName,
      teamCode,
      memberName,
      memberEmail,
      memberUid,
      timestamp: new Date().toISOString(),
      status: "pending"
    };
    
    console.log("=== DEBUG: Created mock request:", mockRequest);
    
    return res.status(201).json({ success: true, request: mockRequest });
  });

  // Mock get member requests endpoint
  app.get("/member-requests/:teamCode", (req, res) => {
    const { teamCode } = req.params;
    console.log("=== DEBUG: Getting member requests for teamCode:", teamCode);
    
    const mockRequests = [
      {
        _id: 'mock-1',
        teamName: 'vns',
        teamCode: teamCode,
        memberName: 'SNEHA',
        memberEmail: 'snehamatkar3@gmail.com',
        memberUid: 'pending-' + Date.now(),
        timestamp: new Date().toISOString(),
        status: "pending"
      }
    ];
    
    console.log("=== DEBUG: Returning mock requests:", mockRequests);
    
    return res.status(200).json({ success: true, requests: mockRequests });
  });

  // Mock accept member endpoint
  app.put("/member-requests/:requestId/accept", (req, res) => {
    const { requestId } = req.params;
    console.log("=== DEBUG: Accepting member request:", requestId);
    
    // Mock success - just return success without database operations
    return res.status(200).json({ success: true, message: "Member accepted" });
  });

  // Mock reject member endpoint
  app.put("/member-requests/:requestId/reject", (req, res) => {
    const { requestId } = req.params;
    console.log("=== DEBUG: Rejecting member request:", requestId);
    
    return res.status(200).json({ success: true, message: "Member rejected" });
  });

  // Mock remove member endpoint
  app.delete("/teams/:teamCode/members/:memberUid", (req, res) => {
    const { teamCode, memberUid } = req.params;
    console.log("=== DEBUG: Removing member from team:", teamCode, memberUid);
    
    return res.status(200).json({ success: true, message: "Member removed from team" });
  });

  const PORT = 5000;
  
  console.log("About to start server on port", PORT);
  
  app.listen(PORT, () => {
    console.log(`Test server successfully running on port ${PORT}`);
    console.log("Available endpoints:");
    console.log("  GET  /test");
    console.log("  POST /member-requests");
    console.log("  GET  /member-requests/:teamCode");
    console.log("  PUT  /member-requests/:requestId/accept");
    console.log("  PUT  /member-requests/:requestId/reject");
    console.log("  DELETE /teams/:teamCode/members/:memberUid");
  });
  
} catch (error) {
  console.error("Error starting server:", error);
  process.exit(1);
}
