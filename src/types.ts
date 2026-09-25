export type UserRole = 'student' | 'recruiter' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface StudentProfile {
  _id: string;
  userId: string;
  name: string;
  email: string;
  rollNo: string;
  cgpa: number;
  branch: string;
  batch: number;
  backlogs: number;
  skills: string[];
  resumeText: string;
  resumeUrl?: string;
  phone?: string;
  isPlaced: boolean;
  placedCompany?: string;
  placedPackage?: number;
  createdAt: string;
}

export interface CompanyProfile {
  _id: string;
  userId: string;
  name: string;
  email: string;
  industry: string;
  logoUrl: string;
  website?: string;
  description?: string;
  verified: boolean;
  createdAt: string;
}

export interface DriveRound {
  name: string;
  description: string;
  order: number;
}

export interface DriveEligibility {
  cgpaMin: number;
  branches: string[];
  batch: number;
  backlogsAllowed: number;
}

export interface Drive {
  _id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  role: string;
  ctc: number; // in LPA
  description: string;
  requiredSkills: string[];
  eligibility: DriveEligibility;
  rounds: DriveRound[];
  deadline: string;
  status: 'pending' | 'approved' | 'rejected' | 'closed';
  openings: number;
  location: string;
  createdAt: string;
}

export interface Application {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRollNo: string;
  studentBranch: string;
  studentCgpa: number;
  studentSkills: string[];
  driveId: string;
  companyName: string;
  roleTitle: string;
  status: 'Applied' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
  resumeScore: number;
  scoreBreakdown?: {
    matchPercentage: number;
    matchedSkills: string[];
    missingSkills: string[];
    strengths: string[];
    feedback: string;
  };
  appliedAt: string;
  currentRound: string;
  interviewDetails?: {
    date: string;
    time: string;
    roundName: string;
    meetLink: string;
    notes?: string;
  };
  feedbackNotes?: string;
}

export interface ForumPost {
  id: string;
  driveId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  category: 'interview-prep' | 'eligibility' | 'general' | 'previous-questions';
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
  replies: {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    content: string;
    createdAt: string;
  }[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'drive' | 'system' | 'interview';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AnalyticsData {
  overview: {
    totalStudents: number;
    placedCount: number;
    placementRate: number;
    avgPackageLPA: string;
    highestPackageLPA: string;
    totalDrives: number;
    activeDrives: number;
    pendingDrives: number;
    totalApplications: number;
  };
  funnel: {
    applied: number;
    shortlisted: number;
    interview: number;
    selected: number;
  };
  departmentData: {
    branch: string;
    total: number;
    placed: number;
    placementRate: number;
    avgCgpa: string;
  }[];
  recentDrives: Drive[];
}

export interface ResumeScoreAnalysis {
  score: number;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
  summary: string;
}

export interface JobRecommendation {
  driveId: string;
  role: string;
  companyName: string;
  ctc: number;
  matchScore: number;
  reasons: string[];
  eligibilityStatus: 'eligible' | 'ineligible';
  eligibilityDetails: string;
}
