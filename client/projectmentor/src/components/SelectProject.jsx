import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const SelectProject = ({ onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teamInfo, setTeamInfo] = useState({ teamName: "", teamCode: "", leaderEmail: "" });
  const [formData, setFormData] = useState({
    domain: "",
    type: "",
    skillLevel: ""
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [lockingProject, setLockingProject] = useState(false);

  const domains = ["Healthcare", "Finance", "E-Commerce", "Banking", "Business", "Education"];
  const projectTypes = ["Mini Project", "Final Project", "Hackathon Project"];
  const skillLevels = ["Beginner", "Intermediate", "Advanced"];

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
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.domain || !formData.type || !formData.skillLevel) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/generate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: formData.domain,
          type: formData.type,
          skillLevel: formData.skillLevel,
          teamName: teamInfo.teamName,
          teamCode: teamInfo.teamCode,
          leaderId: user?.uid
        })
      });

      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
        setShowProjects(true);
      } else {
        alert(data.message || "Failed to generate projects");
      }
    } catch (error) {
      console.error("Error generating projects:", error);
      alert("Error generating projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleLockProject = async () => {
    if (!selectedProject) return;
    
    setLockingProject(true);
    try {
      console.log("Locking project with data:", {
        templateId: selectedProject.templateId,
        teamId: teamInfo.teamCode,
        projectName: selectedProject.title,
        domain: selectedProject.domain,
        type: selectedProject.type,
        skillLevel: selectedProject.skillLevel,
        problemStatement: selectedProject.problemStatement,
        proposedSolution: selectedProject.proposedSolution,
        keyFeatures: selectedProject.keyFeatures,
        leaderId: user?.uid,
        leaderEmail: user?.email,
        leaderName: user?.displayName || teamInfo.teamName,
        teamName: teamInfo.teamName
      });

      const response = await fetch("http://localhost:5000/lock-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedProject.templateId,
          teamId: teamInfo.teamCode,
          projectName: selectedProject.title,
          domain: selectedProject.domain,
          type: selectedProject.type,
          skillLevel: selectedProject.skillLevel,
          problemStatement: selectedProject.problemStatement,
          proposedSolution: selectedProject.proposedSolution,
          keyFeatures: selectedProject.keyFeatures,
          leaderId: user?.uid,
          leaderEmail: user?.email,
          leaderName: user?.displayName || teamInfo.teamName,
          teamName: teamInfo.teamName
        })
      });

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        console.error("Server returned error status:", response.status, response.statusText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Server returned non-JSON response:", contentType);
        throw new Error("Server returned invalid response format");
      }

      const data = await response.json();
      console.log("Lock project response:", data);
      
      if (data.success) {
        localStorage.setItem("selectedProject", JSON.stringify({
          ...selectedProject,
          _id: data.projectId,
          locked: true
        }));
        if (onClose) {
          onClose();
        } else {
          navigate("/leader-dashboard");
        }
      } else {
        console.error("Lock project failed:", data);
        alert(`Failed to lock project: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error locking project:", error);
      alert(`Error locking project: ${error.message || 'Please check server connection'}`);
    } finally {
      setLockingProject(false);
    }
  };

  const handleBackToList = () => {
    setSelectedProject(null);
    setShowProjectDetails(false);
  };

  const handleBack = () => {
    navigate("/leader-dashboard");
  };

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "0 0 0 0",
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        padding: "20px",
        width: "100%",
        height: "70vh",
        overflow: "hidden",
        maxWidth: "500px",
        margin: "0 auto"
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <button onClick={handleBack} style={{
            backgroundColor: "transparent", border: "none", color: "#2b4f60",
            fontSize: "14px", cursor: "pointer", marginBottom: "15px",
            display: "flex", alignItems: "center", gap: "6px"
          }}>
            ← Back to Dashboard
          </button>
          
          <h1 style={{ color: "#2b4f60", fontSize: "24px", fontWeight: "700", margin: "0 0 10px 0" }}>
            Select Project
          </h1>
          
          <div style={{ backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "8px", marginBottom: "15px" }}>
            <h3 style={{ color: "#2b4f60", fontSize: "16px", margin: "0 0 6px 0" }}>
              {teamInfo.teamName}
            </h3>
            <p style={{ color: "#666", fontSize: "12px", margin: "0" }}>
              Leader: {user?.email}
            </p>
          </div>
        </div>

        {!showProjects ? (
          <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "350px", margin: "0 auto" }}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", color: "#2b4f60", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                Domain *
              </label>
              <select name="domain" value={formData.domain} onChange={handleInputChange} required style={{
                width: "80%", padding: "8px 10px", border: "2px solid #e1e5e9",
                borderRadius: "6px", fontSize: "14px", backgroundColor: "#ffffff", cursor: "pointer",
                margin: "0 auto", display: "block"
              }}>
                <option value="">Select domain</option>
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", color: "#2b4f60", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                Project Type *
              </label>
              <select name="type" value={formData.type} onChange={handleInputChange} required style={{
                width: "80%", padding: "8px 10px", border: "2px solid #e1e5e9",
                borderRadius: "6px", fontSize: "14px", backgroundColor: "#ffffff", cursor: "pointer",
                margin: "0 auto", display: "block"
              }}>
                <option value="">Select type</option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#2b4f60", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                Skill Level *
              </label>
              <select name="skillLevel" value={formData.skillLevel} onChange={handleInputChange} required style={{
                width: "80%", padding: "8px 10px", border: "2px solid #e1e5e9",
                borderRadius: "6px", fontSize: "14px", backgroundColor: "#ffffff", cursor: "pointer",
                margin: "0 auto", display: "block"
              }}>
                <option value="">Select level</option>
                {skillLevels.map(level => (
                  <option key={level} value={level.toLowerCase()}>{level}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "80%", padding: "10px 16px", backgroundColor: loading ? "#ccc" : "#2b4f60",
              color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "14px",
              fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s ease",
              margin: "0 auto", display: "block"
            }}>
              {loading ? "Generating Projects..." : "Generate Projects"}
            </button>
          </form>
        ) : !showProjectDetails ? (
          <div>
            <h2 style={{ color: "#2b4f60", fontSize: "20px", fontWeight: "600", marginBottom: "24px", textAlign: "center" }}>
              Choose a Project
            </h2>
            
            {projects.map((project, index) => (
              <div key={index} onClick={() => handleProjectClick(project)} style={{
                backgroundColor: "#f8f9fa", border: "2px solid #e1e5e9", borderRadius: "12px",
                padding: "12px 16px", marginBottom: "10px", cursor: "pointer", transition: "all 0.3s ease",
                display: "flex", justifyContent: "space-between", alignItems: "center", width: "60%",
                margin: "0 auto 10px auto"
              }} onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#e9ecef";
                e.currentTarget.style.borderColor = "#2b4f60";
              }} onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.borderColor = "#e1e5e9";
              }}>
                <h3 style={{ color: "#2b4f60", fontSize: "16px", fontWeight: "600", margin: "0" }}>
                  {project.title}
                </h3>
                <span style={{ color: "#666", fontSize: "14px" }}>→</span>
              </div>
            ))}
            
            <button onClick={() => setShowProjects(false)} style={{
              width: "50%", padding: "11px 10px", backgroundColor: "transparent",
              color: "#2b4f60", border: "2px solid #2b4f60", borderRadius: "8px",
              fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s ease", 
              marginTop: "16px", margin: "0 auto", display: "block"
            }}>
              ← Back to Selection
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ color: "#2b4f60", fontSize: "18px", fontWeight: "600", marginBottom: "16px", textAlign: "center" }}>
              {selectedProject?.title}
            </h2>
            
            <div style={{ backgroundColor: "#f8f9fa", border: "2px solid #e1e5e9", borderRadius: "12px", padding: "8px", marginBottom: "8px", maxHeight: "25vh", overflow: "auto" }}>
              <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                <span style={{ backgroundColor: "#2b4f60", color: "#ffffff", padding: "3px 6px", borderRadius: "3px", fontSize: "10px" }}>
                  {selectedProject?.domain}
                </span>
                <span style={{ backgroundColor: "#6c757d", color: "#ffffff", padding: "3px 6px", borderRadius: "3px", fontSize: "10px" }}>
                  {selectedProject?.type}
                </span>
                <span style={{ backgroundColor: "#28a745", color: "#ffffff", padding: "3px 6px", borderRadius: "3px", fontSize: "10px" }}>
                  {selectedProject?.skillLevel}
                </span>
              </div>
              
              <div style={{ marginBottom: "8px" }}>
                <h4 style={{ color: "#2b4f60", fontSize: "12px", margin: "0 0 4px 0" }}>Problem Statement</h4>
                <p style={{ color: "#666", fontSize: "11px", margin: "0", lineHeight: "1.3" }}>
                  {selectedProject?.problemStatement}
                </p>
              </div>
              
              <div style={{ marginBottom: "8px" }}>
                <h4 style={{ color: "#2b4f60", fontSize: "12px", margin: "0 0 4px 0" }}>Proposed Solution</h4>
                <p style={{ color: "#666", fontSize: "11px", margin: "0", lineHeight: "1.3" }}>
                  {selectedProject?.proposedSolution}
                </p>
              </div>
              
              <div>
                <h4 style={{ color: "#2b4f60", fontSize: "12px", margin: "0 0 4px 0" }}>Key Features</h4>
                <ul style={{ color: "#666", fontSize: "11px", margin: "0", paddingLeft: "12px" }}>
                  {selectedProject?.keyFeatures?.map((feature, index) => (
                    <li key={index} style={{ marginBottom: "2px" }}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "3px", justifyContent: "center", marginTop: "6px" }}>
              <button onClick={handleBackToList} style={{
                padding: "3px 6px", backgroundColor: "transparent", color: "#2b4f60",
                border: "1px solid #2b4f60", borderRadius: "2px", fontSize: "10px",
                fontWeight: "600", cursor: "pointer", transition: "all 0.3s ease", width: "70px"
              }}>
                ← Back
              </button>
              <button onClick={handleLockProject} disabled={lockingProject} style={{
                padding: "3px 6px", backgroundColor: lockingProject ? "#ccc" : "#e74c3c",
                color: "#ffffff", border: "none", borderRadius: "2px", fontSize: "10px",
                fontWeight: "600", cursor: lockingProject ? "not-allowed" : "pointer", transition: "all 0.3s ease", width: "70px"
              }}>
                {lockingProject ? "Lock" : "Lock"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectProject;