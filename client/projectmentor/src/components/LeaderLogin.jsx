import { useState } from "react";
import { useNavigate } from "react-router-dom";
import leaderImg from "../assets/leader.png";

const LeaderLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    teamName: "",
    teamCode: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Debug: Check what's actually in localStorage
      console.log("=== LOCALSTORAGE DEBUG ===");
      console.log("All localStorage keys:", Object.keys(localStorage));
      console.log("teamInfo raw:", localStorage.getItem("teamInfo"));
      console.log("leaderInfo raw:", localStorage.getItem("leaderInfo"));
      
      // Check team info directly from localStorage
      const savedTeam = JSON.parse(localStorage.getItem("teamInfo"));
      
      console.log("Saved team exists:", !!savedTeam);
      console.log("Saved team data:", savedTeam);
      console.log("Form data:", form);
      
      if (!savedTeam) {
        alert("No team found! Please create a team first.");
        setLoading(false);
        return;
      }

      // Check each field individually with detailed logging
      const emailMatch = form.email?.trim() === savedTeam.email?.trim();
      const teamNameMatch = form.teamName?.trim() === savedTeam.teamName?.trim();
      const teamCodeMatch = form.teamCode?.trim() === savedTeam.teamCode?.trim();
      
      console.log("Individual matches:");
      console.log("- Email:", emailMatch);
      console.log("- Team name:", teamNameMatch);
      console.log("- Team code:", teamCodeMatch);
      console.log("- All match:", emailMatch && teamNameMatch && teamCodeMatch);
      
      // Character-by-character comparison
      console.log("Character comparison:");
      console.log("- Email chars:", form.email, "vs", savedTeam.email);
      console.log("- Team name chars:", form.teamName, "vs", savedTeam.teamName);
      console.log("- Team code chars:", form.teamCode, "vs", savedTeam.teamCode);
      console.log("- Email lengths:", form.email?.length, "vs", savedTeam.email?.length);
      console.log("- Team name lengths:", form.teamName?.length, "vs", savedTeam.teamName?.length);
      console.log("- Team code lengths:", form.teamCode?.length, "vs", savedTeam.teamCode?.length);

      if (emailMatch && teamNameMatch && teamCodeMatch) {
        // Save leader info for dashboard
        localStorage.setItem("leaderInfo", JSON.stringify(savedTeam));
        console.log("Login successful! Navigating to dashboard...");
        navigate("/leader-dashboard");
      } else {
        alert(`Invalid team details!\n\nCheck:\n- Email: ${emailMatch ? '✓' : '✗'}\n- Team name: ${teamNameMatch ? '✓' : '✗'}\n- Team code: ${teamCodeMatch ? '✓' : '✗'}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(`Login failed: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.backArrow} onClick={() => navigate("/role-selection")}>←</span>
        </div>
        <img src={leaderImg} alt="Leader Login" style={styles.logo} />
        <h2 style={styles.title}>Leader Login</h2>
        <p style={styles.subtitle}>Enter your details to access dashboard</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <span style={styles.icon}>📧</span>
            <input
              type="email"
              name="email"
              placeholder="Leader Email"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <span style={styles.icon}>👥</span>
            <input
              type="text"
              name="teamName"
              placeholder="Team Name"
              value={form.teamName}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <span style={styles.icon}>🔑</span>
            <input
              type="text"
              name="teamCode"
              placeholder="Team Code"
              value={form.teamCode}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#FCF6D9", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  card: { width: "360px", backgroundColor: "#fff", borderRadius: "20px", padding: "32px 28px", boxShadow: "0 12px 30px rgba(0,0,0,0.12)", textAlign: "center" },
  header: { display: "flex", justifyContent: "flex-start", marginBottom: "16px" },
  backArrow: { fontSize: "24px", color: "#2b4f60", cursor: "pointer", padding: "8px", borderRadius: "8px", transition: "background-color 0.3s", "&:hover": { backgroundColor: "#f0f0f0" } },
  logo: { width: "120px", height: "120px", marginBottom: "16px", objectFit: "contain" },
  title: { color: "#2b4f60", marginBottom: "6px", fontSize: "24px" },
  subtitle: { fontSize: "14px", color: "#2b4f60", opacity: 0.75, marginBottom: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  inputGroup: { display: "flex", alignItems: "center", border: "1px solid #9CC6DB", borderRadius: "12px", padding: "8px 12px" },
  icon: { fontSize: "18px", marginRight: "8px", color: "#2b4f60" },
  input: { border: "none", outline: "none", width: "100%", fontSize: "14px", backgroundColor: "transparent", color: "#2b4f60" },
  button: { width: "100%", marginTop: "10px", padding: "12px", borderRadius: "12px", border: "none", backgroundColor: "#9CC6DB", color: "#fff", fontWeight: "600", fontSize: "15px", cursor: "pointer" },
};

export default LeaderLogin;
