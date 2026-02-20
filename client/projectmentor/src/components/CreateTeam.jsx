import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import createTeamLogo from "../assets/create team.png";

const CreateTeam = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [leaderName, setLeaderName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setAuthLoading(false);
      if (!currentUser) {
        navigate("/leader-register");
      } else {
        setUser(currentUser);
        // Pre-fill leader name from displayName if available
        if (currentUser.displayName) {
          setLeaderName(currentUser.displayName);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Generate random team code
  const generateTeamCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const teamCode = generateTeamCode();

      // Call NodeMailer backend
      const response = await fetch("http://localhost:5000/send-team-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaderEmail: user.email,
          leaderName,
          teamName,
          teamCode,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error("Email sending failed");
      }

      // Save team info to localStorage
      localStorage.setItem("teamInfo", JSON.stringify({ 
        email: user.email, 
        leaderName,
        teamName, 
        teamCode 
      }));

      alert(`Team created successfully!\nYour Team Code: ${teamCode}\nCode sent to your email.`);
      
      // Navigate to leader dashboard
      navigate("/leader-dashboard");
    } catch (error) {
      alert("Something went wrong: " + error.message);
    }

    setLoading(false);
  };

  // Show loading while waiting for auth state
  if (authLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src={createTeamLogo} alt="Create Team" style={styles.logo} />
        <h2 style={styles.title}>Create Your Team</h2>
        <p style={styles.subtitle}>Set up your team and invite members</p>

        <form onSubmit={handleCreateTeam} style={styles.form}>
          <div style={styles.inputGroup}>
            <span style={styles.icon}>👤</span>
            <input
              type="text"
              placeholder="Leader Name"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <span style={styles.icon}>👥</span>
            <input
              type="text"
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.emailInfo}>
            <span style={styles.emailIcon}>📧</span>
            <span style={styles.emailText}>{user.email}</span>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating Team..." : "Create Team"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#FCF6D9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    background: "#fff",
    padding: "32px 28px",
    borderRadius: "20px",
    width: "360px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
    textAlign: "center",
  },
  logo: {
    width: "120px",
    height: "120px",
    marginBottom: "16px",
    objectFit: "contain",
  },
  title: {
    color: "#2b4f60",
    marginBottom: "6px",
    fontSize: "24px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#2b4f60",
    opacity: 0.75,
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #9CC6DB",
    borderRadius: "12px",
    padding: "8px 12px",
  },
  icon: {
    fontSize: "18px",
    marginRight: "8px",
    color: "#2b4f60",
  },
  input: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    backgroundColor: "transparent",
    color: "#2b4f60",
  },
  emailInfo: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: "12px",
    padding: "10px 12px",
  },
  emailIcon: {
    fontSize: "16px",
    marginRight: "8px",
  },
  emailText: {
    fontSize: "13px",
    color: "#666",
  },
  button: {
    width: "100%",
    marginTop: "8px",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#9CC6DB",
    color: "#fff",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
  },
  loadingText: {
    color: "#2b4f60",
    fontSize: "16px",
  },
};

export default CreateTeam;
