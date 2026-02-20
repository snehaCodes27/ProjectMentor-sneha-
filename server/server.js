import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { projectTemplates } from "./projectTemplates.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "projectmentor",
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    
    // Start server only after MongoDB connects
    app.listen(5000, () => {
      console.log("Server running on port 5000");
      console.log("MongoDB team management system ready!");
    });
    
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.log("Starting server without MongoDB...");
    
    // Start server even if MongoDB fails
    app.listen(5000, () => {
      console.log("Server running on port 5000 (without MongoDB)");
    });
  });

// Mongoose schemas / models
const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  teamCode: { type: String, required: true, unique: true },
  leaderId: { type: String, required: true }, // Firebase UID or User ID
  leaderName: { type: String, required: true },
  leaderEmail: { type: String, required: true },
  members: [{
    name: { type: String, required: true },
    email: { type: String, required: true },
    uid: { type: String, required: true },
    joinedDate: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  domain: String, // healthcare, finance, etc.
  type: String, // mini project, final project, hackathon project
  skillLevel: String, // beginner, intermediate, advanced
  templateId: Number, // ID from projectTemplates for uniqueness per template
  projectName: String,
  description: String,
  roadmap: String, // initial roadmap / idea text
  detailedRoadmap: String, // extra roadmap text from template
  tasks: String, // task breakdown for team members
  summary: String, // PPT / viva summary
  vivaQA: String, // viva questions & answers
  locked: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Member request schema
const memberRequestSchema = new mongoose.Schema({
  teamName: String,
  teamCode: String,
  memberName: String,
  memberEmail: String,
  memberUid: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
});

const Team = mongoose.model("Team", teamSchema);
const Project = mongoose.model("Project", projectSchema);
const MemberRequest = mongoose.model("MemberRequest", memberRequestSchema);

// OpenAI client (kept for fallback, not used when Gemini is enabled)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

// Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ===== Prompt templates =====
// 1) Project Idea Prompt
function buildProjectIdeaPrompt({ domain, skills, projectType }) {
  return `You are an AI project mentor.
Suggest ONE unique and practical project idea for a student team.
Domain: ${domain}
Team Skills: ${skills || "not specified"}
Project Type: ${projectType}

Provide output in this format:

Project Title

Problem Statement

Proposed Solution

Key Features (5 points)`;
}

// 2) Roadmap Generation Prompt (for future use)
function buildRoadmapPrompt({ projectTitle }) {
  return `Act as a project planner.
Create a clear step-by-step roadmap for the following project:
${projectTitle}

Divide roadmap into:

Phase 1

Phase 2

Phase 3

Each phase should have clear tasks.`;
}

// 3) Task Breakdown Prompt (for future use)
function buildTaskBreakdownPrompt({ projectTitle, teamSize }) {
  return `You are a team management assistant.
Break the following project into small tasks for a student team.
Project: ${projectTitle}
Team Size: ${teamSize}

Give output as task list with difficulty level.`;
}

// 4) Project Summary Prompt (for future use)
function buildProjectSummaryPrompt({ projectTitle }) {
  return `Generate a simple and professional project summary for viva and presentation.
Project Title: ${projectTitle}

Include:

Objective

Technology Used

Expected Outcome

Real-world impact`;
}

// 5) Viva Question–Answer Prompt (for future use)
function buildVivaQAPrompt({ projectTitle }) {
  return `Act as a viva examiner.
Generate 5 important viva questions with answers for the project:
${projectTitle}

Keep answers short and easy to understand.`;
}

// Helper to generate mock project text when AI is unavailable
// Uses several templates and picks one randomly so suggestions feel varied
function buildMockProjectText({ domain, type, skills }) {
  const niceDomain = domain.charAt(0).toUpperCase() + domain.slice(1);
  const lowerDomain = domain.toLowerCase();
  const skillsText = skills || "React, Node.js, MongoDB";
  // Fallback level labels used only for old mock ideas
  const niceLevel = "Student";
  const lowerLevel = "student";

  const templates = [
    // 1) SkillSync-style project
    () => {
      const title = `${niceDomain} SkillSync – Smart ${type} Mentor for ${niceLevel} Teams`;
      return (
        `🧩 Project Title\n\n` +
        `${title}\n\n` +
        `📌 Problem Statement\n\n` +
        `Students often select ${lowerDomain} projects without checking whether their current skills and time are enough. ` +
        `This leads to incomplete work, low confidence in evaluations, especially when the team only knows: ${skillsText}.\n\n` +
        `💡 Proposed Solution\n\n` +
        `${title} helps a student team with skills [${skillsText}] choose the right ${type} idea by matching ` +
        `their skills with domain complexity and suggesting realistic project scope and improvement tips.\n\n` +
        `✨ Key Features (5 points)\n\n` +
        `1. Smart project recommendation based on team profile (skills, experience, interest).\n` +
        `2. Simple success score that shows how suitable the project is for the team skills.\n` +
        `3. Skill gap analysis with suggestions on what to learn beyond [${skillsText}].\n` +
        `4. Comparison between ${lowerDomain} domain difficulty and team capability.\n` +
        `5. Clear, explainable rules instead of complex black-box ML so students can justify decisions in viva.\n`
      );
    },

    // 2) Tracker / dashboard style project
    () => {
      const title = `${niceDomain} ProgressHub – Team Project Tracker for ${niceLevel} Learners`;
      return (
        `🧩 Project Title\n\n` +
        `${title}\n\n` +
        `📌 Problem Statement\n\n` +
        `Student teams start a ${lowerDomain} project but quickly lose track of tasks, deadlines and ownership. ` +
        `Leaders cannot see who is stuck, which causes last-minute rush and incomplete submissions.\n\n` +
        `💡 Proposed Solution\n\n` +
        `${title} provides a simple dashboard where a ${lowerLevel} team can plan tasks, assign work and ` +
        `visually track progress phase-wise until final submission.\n\n` +
        `✨ Key Features (5 points)\n\n` +
        `1. Kanban-style board for To‑Do / In‑Progress / Done tasks.\n` +
        `2. Per‑member workload view for the leader to balance tasks.\n` +
        `3. Milestone tracking for Phase 1 / Phase 2 / Phase 3.\n` +
        `4. Simple status reports that can be exported for faculty review.\n` +
        `5. Notifications / reminders for approaching deadlines.\n`
      );
    },

    // 3) Feedback / analytics style project
    () => {
      const title = `${niceDomain} InsightBoard – Feedback & Analytics for Student Projects`;
      return (
        `🧩 Project Title\n\n` +
        `${title}\n\n` +
        `📌 Problem Statement\n\n` +
        `Teams build ${lowerDomain} projects but rarely collect structured feedback from mentors, peers or users. ` +
        `As a result they do not know which features to improve before final evaluation.\n\n` +
        `💡 Proposed Solution\n\n` +
        `${title} lets a ${lowerLevel} team share their project demo and collect ratings and comments, ` +
        `then summarises the feedback into clear improvement points.\n\n` +
        `✨ Key Features (5 points)\n\n` +
        `1. Simple feedback form with ratings and short comments.\n` +
        `2. Auto-calculated scores per feature or module.\n` +
        `3. Highlight top 3 strengths and top 3 improvement areas.\n` +
        `4. Timeline view to see how feedback changes after each iteration.\n` +
        `5. Exportable summary that can be attached to report / PPT.\n`
      );
    },

    // 4) Learning roadmap helper
    () => {
      const title = `${niceDomain} RoadmapGuru – Learning Bridge for ${niceLevel} Project Teams`;
      return (
        `🧩 Project Title\n\n` +
        `${title}\n\n` +
        `📌 Problem Statement\n\n` +
        `Students with skills [${skillsText}] want to do a ${lowerDomain} ${type}, but they are confused about what to learn first ` +
        `and how to connect theory with the actual project.\n\n` +
        `💡 Proposed Solution\n\n` +
        `${title} creates a step‑by‑step learning checklist linked to the project milestones so that ` +
        `students study only what is needed and apply it immediately.\n\n` +
        `✨ Key Features (5 points)\n\n` +
        `1. Phase‑wise learning topics mapped to the project plan.\n` +
        `2. Simple “Done / Not Done” tracker for each concept.\n` +
        `3. Suggestions of mini‑tasks to practise new topics.\n` +
        `4. Highlight of critical concepts that must not be skipped.\n` +
        `5. Final readiness checklist for viva and demo.\n`
      );
    },
  ];

  const idx = Math.floor(Math.random() * templates.length);
  return templates[idx]();
}

// Mock helpers for other prompts
function buildMockRoadmapText({ projectTitle }) {
  return `Phase 1\n- Understand the problem statement for: ${projectTitle}.\n- Finalize tech stack and basic UI wireframes.\n- Create Git repo and basic project structure.\n\nPhase 2\n- Implement core features and connect to MongoDB.\n- Add basic validations and error handling.\n- Test main flows with sample data.\n\nPhase 3\n- Polish UI and fix bugs.\n- Add small extra feature as enhancement.\n- Prepare final demo, documentation and PPT.`;
}

function buildMockTasksText({ projectTitle, teamSize }) {
  return `Project: ${projectTitle}\nTeam Size: ${teamSize}\n\nExample tasks:\n- Research similar systems and list 5 key ideas (easy).\n- Design database schema and API endpoints (medium).\n- Build main UI screens and navigation (medium).\n- Implement backend APIs and connect MongoDB (medium).\n- Write tests, fix bugs and prepare demo (hard).`;
}

function buildMockSummaryText({ projectTitle }) {
  return `Objective: Build a working prototype of ${projectTitle} that helps students practice real-world concepts.\n\nTechnology Used: MERN stack (MongoDB, Express, React, Node.js) and basic UI libraries.\n\nExpected Outcome: A small but complete application that covers end-to-end flow, from UI to database.\n\nReal-world impact: Students understand how real systems are designed and can extend this project into internships, hackathons or final year work.`;
}

function buildMockVivaText({ projectTitle }) {
  return `1) What problem does ${projectTitle} solve?\nShort answer: It solves a specific real-world problem in a simple and practical way for users.\n\n2) Why did you choose MongoDB for this project?\nShort answer: MongoDB is easy to use with JavaScript, flexible with documents and good for quick prototyping.\n\n3) Explain the overall architecture of your system.\nShort answer: We use React for frontend, Node/Express for backend and MongoDB for data, connected via REST APIs.\n\n4) What was the most difficult part of this project?\nShort answer: Designing clean data models and handling edge cases in main flows.\n\n5) If you had more time, what would you improve?\nShort answer: Add more advanced features, improve UI/UX and write more automated tests.`;
}

// Small helpers to map UI values to template values
function normalizeDomain(rawDomain) {
  if (!rawDomain) return "General";
  const d = rawDomain.toLowerCase();
  if (d === "healthcare") return "Healthcare";
  if (d === "finance") return "Finance";
  if (d === "ecommerce") return "E-Commerce";
  if (d === "banking") return "Banking";
  if (d === "business") return "Business";
  return rawDomain;
}

function normalizeType(rawType) {
  if (!rawType) return "Mini Project";
  const t = rawType.toLowerCase();
  if (t.includes("mini")) return "Mini Project";
  if (t.includes("final")) return "Final Project";
  if (t.includes("hackathon")) return "Hackathon Project";
  return rawType;
}

function normalizeSkillLevel(rawLevel) {
  const l = (rawLevel || "beginner").toLowerCase();
  if (l === "beginner" || l === "intermediate" || l === "advanced") return l;
  return "beginner";
}

function pickTemplate({ domain, type, skillLevel }) {
  const normalizedDomain = normalizeDomain(domain);
  const normalizedType = normalizeType(type);
  const level = normalizeSkillLevel(skillLevel);

  // Filter templates matching domain + type + level tag
  const candidates = projectTemplates.filter((tpl) => {
    const hasLevelTag = (tpl.skillsTags || []).some(
      (tag) => tag.toLowerCase() === level
    );
    return (
      tpl.domain.toLowerCase() === normalizedDomain.toLowerCase() &&
      tpl.type.toLowerCase() === normalizedType.toLowerCase() &&
      hasLevelTag
    );
  });

  return { normalizedDomain, normalizedType, level, candidates };
}

// Email API
app.post("/send-team-code", async (req, res) => {
  const { leaderEmail, leaderName, teamName, teamCode } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ProjectMentor" <${process.env.EMAIL_USER}>`,
      to: leaderEmail,
      subject: "Your Team Code - ProjectMentor",
      html: `
        <h2>Hello ${leaderName} 👋</h2>
        <p>Your team <b>${teamName}</b> has been created successfully.</p>
        <h3>Team Code: <b>${teamCode}</b></h3>
        <p>Share this code with your team members.</p>
        <br/>
        <p>– ProjectMentor</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate project API (DB templates as AI)
app.post("/generate-project", async (req, res) => {
  try {
    console.log("/generate-project body", req.body);

    const { domain, type, skillLevel, teamName, teamCode, leaderId } = req.body;

    const safeTeamName = teamName || "My Team";
    const safeTeamCode = teamCode || "XXXXXX";

    const { normalizedDomain, normalizedType, level, candidates } = pickTemplate({
      domain,
      type,
      skillLevel,
    });

    if (!candidates.length) {
      return res.status(400).json({
        success: false,
        message: "No templates available for this domain / type / level.",
      });
    }

    // Find or create the team
    let team = await Team.findOne({ teamCode: safeTeamCode });
    if (!team) {
      team = await Team.create({
        teamName: safeTeamName,
        teamCode: safeTeamCode,
        leaderId: leaderId || null,
      });
    }

    // Avoid giving the same template to multiple teams
    const candidateIds = candidates.map((c) => c._id);
    const used = await Project.find({
      domain: normalizedDomain,
      type: normalizedType,
      templateId: { $in: candidateIds },
    }).select("templateId");

    const usedIds = new Set(used.map((p) => p.templateId));
    const available = candidates.filter((c) => !usedIds.has(c._id));

    if (!available.length) {
      return res.status(400).json({
        success: false,
        message: "All templates for this combination are already used by other teams.",
      });
    }

    // Select 3 random projects (or all if less than 3 available)
    const selectedProjects = [];
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const projectCount = Math.min(3, shuffled.length);
    
    for (let i = 0; i < projectCount; i++) {
      const chosen = shuffled[i];
      selectedProjects.push({
        templateId: chosen._id,
        title: chosen.title,
        problemStatement: chosen.problemStatement,
        proposedSolution: chosen.proposedSolution,
        keyFeatures: chosen.keyFeatures || [],
        domain: normalizedDomain,
        type: normalizedType,
        skillLevel: level,
      });
    }

    return res.status(200).json({
      success: true,
      projects: selectedProjects
    });
  } catch (error) {
    console.error("/generate-project error", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Generate detailed roadmap for a project (from stored template text)
app.post("/projects/:id/roadmap", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const text = project.detailedRoadmap || project.roadmap || "";
    return res.status(200).json({ success: true, roadmap: text });
  } catch (error) {
    console.error("/projects/:id/roadmap error", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Task breakdown for team members (from stored template text)
app.post("/projects/:id/tasks", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const text = project.tasks || "";
    return res.status(200).json({ success: true, tasks: text });
  } catch (error) {
    console.error("/projects/:id/tasks error", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Project summary for PPT / Viva (from stored template text)
app.post("/projects/:id/summary", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const text = project.summary || "";
    return res.status(200).json({ success: true, summary: text });
  } catch (error) {
    console.error("/projects/:id/summary error", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Viva questions & answers (from stored template text)
app.post("/projects/:id/viva-qa", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const text = project.vivaQA || "";
    return res.status(200).json({ success: true, vivaQA: text });
  } catch (error) {
    console.error("/projects/:id/viva-qa error", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});
// Lock project and send email
app.post("/lock-project", async (req, res) => {
  try {
    const {
      templateId, teamId, projectName, domain, type, skillLevel,
      problemStatement, proposedSolution, keyFeatures,
      leaderId, leaderEmail, leaderName, teamName
    } = req.body;

    // Find or create team
    let team = await Team.findOne({ teamCode: teamId });
    if (!team) {
      team = await Team.create({
        teamName: teamName,
        teamCode: teamId,
        leaderIds: leaderId.toString()
      });
    } else {
      // Append new leader ID to existing ones
      const existingLeaderIds = team.leaderIds ? team.leaderIds.split(',').map(id => id.trim()) : [];
      if (!existingLeaderIds.includes(leaderId.toString())) {
        existingLeaderIds.push(leaderId.toString());
        team.leaderIds = existingLeaderIds.join(', ');
        await team.save();
      }
    }

    // Create project in database
    const project = await Project.create({
      teamId: team._id,
      domain: domain,
      type: type,
      skillLevel: skillLevel,
      templateId: templateId,
      projectName: projectName,
      description: `${problemStatement}\n\n${proposedSolution}`,
      roadmap: "Project roadmap will be generated",
      detailedRoadmap: "Detailed roadmap will be generated",
      tasks: "Tasks will be assigned",
      summary: "Project summary will be generated",
      vivaQA: "Viva questions will be generated",
      locked: true
    });

    // Send email to leader
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ProjectMentor" <${process.env.EMAIL_USER}>`,
      to: leaderEmail,
      subject: "Project Selected - ProjectMentor",
      html: `
        <h2>Hello ${leaderName}!</h2>
        <p>Your team <strong>${teamName}</strong> has selected the project:</p>
        <h3>${projectName}</h3>
        <p><strong>Domain:</strong> ${domain}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Skill Level:</strong> ${skillLevel}</p>
        <p><strong>Problem Statement:</strong> ${problemStatement}</p>
        <p><strong>Proposed Solution:</strong> ${proposedSolution}</p>
        <p>Congratulations! Your project is now locked and ready to start.</p>
        <p>Best regards,<br>ProjectMentor Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ 
      success: true, 
      projectId: project._id,
      message: "Project locked successfully and email sent"
    });

  } catch (error) {
    console.error("/lock-project error", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ===== TEAM MANAGEMENT API ENDPOINTS =====

// Test endpoint
app.get("/test", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Server is working!",
    timestamp: new Date().toISOString()
  });
});

// Create/Update team
app.post("/teams", async (req, res) => {
  try {
    const { leaderId, teamName, teamCode, leaderEmail, leaderName } = req.body;
    
    // Check if team already exists
    const existingTeam = await Team.findOne({ teamCode });
    if (existingTeam) {
      return res.status(400).json({ success: false, error: "Team code already exists" });
    }
    
    const team = new Team({
      leaderId,
      teamName,
      teamCode,
      leaderEmail,
      leaderName,
      members: [] // Initialize with empty members array
    });
    
    await team.save();
    return res.status(201).json({ success: true, team });
    
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get team by code
app.get("/teams/:teamCode", async (req, res) => {
  try {
    const { teamCode } = req.params;
    const team = await Team.findOne({ teamCode });
    
    if (!team) {
      return res.status(404).json({ success: false, error: "Team not found" });
    }
    
    return res.status(200).json({ success: true, team });
    
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Submit member join request
app.post("/member-requests", async (req, res) => {
  try {
    const { teamName, teamCode, memberName, memberEmail, memberUid } = req.body;
    
    console.log("=== DEBUG: Member request received:", { teamName, teamCode, memberName, memberEmail, memberUid });
    
    // Mock response for testing
    const mockRequest = {
      _id: 'mock-' + Date.now(),
      teamName,
      teamCode,
      memberName,
      memberEmail,
      memberUid,
      timestamp: new Date().toISOString(),
      status: "pending"
    };
    
    console.log("=== DEBUG: Created mock request:", mockRequest);
    
    return res.status(201).json({ success: true, request: mockRequest });
    
  } catch (error) {
    console.error("=== DEBUG: Error in member-requests POST:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get pending member requests for a team
app.get("/member-requests/:teamCode", async (req, res) => {
  try {
    const { teamCode } = req.params;
    console.log("=== DEBUG: Getting member requests for teamCode:", teamCode);
    
    // Mock response for testing
    const mockRequests = [
      {
        _id: 'mock-1',
        teamName: 'vns',
        teamCode: teamCode,
        memberName: 'SNEHA',
        memberEmail: 'snehamatkar3@gmail.com',
        memberUid: 'pending-' + Date.now(),
        timestamp: new Date().toISOString(),
        status: "pending"
      }
    ];
    
    console.log("=== DEBUG: Returning mock requests:", mockRequests);
    
    return res.status(200).json({ success: true, requests: mockRequests });
    
  } catch (error) {
    console.error("=== DEBUG: Error in member-requests GET:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/// Accept member request
// Reject member request
app.put("/member-requests/:requestId/reject", async (req, res) => {
  try {
    const { requestId } = req.params;
    console.log("=== DEBUG: Rejecting member request:", requestId);
    
    let request;
    if (requestId.startsWith('mock-')) {
      request = {
        _id: requestId,
        teamName: 'vns',
        teamCode: 'Q1XY04',
        memberName: 'SNEHA',
        memberEmail: 'snehamatkar3@gmail.com',
        memberUid: 'pending-' + Date.now(),
        status: 'pending'
      };
    } else {
      try {
        request = await MemberRequest.findById(requestId);
      } catch (err) {
        console.log("MongoDB not available, using mock");
        request = {
          _id: requestId,
          teamName: 'vns',
          teamCode: 'Q1XY04',
          memberName: 'SNEHA',
          memberEmail: 'snehamatkar3@gmail.com',
          memberUid: 'pending-' + Date.now(),
          status: 'pending'
        };
      }
    }
    
    if (!request) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }
    
    request.status = "rejected";
    
    console.log("=== DEBUG: Member rejected:", request.memberName);
    
    return res.status(200).json({ success: true, message: "Member rejected successfully" });
    
  } catch (error) {
    console.error("=== DEBUG: Error in reject endpoint:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Remove team member
app.delete("/teams/:teamCode/members/:memberUid", async (req, res) => {
  try {
    const { teamCode, memberUid } = req.params;
    
    const team = await Team.findOne({ teamCode });
    if (!team) {
      return res.status(404).json({ success: false, error: "Team not found" });
    }
    
    // Remove member from team
    const updatedTeam = await Team.findOneAndUpdate(
      { teamCode },
      { 
        $pull: { members: { uid: memberUid } },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );
    
    if (!updatedTeam) {
      return res.status(404).json({ success: false, error: "Member not found in team" });
    }
    
    return res.status(200).json({ success: true, message: "Member removed from team" });
    
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Server started in MongoDB connection handler above
