import { Schema, Document } from 'mongoose';

// -------------------------------------------------------------
// Core Data Interfaces & Mongoose Document Types
// -------------------------------------------------------------

export interface IUser {
  _id?: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'student' | 'recruiter' | 'admin';
  createdAt: Date | string;
}

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

export const UserSchema = new Schema<IUserDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'recruiter', 'admin'], required: true },
  createdAt: { type: Date, default: Date.now },
});

export interface IStudent {
  _id?: string;
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
  createdAt: Date | string;
}

export interface IStudentDocument extends Omit<IStudent, '_id'>, Document {}

export const StudentSchema = new Schema<IStudentDocument>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rollNo: { type: String, required: true, unique: true },
  cgpa: { type: Number, required: true, min: 0, max: 10 },
  branch: { type: String, required: true },
  batch: { type: Number, required: true },
  backlogs: { type: Number, default: 0 },
  skills: [{ type: String }],
  resumeText: { type: String, default: '' },
  resumeUrl: { type: String },
  phone: { type: String },
  isPlaced: { type: Boolean, default: false },
  placedCompany: { type: String },
  placedPackage: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export interface ICompany {
  _id?: string;
  userId: string;
  name: string;
  email: string;
  industry: string;
  logoUrl: string;
  website?: string;
  description?: string;
  verified: boolean;
  createdAt: Date | string;
}

export interface ICompanyDocument extends Omit<ICompany, '_id'>, Document {}

export const CompanySchema = new Schema<ICompanyDocument>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  industry: { type: String, required: true },
  logoUrl: { type: String, default: '' },
  website: { type: String },
  description: { type: String },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export interface IDriveRound {
  name: string;
  description: string;
  order: number;
}

export interface IDriveEligibility {
  cgpaMin: number;
  branches: string[];
  batch: number;
  backlogsAllowed: number;
}

export interface IDrive {
  _id?: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  role: string;
  ctc: number; // in LPA
  description: string;
  requiredSkills: string[];
  eligibility: IDriveEligibility;
  rounds: IDriveRound[];
  deadline: string;
  status: 'pending' | 'approved' | 'rejected' | 'closed';
  openings: number;
  location: string;
  createdAt: Date | string;
}

export interface IDriveDocument extends Omit<IDrive, '_id'>, Document {}

export const DriveSchema = new Schema<IDriveDocument>({
  companyId: { type: String, required: true, index: true },
  companyName: { type: String, required: true },
  companyLogo: { type: String },
  role: { type: String, required: true },
  ctc: { type: Number, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  eligibility: {
    cgpaMin: { type: Number, default: 6.0 },
    branches: [{ type: String }],
    batch: { type: Number, default: 2026 },
    backlogsAllowed: { type: Number, default: 0 },
  },
  rounds: [
    {
      name: { type: String, required: true },
      description: { type: String },
      order: { type: Number, required: true },
    },
  ],
  deadline: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'closed'], default: 'pending' },
  openings: { type: Number, default: 5 },
  location: { type: String, default: 'Bangalore / Remote' },
  createdAt: { type: Date, default: Date.now },
});

export interface IApplication {
  _id?: string;
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

export interface IApplicationDocument extends Omit<IApplication, '_id'>, Document {}

export const ApplicationSchema = new Schema<IApplicationDocument>({
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentRollNo: { type: String, required: true },
  studentBranch: { type: String, required: true },
  studentCgpa: { type: Number, required: true },
  studentSkills: [{ type: String }],
  driveId: { type: String, required: true, index: true },
  companyName: { type: String, required: true },
  roleTitle: { type: String, required: true },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
    default: 'Applied',
  },
  resumeScore: { type: Number, default: 0 },
  appliedAt: { type: String, default: () => new Date().toISOString() },
  currentRound: { type: String, default: 'Application Submitted' },
  interviewDetails: {
    date: String,
    time: String,
    roundName: String,
    meetLink: String,
    notes: String,
  },
  feedbackNotes: String,
});

export interface IForumPost {
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

export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'drive' | 'system' | 'interview';
  read: boolean;
  link?: string;
  createdAt: string;
}
