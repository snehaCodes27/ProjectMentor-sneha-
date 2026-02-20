import { useNavigate } from "react-router-dom";
import leaderImg from "../assets/leader.png";
import memberImg from "../assets/member.png";

const RoleSelect = () => {
  const navigate = useNavigate();

  const handleLeaderClick = () => {
    console.log("Leader card clicked");
    navigate("/leader-register");
  };

  const handleMemberClick = () => {
    console.log("Member card clicked");
    navigate("/join-team");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Select Your Role</h2>
      <p style={styles.subtext}>Choose how you want to continue</p>

      <div style={styles.cardWrapper}>
        {/* Leader Card */}
        <div
          style={styles.card}
          onClick={handleLeaderClick}
        >
          <img 
            src={leaderImg} 
            alt="Team Leader" 
            style={styles.image}
            onError={(e) => {
              console.error("Leader image failed to load:", e);
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <div style={{ fontSize: "48px", marginBottom: "14px", display: 'none' }}>👑</div>
          <h3 style={styles.cardTitle}>Team Leader</h3>
          <p style={styles.cardText}>
            Create team, manage members & projects
          </p>
        </div>

        {/* Member Card */}
        <div
          style={styles.card}
          onClick={handleMemberClick}
        >
          <img 
            src={memberImg} 
            alt="Team Member" 
            style={styles.image}
            onError={(e) => {
              console.error("Member image failed to load:", e);
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <div style={{ fontSize: "48px", marginBottom: "14px", display: 'none' }}>👥</div>
          <h3 style={styles.cardTitle}>Team Member</h3>
          <p style={styles.cardText}>
            Join team using code & collaborate
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#FCF6D9",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    textAlign: "center",
  },
  heading: {
    fontSize: "28px",
    color: "#2b4f60",
    marginBottom: "6px",
  },
  subtext: {
    fontSize: "14px",
    color: "#2b4f60",
    opacity: 0.8,
    marginBottom: "30px",
  },
  cardWrapper: {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    width: "260px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    transition: "transform 0.3s ease",
  },
  image: {
    width: "100%",
    height: "160px",
    objectFit: "contain",
    marginBottom: "14px",
  },
  cardTitle: {
    fontSize: "20px",
    color: "#2b4f60",
    marginBottom: "6px",
  },
  cardText: {
    fontSize: "13px",
    color: "#475569",
  },
};

export default RoleSelect;
