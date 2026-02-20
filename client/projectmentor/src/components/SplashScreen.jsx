import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/role-selection");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.container}>
      <img src={logo} alt="ProjectMentor Logo" style={styles.logo} />

      <h1 style={styles.title}>ProjectMentor</h1>
      <p style={styles.tagline}>AI Powered Student Project Platform</p>

      <div style={styles.loader}></div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    backgroundColor: "#FCF6D9", // single solid color
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  logo: {
    width: "120px",
    marginBottom: "18px",
    animation: "fadeIn 1.5s ease-in-out",
  },
  title: {
    fontSize: "34px",
    fontWeight: "600",
    color: "#2b4f60",
  },
  tagline: {
    fontSize: "14px",
    color: "#2b4f60",
    opacity: 0.85,
    marginBottom: "22px",
  },
  loader: {
    width: "40px",
    height: "40px",
    border: "4px solid #9CC6DB",
    borderTop: "4px solid #2b4f60",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default SplashScreen;
