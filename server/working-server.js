const express = require("express");
const cors = require("cors");

console.log("Starting working server...");

const app = express();
app.use(cors());
app.use(express.json());

// Mock data storage (in-memory)
let teams = [];
let memberRequests = [];

// Test endpoint
app.get("/test", (req, res) => {
  console.log("Test endpoint called");
  res.json({ success: true, message: "Working server is ready!" });
});

// Create team
app.post("/teams", (req, res) => {
  const { leaderId, teamName, teamCode, leaderEmail, leaderName } = req.body;
  
  const team = {
    _id: Date.now().toString(),
    leaderId,
    teamName,
    teamCode,
    leaderEmail,
    leaderName,
    members: [],
    createdAt: new Date().toISOString()
  };
  
  teams.push(team);
  console.log("Team created:", team);
  
  res.status(201).json({ success: true, team });
});

// Get team
app.get("/teams/:teamCode", (req, res) => {
  const { teamCode } = req.params;
  const team = teams.find(t => t.teamCode === teamCode);
  
  if (!team) {
    return res.status(404).json({ success: false, error: "Team not found" });
  }
  
  res.json({ success: true, team });
});

// Submit member request
app.post("/member-requests", (req, res) => {
  const { teamName, teamCode, memberName, memberEmail, memberUid } = req.body;
  
  const request = {
    _id: Date.now().toString(),
    teamName,
    teamCode,
    memberName,
    memberEmail,
    memberUid,
    timestamp: new Date().toISOString(),
    status: "pending"
  };
  
  memberRequests.push(request);
  console.log("Member request submitted:", request);
  
  res.status(201).json({ success: true, request });
});

// Get member requests
app.get("/member-requests/:teamCode", (req, res) => {
  const { teamCode } = req.params;
  const requests = memberRequests.filter(r => r.teamCode === teamCode && r.status === "pending");
  
  console.log("Getting requests for team:", teamCode, "Found:", requests.length);
  
  res.json({ success: true, requests });
});

// Accept member request
app.put("/member-requests/:requestId/accept", (req, res) => {
  const { requestId } = req.params;
  const requestIndex = memberRequests.findIndex(r => r._id === requestId);
  
  if (requestIndex === -1) {
    return res.status(404).json({ success: false, error: "Request not found" });
  }
  
  const request = memberRequests[requestIndex];
  request.status = "accepted";
  
  // Add member to team
  const team = teams.find(t => t.teamCode === request.teamCode);
  if (team) {
    team.members.push({
      name: request.memberName,
      email: request.memberEmail,
      uid: request.memberUid,
      joinedDate: new Date().toISOString()
    });
    console.log("Member added to team:", request.memberName);
  }
  
  res.json({ success: true, message: "Member accepted" });
});

// Reject member request
app.put("/member-requests/:requestId/reject", (req, res) => {
  const { requestId } = req.params;
  const requestIndex = memberRequests.findIndex(r => r._id === requestId);
  
  if (requestIndex === -1) {
    return res.status(404).json({ success: false, error: "Request not found" });
  }
  
  memberRequests[requestIndex].status = "rejected";
  console.log("Member request rejected:", requestId);
  
  res.json({ success: true, message: "Member rejected" });
});

// Remove member
app.delete("/teams/:teamCode/members/:memberUid", (req, res) => {
  const { teamCode, memberUid } = req.params;
  const team = teams.find(t => t.teamCode === teamCode);
  
  if (!team) {
    return res.status(404).json({ success: false, error: "Team not found" });
  }
  
  const memberIndex = team.members.findIndex(m => m.uid === memberUid);
  if (memberIndex === -1) {
    return res.status(404).json({ success: false, error: "Member not found in team" });
  }
  
  const removedMember = team.members.splice(memberIndex, 1)[0];
  console.log("Member removed from team:", removedMember.name);
  
  res.json({ success: true, message: "Member removed from team" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Working server running on port ${PORT}`);
  console.log("✅ All team management endpoints ready!");
  console.log("📝 Available endpoints:");
  console.log("   POST /teams");
  console.log("   GET  /teams/:teamCode");
  console.log("   POST /member-requests");
  console.log("   GET  /member-requests/:teamCode");
  console.log("   PUT  /member-requests/:requestId/accept");
  console.log("   PUT  /member-requests/:requestId/reject");
  console.log("   DELETE /teams/:teamCode/members/:memberUid");
});
