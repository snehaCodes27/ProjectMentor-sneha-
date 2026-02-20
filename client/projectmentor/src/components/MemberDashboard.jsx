import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/role-selection");
      } else {
        setUser(currentUser);
        // Get member team info using UID
        const memberTeamInfo = localStorage.getItem(`memberTeamInfo_${currentUser.uid}`);
        if (memberTeamInfo) {
          setTeamInfo(JSON.parse(memberTeamInfo));
        } else {
          // No team info, redirect to join team
          navigate("/join-team");
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // Remove UID-specific team info
      if (user) {
        localStorage.removeItem(`memberTeamInfo_${user.uid}`);
      }
      localStorage.removeItem("memberInfo");
      navigate("/role-selection");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user || !teamInfo) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#FCF6D9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}>
        <div style={{ fontSize: "18px", color: "#2b4f60" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#FCF6D9",
      padding: "20px",
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        padding: "32px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        maxWidth: "800px",
        margin: "0 auto",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}>
          <div>
            <h1 style={{ color: "#2b4f60", fontSize: "28px", fontWeight: "700", margin: "0 0 8px 0" }}>
              Member Dashboard
            </h1>
            <p style={{ color: "#666", fontSize: "16px", margin: "0" }}>
              Welcome, {user.displayName}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#dc3545",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            Logout
          </button>
        </div>

        <div style={{
          backgroundColor: "#f8f9fa",
          border: "2px solid #e1e5e9",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "30px",
        }}>
          <h2 style={{ color: "#2b4f60", fontSize: "20px", fontWeight: "600", margin: "0 0 16px 0" }}>
            🏆 Team Information
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr)", gap: "16px" }}>
            <div style={{ backgroundColor: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e1e5e9" }}>
              <h3 style={{ color: "#2b4f60", fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>
                Team Name
              </h3>
              <p style={{ color: "#666", fontSize: "14px", margin: "0" }}>
                {teamInfo.teamName}
              </p>
            </div>
            <div style={{ backgroundColor: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e1e5e9" }}>
              <h3 style={{ color: "#2b4f60", fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>
                Team Code
              </h3>
              <p style={{ color: "#666", fontSize: "14px", margin: "0" }}>
                {teamInfo.teamCode}
              </p>
            </div>
            <div style={{ backgroundColor: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e1e5e9" }}>
              <h3 style={{ color: "#2b4f60", fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>
                Your Role
              </h3>
              <p style={{ color: "#666", fontSize: "14px", margin: "0" }}>
                Team Member
              </p>
            </div>
            <div style={{ backgroundColor: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e1e5e9" }}>
              <h3 style={{ color: "#2b4f60", fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>
                Joined Date
              </h3>
              <p style={{ color: "#666", fontSize: "14px", margin: "0" }}>
                {new Date(teamInfo.joinedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: "#ffffff",
          border: "2px solid #e1e5e9",
          borderRadius: "16px",
          padding: "24px",
          textAlign: "center",
        }}>
          <h2 style={{ color: "#2b4f60", fontSize: "20px", fontWeight: "600", margin: "0 0 16px 0" }}>
            🚀 Project Status
          </h2>
          <p style={{ color: "#666", fontSize: "16px", margin: "0 0 20px 0" }}>
            Your team leader will select and assign projects. Check back here for updates!
          </p>
          <div style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "8px",
            padding: "16px",
            color: "#856404",
            fontSize: "14px",
          }}>
            <strong>📋 Next Steps:</strong>
            <ul style={{ textAlign: "left", margin: "8px 0 0 0", paddingLeft: "20px" }}>
              <li>Wait for team leader to select a project</li>
              <li>You'll receive notifications when projects are assigned</li>
              <li>Collaborate with your team members</li>
              <li>Track project progress here</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
