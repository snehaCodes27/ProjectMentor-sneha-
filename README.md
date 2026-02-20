# 🚀 Project Mentor — AI Powered Student Project Assistant

## 📌 Overview

**Project Mentor** is an AI-powered web application designed to guide students through the complete academic project lifecycle.
From selecting a project idea to preparing for the final viva, the system provides structured assistance using a **Large Language Model (Grok AI)**.

Many students struggle with where to start, how to write documentation, and how to prepare presentations.
Project Mentor acts as a smart academic assistant that helps them step-by-step.

---

## 🎯 Problem Statement

Students often face difficulties during academic projects:

* Unable to choose a proper project domain or topic
* Confusion in writing synopsis and documentation
* Lack of research guidance
* Difficulty preparing presentations
* Fear of viva questions

They spend hours searching different websites and still do not get structured guidance.

---

## 💡 Solution

Project Mentor provides an intelligent assistant where a student can enter queries in natural language.
The system processes the prompt and generates academic-oriented responses using the Grok AI LLM.

It helps students with:

* Project topic suggestions
* Documentation writing
* Research paper structure
* PPT preparation
* Viva question practice

---

## 🧠 How It Works

1. User enters a query in the web interface
2. The request is sent to the backend server
3. Backend forwards the prompt to the Grok AI API
4. The LLM processes the prompt using NLP
5. A structured response is generated
6. The response is displayed to the user in real time

---

## 🛠️ Tech Stack

**Frontend**

* React.js
* HTML
* CSS
* JavaScript

**Backend**

* Node.js
* Express.js
* REST API

**AI Integration**

* Grok AI (LLM API)

---

## ✨ Features

* 📚 Domain & Project Idea Recommendation
* 📝 Synopsis / Abstract Generator
* 📄 Documentation Assistance (Problem Statement, Objectives, Methodology)
* 📊 Presentation (PPT) Guidance
* 🎓 Viva Question Generator
* 🤖 Natural Language Question Answering

---

## 🖥️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone  https://github.com/snehaCodes27/ProjectMentor-sneha-.git
cd project-mentor
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside backend folder and add:

```
GROK_API_KEY=your_api_key_here
PORT=5000
```

Start backend:

```bash
npm start
```

### 3️⃣ Frontend Setup

Open new terminal:

```bash
cd frontend
npm install
npm start
```

The application will run on:

```
http://localhost:3000
```

---

## 📸 Future Improvements

* User login & history tracking
* Personalized suggestions based on branch
* Downloadable documentation (PDF/Word)
* Multi-language support

---

## 👩‍💻 Author

**Sneha Matkar**
B.E. Information Technology Student

---

## 📄 License

This project is created for academic and learning purposes.
