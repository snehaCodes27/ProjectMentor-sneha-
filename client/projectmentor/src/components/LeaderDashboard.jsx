import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import SelectProject from "./SelectProject";

const LeaderDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teamInfo, setTeamInfo] = useState({ 
    teamName: "", 
    teamCode: "", 
    leaderName: "",
    leaderEmail: "",
    members: [] 
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [teamProgress, setTeamProgress] = useState(0);
  const [showSelectProjectModal, setShowSelectProjectModal] = useState(false);
  const [showManageTeamModal, setShowManageTeamModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("teamInfo");
      localStorage.removeItem("selectedProject");
      navigate("/leader-login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/leader-login");
      } else {
        setUser(currentUser);
        const savedTeamInfo = localStorage.getItem("teamInfo");
        if (savedTeamInfo) {
          setTeamInfo(JSON.parse(savedTeamInfo));
        }
        const savedProject = localStorage.getItem("selectedProject");
        if (savedProject) {
          setSelectedProject(JSON.parse(savedProject));
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleManageTeam = async () => {
    try {
      console.log("Loading team requests for team code:", teamInfo.teamCode);
      
      // Check if team code exists
      if (!teamInfo.teamCode || teamInfo.teamCode.trim() === "") {
        alert("No team code found. Please create a team first.");
        return;
      }
      
      // Load pending requests from MongoDB API
      const response = await fetch(`http://localhost:5000/member-requests/${teamInfo.teamCode}`);
      
      if (!response.ok) {
        console.error("Response not ok:", response.status, response.statusText);
        alert(`Failed to load requests: Server error ${response.status}`);
        return;
      }
      
      const result = await response.json();
      console.log("API response:", result);
      console.log("Current team info:", teamInfo);
      
      if (result.success) {
        setPendingRequests(result.requests || []);
        setShowManageTeamModal(true);
      } else {
        console.error("API error:", result.error);
        alert(`Failed to load requests: ${result.error}`);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
      alert(`Error loading requests: ${error.message}`);
    }
  };

  const handleSelectProject = () => {
    if (selectedProject) {
      alert("You already selected a project. Now work on it!");
    } else {
      setShowSelectProjectModal(true);
    }
  };

  const handleWorkOnProject = () => {
    if (!selectedProject) {
      alert("Please select a project first!");
    } else {
      navigate("/work-on-project");
    }
  };

  const handleTrackProgress = () => {
    navigate("/track-progress");
  };

  const handleProjectSelected = () => {
    setShowSelectProjectModal(false);
    // Refresh selected project from localStorage
    const savedProject = localStorage.getItem("selectedProject");
    if (savedProject) {
      setSelectedProject(JSON.parse(savedProject));
    }
  };

  const handleAcceptMember = async (request) => {
  try {
    const res = await fetch(
      `http://localhost:5000/member-requests/${request._id}/accept`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    const data = await res.json();
    console.log("Member accepted:", data);

    if (data.success) {
      setPendingRequests((prev) =>
        prev.filter((req) => req._id !== request._id)
      );

      alert("Member accepted successfully ✅");
    }
  } catch (error) {
    console.error("Error accepting member:", error.message);
    alert("Failed to accept member ❌");
  }
};




  const handleRejectMember = async (request) => {
    try {
      // Reject member via API
      const response = await fetch(`http://localhost:5000/member-requests/${request._id}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();
      console.log("Reject API response:", result);

      if (result.success) {
        // Remove from pending requests
        setPendingRequests(pendingRequests.filter(req => req._id !== request._id));
        alert(`${request.memberName}'s request has been rejected.`);
      } else {
        alert(`Failed to reject member: ${result.error}`);
      }
    } catch (error) {
      console.error("Error rejecting member:", error);
      alert(`Error rejecting member: ${error.message}`);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      return;
    }

    try {
      // Remove member from team via API
      const response = await fetch(`http://localhost:5000/teams/${teamInfo.teamCode}/members/${member.uid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();
      console.log("Remove member API response:", result);

      if (result.success) {
        // Update local team info
        const updatedTeamInfo = {
          ...teamInfo,
          members: (teamInfo.members || []).filter(m => m.uid !== member.uid)
        };
        setTeamInfo(updatedTeamInfo);
        localStorage.setItem("teamInfo", JSON.stringify(updatedTeamInfo));
        
        alert(`${member.name} has been removed from the team.`);
      } else {
        alert(`Failed to remove member: ${result.error}`);
      }
    } catch (error) {
      console.error("Error removing member:", error);
      alert(`Error removing member: ${error.message}`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FCF6D9", padding: "24px" }}>
      <nav style={{
        backgroundColor: "#2b4f60",
        padding: "18px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        marginBottom: "30px",
        marginTop: "20px",
        borderRadius: "12px"
      }}>
        <div>
          <h2 style={{ color: "#ffffff", fontSize: "22px", fontWeight: "700", margin: 0 }}>
            {teamInfo.teamName || "Team Name"}
          </h2>
          <p style={{ color: "#ffffff", fontSize: "13px", opacity: 0.75, margin: "4px 0 0 0" }}>
            {selectedProject?.title || "No project selected"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            padding: "6px 10px",
            borderRadius: "8px",
            color: "#ffffff"
          }}>
            <span style={{ fontSize: "11px" }}>Team Code: {teamInfo.teamCode || "N/A"}</span>
          </div>
          <div style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            padding: "6px 10px",
            borderRadius: "8px",
            color: "#ffffff"
          }}>
            <span style={{ fontSize: "11px" }}>Members: {teamInfo.members?.length || 0}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#e74c3c",
              color: "#ffffff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "11px",
              flexShrink: "0"
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Welcome Message */}
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1 style={{ color: "#2b4f60", fontSize: "32px", fontWeight: "700", margin: "0 0 12px 0" }}>
          Welcome back, {user?.displayName || "Team Leader"}!
        </h1>
        <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
          Manage your team and track project progress all in one place
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "20px",
        flexWrap: "wrap",
        position: "absolute",
        bottom: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "1200px"
      }}>
        {/* Manage Team Card */}
        <div
          onClick={handleManageTeam}
          style={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "2px solid transparent",
            width: "280px",
            height: "160px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
            e.currentTarget.style.borderColor = "#2b4f60";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          <h3 style={{ color: "#2b4f60", fontSize: "20px", fontWeight: "600", margin: "0 0 12px 0" }}>
            Manage Team
          </h3>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
            Add or remove team members, update team information
          </p>
        </div>

        {/* Select Project Card */}
        <div
          onClick={handleSelectProject}
          style={{
            backgroundColor: selectedProject ? "#f0f0f0" : "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: selectedProject ? "none" : "0 8px 24px rgba(0,0,0,0.1)",
            cursor: selectedProject ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            border: "2px solid transparent",
            opacity: selectedProject ? 0.6 : 1,
            width: "280px",
            height: "160px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
          onMouseOver={(e) => {
            if (!selectedProject) {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
              e.currentTarget.style.borderColor = "#2b4f60";
            }
          }}
          onMouseOut={(e) => {
            if (!selectedProject) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
              e.currentTarget.style.borderColor = "transparent";
            }
          }}
        >
          <h3 style={{ color: selectedProject ? "#999" : "#2b4f60", fontSize: "20px", fontWeight: "600", margin: "0 0 12px 0" }}>
            Select Project
          </h3>
          <p style={{ color: selectedProject ? "#999" : "#666", fontSize: "14px", margin: 0 }}>
            {selectedProject ? `Selected: ${selectedProject.title}` : "Choose a project to work on"}
          </p>
        </div>

        {/* Work on Project Card */}
        <div
          onClick={handleWorkOnProject}
          style={{
            backgroundColor: selectedProject ? "#ffffff" : "#f0f0f0",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: selectedProject ? "0 8px 24px rgba(0,0,0,0.1)" : "none",
            cursor: selectedProject ? "pointer" : "not-allowed",
            transition: "all 0.3s ease",
            border: "2px solid transparent",
            opacity: selectedProject ? 1 : 0.6,
            width: "280px",
            height: "160px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
          onMouseOver={(e) => {
            if (selectedProject) {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
              e.currentTarget.style.borderColor = "#2b4f60";
            }
          }}
          onMouseOut={(e) => {
            if (selectedProject) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
              e.currentTarget.style.borderColor = "transparent";
            }
          }}
        >
          <h3 style={{ color: selectedProject ? "#2b4f60" : "#999", fontSize: "20px", fontWeight: "600", margin: "0 0 12px 0" }}>
            Work on Project
          </h3>
          <p style={{ color: selectedProject ? "#666" : "#999", fontSize: "14px", margin: 0 }}>
            {selectedProject ? "Start working on your project" : "Select a project first"}
          </p>
        </div>

        {/* Track Team Progress Card */}
        <div
          onClick={handleTrackProgress}
          style={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "2px solid transparent",
            width: "280px",
            height: "160px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
            e.currentTarget.style.borderColor = "#2b4f60";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          <h3 style={{ color: "#2b4f60", fontSize: "20px", fontWeight: "600", margin: "0 0 12px 0" }}>
            Track Team Progress
          </h3>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
            Monitor team progress and performance metrics
          </p>
        </div>
      </div>

      {/* Select Project Modal */}
      {showSelectProjectModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            width: "90vw",
            maxWidth: "500px",
            height: "70vh",
            overflow: "hidden",
            position: "relative"
          }}>
            <button
              onClick={() => setShowSelectProjectModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#2b4f60",
                zIndex: 1001,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
              }}
            >
              ×
            </button>
            <SelectProject onClose={handleProjectSelected} />
          </div>
        </div>
      )}

      {/* Manage Team Modal */}
      {showManageTeamModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "32px",
            width: "90vw",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflow: "auto",
            position: "relative"
          }}>
            <button
              onClick={() => setShowManageTeamModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#2b4f60",
                zIndex: 1001,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
              }}
            >
              ×
            </button>

            <h2 style={{ color: "#2b4f60", fontSize: "24px", fontWeight: "700", margin: "0 0 24px 0" }}>
              👥 Manage Team Members
            </h2>

            {/* Team Information */}
            <div style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #e1e5e9",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "24px"
            }}>
              <h3 style={{ color: "#2b4f60", fontSize: "18px", fontWeight: "600", margin: "0 0 12px 0" }}>
                📋 Team Information
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <p style={{ color: "#666", fontSize: "14px", margin: "0 0 4px 0" }}>
                    <strong>Team Name:</strong> {teamInfo.teamName}
                  </p>
                  <p style={{ color: "#666", fontSize: "14px", margin: "0 0 4px 0" }}>
                    <strong>Team Code:</strong> {teamInfo.teamCode}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#666", fontSize: "14px", margin: "0 0 4px 0" }}>
                    <strong>Leader:</strong> {teamInfo.leaderName}
                  </p>
                  <p style={{ color: "#666", fontSize: "14px", margin: "0 0 4px 0" }}>
                    <strong>Leader Email:</strong> {teamInfo.leaderEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Team Members */}
            <div style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #e1e5e9",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "24px"
            }}>
              <h3 style={{ color: "#2b4f60", fontSize: "18px", fontWeight: "600", margin: "0 0 16px 0" }}>
                👥 Current Team Members ({teamInfo.members?.length || 0})
              </h3>
              {(!teamInfo.members || teamInfo.members.length === 0) ? (
                <p style={{ color: "#666", fontSize: "14px", margin: "0" }}>
                  No team members yet
                </p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {(teamInfo.members || []).map((member, index) => (
                    <div key={index} style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e1e5e9",
                      borderRadius: "6px",
                      padding: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div>
                        <p style={{ color: "#2b4f60", fontSize: "14px", fontWeight: "600", margin: "0 0 4px 0" }}>
                          {member.name}
                        </p>
                        <p style={{ color: "#666", fontSize: "12px", margin: "0" }}>
                          📧 {member.email}
                        </p>
                        <p style={{ color: "#999", fontSize: "11px", margin: "0" }}>
                          📅 Joined: {new Date(member.joinedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member)}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pendingRequests.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e1e5e9"
              }}>
                <p style={{ color: "#666", fontSize: "16px", margin: "0" }}>
                  No pending member requests
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ color: "#2b4f60", fontSize: "18px", fontWeight: "600", margin: "0 0 16px 0" }}>
                  📋 Pending Requests ({pendingRequests.length})
                </h3>
                {pendingRequests.map((request, index) => (
                  <div key={index} style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e1e5e9",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "12px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <h4 style={{ color: "#2b4f60", fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>
                          {request.memberName}
                        </h4>
                        <p style={{ color: "#666", fontSize: "14px", margin: "0 0 4px 0" }}>
                          📧 {request.memberEmail}
                        </p>
                        <p style={{ color: "#666", fontSize: "12px", margin: "0" }}>
                          📅 Requested: {new Date(request.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleAcceptMember(request)}
                          style={{
                            backgroundColor: "#28a745",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 16px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#218838";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "#28a745";
                          }}
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleRejectMember(request)}
                          style={{
                            backgroundColor: "#dc3545",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 16px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#c82333";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "#dc3545";
                          }}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              backgroundColor: "#e8f5e8",
              border: "1px solid #c3e6c3",
              borderRadius: "8px",
              padding: "16px",
              marginTop: "20px"
            }}>
              <h4 style={{ color: "#155724", fontSize: "14px", fontWeight: "600", margin: "0 0 8px 0" }}>
                Current Team Members: {teamInfo.members?.length || 0}
              </h4>
              {teamInfo.members && teamInfo.members.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {(teamInfo.members || []).map((member, index) => (
                    <span key={index} style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #d4edda",
                      borderRadius: "16px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      color: "#155724",
                      fontWeight: "500"
                    }}>
                      {member.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#155724", fontSize: "14px", margin: "0" }}>
                  No members in team yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderDashboard;