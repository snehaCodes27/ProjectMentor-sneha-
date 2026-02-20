import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

const LeaderRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: form.name,
      });

      // Show success message and navigate
      setSuccess(true);
      setLoading(false);
      
      setTimeout(() => {
        navigate("/create-team", { replace: true });
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      alert(`Registration failed: ${error.message}`);
      setLoading(false);
    }
  };

  // Show success message
  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.title}>Registration Successful!</h2>
          <p style={styles.subtitle}>Redirecting to create team...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Leader Account</h2>
        <p style={styles.subtitle}>
          Start your team & manage projects
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <span style={styles.icon}>👤</span>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <span style={styles.icon}>📧</span>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <span style={styles.icon}>🔒</span>
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register as Leader"}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <span style={styles.link} onClick={() => navigate('/leader-login')}>Login</span>
        </p>
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
  successIcon: {
    fontSize: "48px",
    textAlign: "center",
    marginBottom: "16px",
  },
  card: {
    width: "360px",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "32px 28px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
  },
  title: {
    textAlign: "center",
    color: "#2b4f60",
    marginBottom: "6px",
    fontSize: "24px",
  },
  subtitle: {
    textAlign: "center",
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
    transition: "border-color 0.3s",
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
  button: {
    width: "100%",
    marginTop: "10px",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#9CC6DB",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#7fb3cc",
  },
  footerText: {
    marginTop: "18px",
    fontSize: "13px",
    textAlign: "center",
    color: "#2b4f60",
  },
  link: {
    color: "#9CC6DB",
    cursor: "pointer",
    fontWeight: "600",
    textDecoration: "underline",
  },
};

export default LeaderRegister;