import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const JoinTeam = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    teamName: "",
    teamCode: "",
    memberName: "",
    memberEmail: "",
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Check if member is already in a team
        const memberTeamInfo = localStorage.getItem(`memberTeamInfo_${currentUser.uid}`);
        if (memberTeamInfo) {
          // Member is already in a team, redirect to member dashboard
          navigate("/member-dashboard");
          return;
        }
        
        // Pre-fill member info if available
        const memberInfo = localStorage.getItem("memberInfo");
        if (memberInfo) {
          const info = JSON.parse(memberInfo);
          setForm({
            teamName: info.teamName || "",
            teamCode: info.teamCode || "",
            memberName: info.name || currentUser.displayName || "",
            memberEmail: info.email || currentUser.email || "",
          });
        }
      }
      // Don't redirect non-authenticated users - let them fill the form
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Debug: Check what we're saving
      console.log("=== JOIN REQUEST DEBUG ===");
      console.log("Form data:", form);
      console.log("User UID:", user?.uid);
      console.log("Auth current user:", auth.currentUser?.uid);
      
      // Save join request to MongoDB via API
      const response = await fetch("http://localhost:5000/member-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName: form.teamName,
          teamCode: form.teamCode,
          memberName: form.memberName,
          memberEmail: form.memberEmail,
          memberUid: user?.uid || auth.currentUser?.uid || 'pending-' + Date.now()
        }),
      });

      const result = await response.json();
      console.log("API response:", result);

      if (result.success) {
        setSubmitted(true);
      } else {
        alert(`Failed to submit join request: ${result.error}`);
      }

      // Update user profile with member name if user exists
      if (user && auth.currentUser) {
        await auth.currentUser.updateProfile({
          displayName: form.memberName,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Join team error:", error);
      alert(`Failed to submit join request: ${error.message}`);
      setLoading(false);
    }
  };

  // Show waiting message after submission
  if (submitted) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#FCF6D9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}>
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "32px 28px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}>
          <div style={{ fontSize: "48px", textAlign: "center", marginBottom: "16px" }}>⏳</div>
          <h2 style={{ textAlign: "center", color: "#2b4f60", marginBottom: "6px", fontSize: "24px", fontWeight: "700" }}>
            Join Request Submitted!
          </h2>
          <p style={{ textAlign: "center", fontSize: "16px", color: "#2b4f60", marginBottom: "16px", opacity: 0.8 }}>
            Waiting for team leader to add you to the team
          </p>
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "16px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            border: "1px solid #e1e5e9"
          }}>
            <p style={{ margin: "0", fontSize: "14px", color: "#2b4f60", fontWeight: "600" }}>
              Team: {form.teamName}
            </p>
            <p style={{ margin: "4px 0", fontSize: "12px", color: "#666" }}>
              Code: {form.teamCode}
            </p>
            <p style={{ margin: "4px 0", fontSize: "12px", color: "#666" }}>
              Your Name: {form.memberName}
            </p>
            <p style={{ margin: "4px 0", fontSize: "12px", color: "#666" }}>
              Your Email: {form.memberEmail}
            </p>
          </div>
          <p style={{ textAlign: "center", fontSize: "14px", color: "#2b4f60", opacity: 0.7 }}>
            The team leader will be notified and can add you to the team.
          </p>
          <button 
            onClick={() => navigate("/role-selection")}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backgroundColor: "#2b4f60",
              color: "#ffffff",
              border: "none",
              marginTop: "20px"
            }}
          >
            Back to Role Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#FCF6D9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        padding: "40px 32px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        textAlign: "center",
        maxWidth: "400px",
        width: "100%",
      }}>
        <button 
          onClick={() => navigate("/role-selection")}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            backgroundColor: "transparent",
            border: "none",
            color: "#2b4f60",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          ← Back to Role Selection
        </button>

        <h2 style={{ textAlign: "center", color: "#2b4f60", marginBottom: "6px", fontSize: "24px", fontWeight: "700" }}>
          Join Team
        </h2>
        <p style={{ textAlign: "center", fontSize: "16px", color: "#2b4f60", marginBottom: "30px", opacity: 0.8 }}>
          Enter team details to join
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #9CC6DB", borderRadius: "12px", padding: "8px 12px", transition: "border-color 0.3s" }}>
            <span style={{ fontSize: "18px", marginRight: "8px", color: "#2b4f60" }}>🏷️</span>
            <input
              type="text"
              name="teamName"
              placeholder="Team Name"
              value={form.teamName}
              onChange={handleChange}
              required
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "14px",
                backgroundColor: "transparent",
                color: "#2b4f60",
              }}
              disabled={loading}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", border: "1px solid #9CC6DB", borderRadius: "12px", padding: "8px 12px", transition: "border-color 0.3s" }}>
            <span style={{ fontSize: "18px", marginRight: "8px", color: "#2b4f60" }}>🔑</span>
            <input
              type="text"
              name="teamCode"
              placeholder="Team Code"
              value={form.teamCode}
              onChange={handleChange}
              required
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "14px",
                backgroundColor: "transparent",
                color: "#2b4f60",
              }}
              disabled={loading}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", border: "1px solid #9CC6DB", borderRadius: "12px", padding: "8px 12px", transition: "border-color 0.3s" }}>
            <span style={{ fontSize: "18px", marginRight: "8px", color: "#2b4f60" }}>👤</span>
            <input
              type="text"
              name="memberName"
              placeholder="Your Name"
              value={form.memberName}
              onChange={handleChange}
              required
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "14px",
                backgroundColor: "transparent",
                color: "#2b4f60",
              }}
              disabled={loading}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", border: "1px solid #9CC6DB", borderRadius: "12px", padding: "8px 12px", transition: "border-color 0.3s" }}>
            <span style={{ fontSize: "18px", marginRight: "8px", color: "#2b4f60" }}>📧</span>
            <input
              type="email"
              name="memberEmail"
              placeholder="Your Email"
              value={form.memberEmail}
              onChange={handleChange}
              required
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "14px",
                backgroundColor: "transparent",
                color: "#2b4f60",
              }}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "12px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              backgroundColor: loading ? "#ccc" : "#28a745",
              color: "#ffffff",
              border: "none",
            }}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Join Request"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "14px", color: "#2b4f60", marginTop: "20px", opacity: 0.7 }}>
          Already in team? <span 
            style={{ 
              color: "#28a745", 
              cursor: "pointer", 
              textDecoration: "underline",
              fontWeight: "600"
            }} 
            onClick={() => navigate('/member-login')}
          >
            Login as Member
          </span>
        </p>
      </div>
    </div>
  );
};

export default JoinTeam;
