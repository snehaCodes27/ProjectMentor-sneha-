import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MemberLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    teamCode: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if member is accepted in the team
      const response = await fetch(`http://localhost:5000/teams/${form.teamCode}`);
      const teamData = await response.json();

      if (!teamData.success) {
        throw new Error("Team not found");
      }

      const team = teamData.team;
      
      // Check if member exists in the team
      const member = team.members.find(m => m.email === form.email);
      
      if (!member) {
        throw new Error("You are not a member of this team or your request hasn't been accepted yet");
      }

      // Check if password matches member name
      if (form.password !== member.name) {
        throw new Error("Invalid password. Password should be your name.");
      }

      // Store member info in localStorage
      localStorage.setItem("memberInfo", JSON.stringify({
        name: member.name,
        email: member.email,
        teamName: team.teamName,
        teamCode: team.teamCode,
        uid: member.uid
      }));

      alert(`Welcome back ${member.name}! Login successful.`);
      navigate("/member-dashboard");
      
    } catch (error) {
      console.error("Login error:", error);
      alert(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
          Member Login
        </h2>
        <p style={{ textAlign: "center", fontSize: "16px", color: "#2b4f60", marginBottom: "30px", opacity: 0.8 }}>
          Access your team dashboard
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #9CC6DB", borderRadius: "12px", padding: "8px 12px", transition: "border-color 0.3s" }}>
            <span style={{ fontSize: "18px", marginRight: "8px", color: "#2b4f60" }}>📧</span>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
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
  <span style={{ fontSize: "18px", marginRight: "8px", color: "#2b4f60" }}></span>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #9CC6DB", borderRadius: "12px", padding: "8px 12px", transition: "border-color 0.3s" }}>
            <span style={{ fontSize: "18px", marginRight: "8px", color: "#2b4f60" }}>🔒</span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
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
            {loading ? "Logging in..." : "Login as Member"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "14px", color: "#2b4f60", marginTop: "20px", opacity: 0.7 }}>
          Don't have an account? <span 
            style={{ 
              color: "#28a745", 
              cursor: "pointer", 
              textDecoration: "underline",
              fontWeight: "600"
            }} 
            onClick={() => navigate('/join-team')}
          >
            Join Team
          </span>
        </p>
      </div>
    </div>
  );
};

export default MemberLogin;
