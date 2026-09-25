import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.ts';
import { analyzeAndScoreResume, answerPlacementQuery, matchJobsForStudent } from './ai.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smart-placement-portal-secret-key-2026';

// Extend Express Request
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'student' | 'recruiter' | 'admin';
    name: string;
  };
}

// -------------------------------------------------------------
// Authentication Middleware
// -------------------------------------------------------------
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(allowedRoles: ('student' | 'recruiter' | 'admin')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized: insufficient role permissions' });
    }
    next();
  };
}

// Helper to generate token
function generateToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// -------------------------------------------------------------
// 1. Auth Routes
// -------------------------------------------------------------

// Quick Demo Login
router.post('/auth/demo-login', (req: Request, res: Response) => {
  const { role } = req.body; // 'student' | 'recruiter' | 'admin'

  let user: any = null;
  if (role === 'admin') {
    user = db.findUserByEmail('tpo@campus.edu');
  } else if (role === 'recruiter') {
    user = db.findUserByEmail('recruiter@google.com');
  } else {
    user = db.findUserByEmail('priya.sharma@campus.edu') || db.findUserByEmail('rahul.verma@campus.edu');
  }

  if (!user) {
    return res.status(404).json({ error: 'Demo user not found' });
  }

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const studentProfile = user.role === 'student' ? db.getStudentByUserId(user._id) : null;
  const companyProfile = user.role === 'recruiter' ? db.getCompanyByUserId(user._id) : null;

  return res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    studentProfile,
    companyProfile,
  });
});

// Login
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const studentProfile = user.role === 'student' ? db.getStudentByUserId(user._id) : null;
  const companyProfile = user.role === 'recruiter' ? db.getCompanyByUserId(user._id) : null;

  return res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    studentProfile,
    companyProfile,
  });
});

// Register
router.post('/auth/register', (req: Request, res: Response) => {
  const { email, password, name, role, details } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Missing required registration fields' });
  }

  if (db.findUserByEmail(email)) {
    return res.status(400).json({ error: 'Email is already registered' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = db.createUser({
    email,
    passwordHash,
    name,
    role,
  });

  let studentProfile = null;
  let companyProfile = null;

  if (role === 'student') {
    studentProfile = db.createStudent({
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
      rollNo: details?.rollNo || '22CS' + Math.floor(1000 + Math.random() * 9000),
      cgpa: Number(details?.cgpa) || 7.5,
      branch: details?.branch || 'Computer Science',
      batch: Number(details?.batch) || 2026,
      backlogs: Number(details?.backlogs) || 0,
      skills: Array.isArray(details?.skills) ? details.skills : ['C++', 'Python', 'SQL'],
      resumeText: details?.resumeText || `Name: ${name}\nBranch: ${details?.branch || 'Computer Science'}\nKey Skills: ${details?.skills?.join(', ') || 'Software Development'}`,
    });
  } else if (role === 'recruiter') {
    companyProfile = db.createCompany({
      userId: newUser._id,
      name: details?.companyName || name,
      email: newUser.email,
      industry: details?.industry || 'Technology & Software',
      website: details?.website || '',
      description: details?.description || 'Campus hiring team.',
      verified: false, // Requires admin approval
    });

    // Notify Admin of new recruiter registration
    const admin = db.findUserByEmail('tpo@campus.edu');
    if (admin) {
      db.createNotification({
        userId: admin._id,
        title: 'New Company Pending Approval',
        message: `${companyProfile.name} registered and requested verification.`,
        type: 'system',
      });
    }
  }

  const token = generateToken({
    id: newUser._id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
  });

  return res.status(201).json({
    token,
    user: {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
    studentProfile,
    companyProfile,
  });
});

// Current User Profile
router.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = db.findUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const studentProfile = user.role === 'student' ? db.getStudentByUserId(user._id) : null;
  const companyProfile = user.role === 'recruiter' ? db.getCompanyByUserId(user._id) : null;

  return res.json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    studentProfile,
    companyProfile,
  });
});

// -------------------------------------------------------------
// 2. Drives Routes
// -------------------------------------------------------------

// Get Drives (all or filtered by status)
router.get('/drives', (req: Request, res: Response) => {
  const { status, companyId } = req.query;
  let drives = db.getAllDrives(status as string | undefined);
  if (companyId) {
    drives = drives.filter((d) => d.companyId === companyId);
  }
  return res.json(drives);
});

// Get Single Drive
router.get('/drives/:id', (req: Request, res: Response) => {
  const drive = db.getDriveById(req.params.id);
  if (!drive) {
    return res.status(404).json({ error: 'Drive not found' });
  }
  return res.json(drive);
});

// Create Drive (Recruiter)
router.post('/drives', authenticateToken, requireRole(['recruiter', 'admin']), (req: AuthRequest, res: Response) => {
  const company = db.getCompanyByUserId(req.user!.id);
  const {
    role,
    ctc,
    description,
    requiredSkills,
    eligibility,
    rounds,
    deadline,
    openings,
    location,
  } = req.body;

  if (!role || !ctc || !description) {
    return res.status(400).json({ error: 'Role, CTC, and description are required' });
  }

  const newDrive = db.createDrive({
    companyId: company ? company._id : 'comp_custom',
    companyName: company ? company.name : req.user!.name,
    companyLogo: company?.logoUrl,
    role,
    ctc: Number(ctc),
    description,
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    eligibility: {
      cgpaMin: Number(eligibility?.cgpaMin) || 6.5,
      branches: Array.isArray(eligibility?.branches) ? eligibility.branches : ['Computer Science', 'Information Technology'],
      batch: Number(eligibility?.batch) || 2026,
      backlogsAllowed: Number(eligibility?.backlogsAllowed) || 0,
    },
    rounds: Array.isArray(rounds) && rounds.length > 0 ? rounds : [
      { name: 'Online Assessment', description: 'Coding & Aptitude Test', order: 1 },
      { name: 'Technical Round', description: 'Core Engineering & Problem Solving', order: 2 },
      { name: 'HR / Values', description: 'Culture & Behavioral Interview', order: 3 },
    ],
    deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    openings: Number(openings) || 5,
    location: location || 'Bangalore / Remote',
    // If admin posted it, auto-approve; otherwise pending
    status: req.user!.role === 'admin' ? 'approved' : 'pending',
  });

  // Notify admin if pending
  if (newDrive.status === 'pending') {
    const admin = db.findUserByEmail('tpo@campus.edu');
    if (admin) {
      db.createNotification({
        userId: admin._id,
        title: 'New Drive Pending Approval',
        message: `${newDrive.companyName} submitted a drive for "${newDrive.role}" (${newDrive.ctc} LPA).`,
        type: 'drive',
      });
    }
  }

  return res.status(201).json(newDrive);
});

// Update Drive Status (Admin approval or Recruiter closing)
router.patch('/drives/:id/status', authenticateToken, (req: AuthRequest, res: Response) => {
  const { status } = req.body; // 'approved' | 'rejected' | 'closed'
  const drive = db.getDriveById(req.params.id);

  if (!drive) {
    return res.status(404).json({ error: 'Drive not found' });
  }

  if (req.user!.role !== 'admin') {
    const company = db.getCompanyByUserId(req.user!.id);
    if (!company || company._id !== drive.companyId) {
      return res.status(403).json({ error: 'Unauthorized to update this drive' });
    }
  }

  const updated = db.updateDrive(req.params.id, { status });

  // Notify company recruiter if approved
  if (status === 'approved') {
    const comp = db.getCompanyById(drive.companyId);
    if (comp) {
      db.createNotification({
        userId: comp.userId,
        title: 'Drive Approved by TPO',
        message: `Your drive for "${drive.role}" has been approved and is now live for students.`,
        type: 'drive',
      });
    }
  }

  return res.json(updated);
});

// -------------------------------------------------------------
// 3. Applications Routes
// -------------------------------------------------------------

// Student submits an application
router.post('/applications', authenticateToken, requireRole(['student']), async (req: AuthRequest, res: Response) => {
  const { driveId } = req.body;
  const student = db.getStudentByUserId(req.user!.id);

  if (!student) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  const drive = db.getDriveById(driveId);
  if (!drive) {
    return res.status(404).json({ error: 'Drive not found' });
  }

  // Check if already applied
  const existing = db.getApplicationsByStudentId(student._id).find((a) => a.driveId === driveId);
  if (existing) {
    return res.status(400).json({ error: 'You have already applied to this drive', application: existing });
  }

  // Analyze Resume with AI
  const resumeScoreResult = await analyzeAndScoreResume(
    student.resumeText || `Student: ${student.name}\nBranch: ${student.branch}\nSkills: ${student.skills.join(', ')}`,
    drive.description,
    drive.requiredSkills,
    drive.role,
    drive.companyName
  );

  const application = db.createApplication({
    studentId: student._id,
    studentName: student.name,
    studentEmail: student.email,
    studentRollNo: student.rollNo,
    studentBranch: student.branch,
    studentCgpa: student.cgpa,
    studentSkills: student.skills,
    driveId: drive._id,
    companyName: drive.companyName,
    roleTitle: drive.role,
    status: 'Applied',
    resumeScore: resumeScoreResult.score,
    scoreBreakdown: {
      matchPercentage: resumeScoreResult.matchPercentage,
      matchedSkills: resumeScoreResult.matchedSkills,
      missingSkills: resumeScoreResult.missingSkills,
      strengths: resumeScoreResult.strengths,
      feedback: resumeScoreResult.summary,
    },
    currentRound: drive.rounds?.[0]?.name || 'Application Received',
  });

  // Notify student
  db.createNotification({
    userId: req.user!.id,
    title: `Applied to ${drive.companyName}`,
    message: `Your application for ${drive.role} was submitted successfully. AI Match Score: ${resumeScoreResult.score}/100.`,
    type: 'application',
  });

  return res.status(201).json(application);
});

// Get Applications for current student
router.get('/applications/student', authenticateToken, requireRole(['student']), (req: AuthRequest, res: Response) => {
  const student = db.getStudentByUserId(req.user!.id);
  if (!student) {
    return res.json([]);
  }
  const apps = db.getApplicationsByStudentId(student._id);
  return res.json(apps);
});

// Get Applications for a Drive (Recruiter / Admin)
router.get('/applications/drive/:driveId', authenticateToken, requireRole(['recruiter', 'admin']), (req: AuthRequest, res: Response) => {
  const apps = db.getApplicationsByDriveId(req.params.driveId);
  // Sort by AI resume score descending (Best match first)
  apps.sort((a, b) => (b.resumeScore || 0) - (a.resumeScore || 0));
  return res.json(apps);
});

// Update Application Status & Rounds (Recruiter / Admin)
router.patch('/applications/:id/status', authenticateToken, requireRole(['recruiter', 'admin']), (req: AuthRequest, res: Response) => {
  const { status, currentRound, feedbackNotes } = req.body;
  const app = db.getApplicationById(req.params.id);

  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const updated = db.updateApplication(req.params.id, {
    status,
    ...(currentRound && { currentRound }),
    ...(feedbackNotes && { feedbackNotes }),
  });

  // If status is Selected, mark student as placed in student table
  if (status === 'Selected') {
    const student = db.getStudentById(app.studentId);
    const drive = db.getDriveById(app.driveId);
    if (student && drive) {
      db.updateStudent(student._id, {
        isPlaced: true,
        placedCompany: drive.companyName,
        placedPackage: drive.ctc,
      });
    }
  }

  // Notify the student
  const student = db.getStudentById(app.studentId);
  if (student) {
    db.createNotification({
      userId: student.userId,
      title: `Application Status Updated: ${app.companyName}`,
      message: `Your status for ${app.roleTitle} is now: ${status} (${currentRound || status}).`,
      type: 'application',
    });
  }

  return res.json(updated);
});

// Schedule Interview (Recruiter)
router.post('/applications/:id/schedule', authenticateToken, requireRole(['recruiter', 'admin']), (req: AuthRequest, res: Response) => {
  const { date, time, roundName, meetLink, notes } = req.body;
  const app = db.getApplicationById(req.params.id);

  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const updated = db.updateApplication(req.params.id, {
    status: 'Interview',
    currentRound: roundName || 'Interview Scheduled',
    interviewDetails: {
      date,
      time,
      roundName,
      meetLink: meetLink || 'https://meet.google.com/campus-interview',
      notes,
    },
  });

  // Notify the student
  const student = db.getStudentById(app.studentId);
  if (student) {
    db.createNotification({
      userId: student.userId,
      title: `Interview Scheduled: ${app.companyName}`,
      message: `${roundName} scheduled on ${date} at ${time}. Link: ${meetLink || 'Google Meet'}`,
      type: 'interview',
    });
  }

  return res.json(updated);
});

// -------------------------------------------------------------
// 4. Students Directory & Profile
// -------------------------------------------------------------

// Get All Students (Admin only)
router.get('/students', authenticateToken, requireRole(['admin']), (_req: Request, res: Response) => {
  const students = db.getAllStudents();
  return res.json(students);
});

// Update Student Profile
router.patch('/students/profile', authenticateToken, requireRole(['student']), (req: AuthRequest, res: Response) => {
  const student = db.getStudentByUserId(req.user!.id);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found' });
  }

  const { cgpa, branch, batch, backlogs, skills, resumeText, phone } = req.body;
  const updated = db.updateStudent(student._id, {
    ...(cgpa !== undefined && { cgpa: Number(cgpa) }),
    ...(branch && { branch }),
    ...(batch && { batch: Number(batch) }),
    ...(backlogs !== undefined && { backlogs: Number(backlogs) }),
    ...(skills && { skills }),
    ...(resumeText !== undefined && { resumeText }),
    ...(phone && { phone }),
  });

  return res.json(updated);
});

// Bulk Import Students (Admin)
router.post('/students/bulk-import', authenticateToken, requireRole(['admin']), (req: Request, res: Response) => {
  const { students } = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'Students array is required' });
  }

  const imported = db.bulkImportStudents(students);
  return res.json({
    message: `Successfully imported ${imported.length} students.`,
    count: imported.length,
    students: imported,
  });
});

// -------------------------------------------------------------
// 5. Companies Management
// -------------------------------------------------------------

router.get('/companies', authenticateToken, requireRole(['admin']), (_req: Request, res: Response) => {
  const companies = db.getAllCompanies();
  return res.json(companies);
});

router.patch('/companies/:id/verify', authenticateToken, requireRole(['admin']), (req: Request, res: Response) => {
  const { verified } = req.body;
  const company = db.verifyCompany(req.params.id, Boolean(verified));
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }

  // Notify recruiter
  db.createNotification({
    userId: company.userId,
    title: verified ? 'Company Account Verified' : 'Company Verification Status Updated',
    message: verified
      ? 'Congratulations! Your company account has been verified by the Placement Cell. You can now post recruitment drives.'
      : 'Your company verification status was updated by Admin.',
    type: 'system',
  });

  return res.json(company);
});

// -------------------------------------------------------------
// 6. Analytics Dashboard
// -------------------------------------------------------------

router.get('/analytics', (_req: Request, res: Response) => {
  const stats = db.getAnalytics();
  return res.json(stats);
});

// -------------------------------------------------------------
// 7. Forum & Reviews per Drive
// -------------------------------------------------------------

router.get('/forum/:driveId', (req: Request, res: Response) => {
  const posts = db.getForumPostsByDriveId(req.params.driveId);
  return res.json(posts);
});

router.post('/forum/:driveId', authenticateToken, (req: AuthRequest, res: Response) => {
  const { title, content, category } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const post = db.createForumPost({
    driveId: req.params.driveId,
    authorId: req.user!.id,
    authorName: req.user!.name,
    authorRole: req.user!.role.toUpperCase(),
    title,
    content,
    category: category || 'general',
  });

  return res.status(201).json(post);
});

router.post('/forum/reply/:postId', authenticateToken, (req: AuthRequest, res: Response) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Reply content is required' });
  }

  const reply = db.replyToForumPost(req.params.postId, {
    authorId: req.user!.id,
    authorName: req.user!.name,
    authorRole: req.user!.role.toUpperCase(),
    content,
  });

  if (!reply) {
    return res.status(404).json({ error: 'Post not found' });
  }

  return res.status(201).json(reply);
});

router.post('/forum/upvote/:postId', authenticateToken, (req: AuthRequest, res: Response) => {
  const updated = db.upvoteForumPost(req.params.postId, req.user!.id);
  if (!updated) {
    return res.status(404).json({ error: 'Post not found' });
  }
  return res.json(updated);
});

// -------------------------------------------------------------
// 8. Notifications
// -------------------------------------------------------------

router.get('/notifications', authenticateToken, (req: AuthRequest, res: Response) => {
  const notifs = db.getNotificationsByUserId(req.user!.id);
  return res.json(notifs);
});

router.patch('/notifications/:id/read', authenticateToken, (req: Request, res: Response) => {
  const notif = db.markNotificationAsRead(req.params.id);
  return res.json(notif || { success: true });
});

// -------------------------------------------------------------
// 9. AI Services Endpoints
// -------------------------------------------------------------

// Placement Chatbot
router.post('/ai/chat', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const student = req.user!.role === 'student' ? db.getStudentByUserId(req.user!.id) : null;
  const reply = await answerPlacementQuery(
    message,
    Array.isArray(history) ? history : [],
    student ? { studentName: student.name, branch: student.branch, cgpa: student.cgpa } : undefined
  );

  return res.json({ reply });
});

// Resume Scorer & Analyzer
router.post('/ai/resume-score', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { driveId, resumeText } = req.body;
  const drive = db.getDriveById(driveId);

  if (!drive) {
    return res.status(404).json({ error: 'Drive not found' });
  }

  let textToAnalyze = resumeText;
  if (!textToAnalyze && req.user!.role === 'student') {
    const student = db.getStudentByUserId(req.user!.id);
    textToAnalyze = student?.resumeText || '';
  }

  if (!textToAnalyze || textToAnalyze.trim().length === 0) {
    textToAnalyze = `Skills: React, Node.js, Python, SQL, Git, Problem Solving.`;
  }

  const analysis = await analyzeAndScoreResume(
    textToAnalyze,
    drive.description,
    drive.requiredSkills,
    drive.role,
    drive.companyName
  );

  return res.json(analysis);
});

// Smart Job Recommendations
router.get('/ai/recommendations', authenticateToken, requireRole(['student']), async (req: AuthRequest, res: Response) => {
  const student = db.getStudentByUserId(req.user!.id);
  if (!student) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  const activeDrives = db.getAllDrives('approved');
  const recommendations = await matchJobsForStudent(student, activeDrives);

  return res.json(recommendations);
});

export default router;
