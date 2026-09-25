# Smart Placement Portal 🎓✨

An AI-powered campus placement management system connecting **Students**, **Companies/Recruiters**, and the **Placement Cell (Admin/TPO)** with automated eligibility validation, AI resume scoring, and live interview pipeline tracking.

---

## 🚀 Key Features

### 1. Student Portal
- **Profile & Resume Builder**: Manage skills, CGPA, branch, batch, and resume text.
- **Open Drives Browser**: Automatically tagged with live eligibility status (`Eligible`, `CGPA Shortfall`, `Branch Mismatch`, `Backlog Cutoff`).
- **AI Resume Match & Gap Analysis**: Evaluates resume text against role job descriptions using **Gemini 3.8 Flash**, scoring compatibility (0–100) and highlighting matched vs. missing skills with customized improvement advice.
- **Multi-Stage Application Tracker**: Visual funnel (`Applied` → `Shortlisted` → `Interview` → `Selected` / `Rejected`) with interview links and scheduling notes.
- **Drive Discussion Forums**: Ask questions, read previous interview questions, and review recruiter guidelines per drive.

### 2. Recruiter & Company Portal
- **Drive Management**: Create multi-round drives with CTC, job descriptions, required skills, and strict eligibility thresholds (CGPA, allowed branches, max backlogs).
- **AI-Ranked Candidate Pipeline**: Applicants automatically ranked by AI resume match score and academic criteria (best matches first).
- **Interactive Interview Scheduler**: Schedule video interview calls with date, time, round type, and Google Meet links with instant candidate notifications.
- **Export Candidates**: Download applicant records with match scores and academic history to CSV.

### 3. Placement Cell (Admin / TPO)
- **Governance & Approvals**: Review and approve newly registered companies and job drives before they go live.
- **Analytics Dashboard**: Placement rate percentage, average and highest packages (LPA), department-wise placement metrics, and recruitment funnel analytics.
- **Student Master Directory**: Filterable by branch, CGPA, and placement status with pagination.
- **Bulk Import**: One-click import sample batch or upload custom CSV student records.
- **Report Exports**: Download full student placement records and summary reports to CSV.

### 4. AI Placement Copilot (Chatbot Widget)
- Floating assistant at the bottom-right corner answering queries regarding company rounds, eligibility cutoffs, resume advice, and campus placement cell policies.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express.js (`server.ts`)
- **Database**: MongoDB with Mongoose Schemas (`server/models.ts`) & auto-persistent seed engine (`database-seed.json`)
- **Authentication**: JWT-based authentication with role-based access control (`student` | `recruiter` | `admin`)
- **AI Engine**: Google GenAI SDK (`@google/genai` with `gemini-3.8-flash`)

---

## ⚡ Quick Demo Accounts (1-Click Switcher Available in UI)

You can switch personas directly using the **"Switch Role"** dropdown in the header or via the demo shortcuts:

| Role | Email | Password | Details |
|---|---|---|---|
| **Placement Cell (Admin/TPO)** | `tpo@campus.edu` | `admin123` | Full approvals queue & analytics |
| **Recruiter (Google)** | `recruiter@google.com` | `campus123` | Google SDE drive & candidates pipeline |
| **Recruiter (Microsoft)** | `careers@microsoft.com` | `campus123` | Microsoft Cloud drive & candidates pipeline |
| **Student (Priya Sharma)** | `priya.sharma@campus.edu` | `campus123` | Placed at Google (8.92 CGPA) |
| **Student (Rahul Verma)** | `rahul.verma@campus.edu` | `campus123` | CSE candidate (7.85 CGPA) interviewing at Atlassian |

---

## 📦 Local Setup & Development

1. **Clone repository and install packages**:
   ```bash
   npm install
   ```

2. **Environment Variables (`.env`)**:
   ```env
   PORT=3000
   JWT_SECRET="smart-placement-portal-secret-key-2026"
   GEMINI_API_KEY="your-gemini-api-key"
   # Optional: external MongoDB connection string (falls back to persistent local store if omitted)
   # MONGODB_URI="mongodb://localhost:27017/smart_placement_portal"
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 🗄️ Database Schema (Mongoose Collections)

Full schemas are defined in `server/models.ts`:

- **Users**: `_id, email, passwordHash, name, role ('student'|'recruiter'|'admin'), createdAt`
- **Students**: `_id, userId, name, email, rollNo, cgpa, branch, batch, backlogs, skills[], resumeText, isPlaced, placedCompany, placedPackage`
- **Companies**: `_id, userId, name, email, industry, logoUrl, website, description, verified`
- **Drives**: `_id, companyId, companyName, role, ctc, description, requiredSkills[], eligibility { cgpaMin, branches[], batch, backlogsAllowed }, rounds[], deadline, status ('pending'|'approved'|'rejected'|'closed')`
- **Applications**: `_id, studentId, studentName, studentRollNo, driveId, companyName, roleTitle, status, resumeScore, scoreBreakdown, appliedAt, currentRound, interviewDetails`
- **Notifications**: `_id, userId, title, message, type, read, createdAt`
- **ForumPosts**: `_id, driveId, authorName, authorRole, title, content, category, upvotes, replies[]`
