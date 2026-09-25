import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface ResumeScoreResult {
  score: number;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
  summary: string;
}

export interface JobMatchRecommendation {
  driveId: string;
  role: string;
  companyName: string;
  ctc: number;
  matchScore: number;
  reasons: string[];
  eligibilityStatus: 'eligible' | 'ineligible';
  eligibilityDetails: string;
}

// -------------------------------------------------------------
// 1. Resume Scoring & Gap Analysis
// -------------------------------------------------------------
export async function analyzeAndScoreResume(
  resumeText: string,
  jobDescription: string,
  requiredSkills: string[],
  roleTitle: string,
  companyName: string
): Promise<ResumeScoreResult> {
  if (aiClient) {
    try {
      const prompt = `You are a Senior Technical Recruiter & Campus Placement Evaluation Engine.
Analyze the following student resume against the job description for the role "${roleTitle}" at "${companyName}".

Required skills specified by company:
${requiredSkills.join(', ')}

Job Description:
${jobDescription}

Student Resume:
${resumeText}

Evaluate carefully and return ONLY a valid JSON object matching this schema without any markdown backticks or commentary:
{
  "score": <number between 40 and 99 reflecting match quality>,
  "matchPercentage": <number between 40 and 99>,
  "matchedSkills": [<strings of skills found in both>],
  "missingSkills": [<strings of critical skills required in JD that are missing or weak in resume>],
  "strengths": [<2-3 concise strong points about the candidate for this role>],
  "recommendations": [<2-3 actionable improvements for the candidate's resume/interview preparation for this role>],
  "summary": "<1-2 sentence executive assessment of fit>"
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (typeof parsed.score === 'number') {
        return {
          score: Math.min(100, Math.max(10, Math.round(parsed.score))),
          matchPercentage: Math.min(100, Math.max(10, Math.round(parsed.matchPercentage || parsed.score))),
          matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
          missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          summary: parsed.summary || 'Strong candidate alignment with core requirements.',
        };
      }
    } catch (err) {
      console.warn('[AI] Gemini resume scoring fallback used:', err);
    }
  }

  // Fallback intelligent heuristic scoring
  const cleanResume = resumeText.toLowerCase();
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  requiredSkills.forEach((skill) => {
    const sLower = skill.toLowerCase();
    if (cleanResume.includes(sLower)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const skillCoverage = requiredSkills.length > 0 ? matchedSkills.length / requiredSkills.length : 0.7;
  const baseScore = Math.round(45 + skillCoverage * 45 + Math.min(10, cleanResume.length > 300 ? 8 : 4));
  const score = Math.min(96, Math.max(50, baseScore));

  return {
    score,
    matchPercentage: score,
    matchedSkills: matchedSkills.length > 0 ? matchedSkills : [requiredSkills[0] || 'Problem Solving'],
    missingSkills: missingSkills.length > 0 ? missingSkills : ['Advanced System Scale'],
    strengths: [
      `Demonstrated proficiency in ${matchedSkills.slice(0, 3).join(', ') || 'core concepts'}`,
      'Solid project foundations aligning with role responsibilities',
    ],
    recommendations: [
      missingSkills.length > 0
        ? `Highlight hands-on projects featuring ${missingSkills.slice(0, 2).join(' and ')}`
        : 'Add quantifiable metrics to existing project bullet points (e.g., latency, users, throughput)',
      'Prepare for deep-dive technical design questions related to distributed scale',
    ],
    summary: `Candidate matches ${Math.round(skillCoverage * 100)}% of required tech stack with notable project strengths in ${matchedSkills[0] || 'engineering'}.`,
  };
}

// -------------------------------------------------------------
// 2. Chatbot placement advisor
// -------------------------------------------------------------
export async function answerPlacementQuery(
  question: string,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [],
  contextData?: { studentName?: string; branch?: string; cgpa?: number; drivesCount?: number }
): Promise<string> {
  const systemInstruction = `You are "Placement Copilot", the friendly, authoritative AI placement assistant at Smart Placement Portal.
You assist campus students and recruiters with:
1. Eligibility Rules (CGPA cutoffs, allowed branches, backlog policies).
2. Campus Placement Procedures (Aptitude -> GD -> Technical Interview -> HR Round).
3. Resume preparation and actionable tips to boost ATS & recruiter match scores.
4. Interview prep strategies for top tech companies (Google, Microsoft, Atlassian, Goldman Sachs).
5. Placement cell policies: One student one offer rule, Dream vs Super-Dream tier rules, dress code, and interview ethics.

Context details:
${contextData ? JSON.stringify(contextData) : 'General student inquiry'}

Keep your response direct, structured, polite, and helpful with bullet points where appropriate. Keep answers under 180 words for readability.`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...chatHistory,
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nUser Question: ${question}` }],
          },
        ],
        config: {
          temperature: 0.3,
        },
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('[AI] Gemini Chatbot fallback used:', err);
    }
  }

  // Fallback Rule-Based FAQ Engine
  const q = question.toLowerCase();

  if (q.includes('eligib') || q.includes('cgpa') || q.includes('cutoff')) {
    return `**Eligibility & Cutoff Criteria Guidelines:**
- **Google SDE:** Minimum 8.0 CGPA, Branches: CSE, IT, ECE, 0 active backlogs.
- **Microsoft Cloud:** Minimum 7.5 CGPA, Branches: CSE, IT, ECE, EE, 0 active backlogs.
- **Atlassian Dev:** Minimum 7.0 CGPA, Branches: CSE, IT, ECE, ME, 0 active backlogs.
- **Goldman Sachs Tech:** Minimum 7.5 CGPA, All branches, Up to 1 active backlog allowed.
- You can filter jobs dynamically under the **"Eligible For You"** tab in your dashboard!`;
  }

  if (q.includes('resume') || q.includes('score') || q.includes('ats')) {
    return `**How to Boost Your AI Resume Score:**
1. **Match Required Keywords:** Include exact technologies mentioned in the JD (e.g. React, Go, Docker, SQL).
2. **Use the X-Y-Z Formula:** "Accomplished [X] as measured by [Y], by doing [Z]" (e.g., *Reduced latency by 35% through Redis caching*).
3. **Run the AI Analyzer:** Click **"AI Resume Match"** on any drive card to view your missing skills and custom tips before applying!`;
  }

  if (q.includes('round') || q.includes('interview') || q.includes('process')) {
    return `**Standard Campus Recruitment Rounds:**
1. **Online Assessment (OA):** 2-3 algorithmic problems (arrays, strings, trees, dynamic programming) + MCQs.
2. **Technical Round 1:** Live coding, data structures, and project architecture explanation.
3. **Technical Round 2 / System Design:** Concurrency, scalability, databases, and microservices.
4. **HR & Leadership:** Behavioral fit, conflict resolution, company values (e.g., Googleyness, Atlassian Values).`;
  }

  if (q.includes('deadline') || q.includes('date') || q.includes('schedule')) {
    return `**Upcoming Drive Deadlines:**
- **Google SDE:** Oct 15, 2026 (Coding Round: Oct 18)
- **Microsoft Cloud:** Oct 20, 2026
- **Atlassian Full-Stack:** Oct 25, 2026
- **Goldman Sachs:** Nov 05, 2026
Make sure your profile and resume are updated at least 24 hours prior to drive closing!`;
  }

  return `Hello! I am your Smart Placement Copilot. You can ask me anything about:
• Eligibility cutoffs & backlog allowances
• Company-specific interview rounds (Google, Microsoft, Atlassian, Goldman Sachs)
• Resume scoring tips and gap analysis
• Placement cell regulations & interview prep guidance!`;
}

// -------------------------------------------------------------
// 3. Smart Job Matching for Student Profile
// -------------------------------------------------------------
export async function matchJobsForStudent(
  student: {
    skills: string[];
    cgpa: number;
    branch: string;
    backlogs: number;
    batch: number;
    resumeText?: string;
  },
  drives: any[]
): Promise<JobMatchRecommendation[]> {
  const recommendations: JobMatchRecommendation[] = [];

  for (const drive of drives) {
    if (drive.status !== 'approved') continue;

    // Check Eligibility
    const cgpaOk = student.cgpa >= drive.eligibility.cgpaMin;
    const branchOk = drive.eligibility.branches.includes(student.branch) || drive.eligibility.branches.includes('All Engineering Branches');
    const backlogOk = student.backlogs <= drive.eligibility.backlogsAllowed;
    const isEligible = cgpaOk && branchOk && backlogOk;

    let eligibilityDetails = 'Fully Eligible';
    if (!isEligible) {
      const issues: string[] = [];
      if (!cgpaOk) issues.push(`CGPA required: ${drive.eligibility.cgpaMin} (You: ${student.cgpa})`);
      if (!branchOk) issues.push(`Branch not accepted`);
      if (!backlogOk) issues.push(`Backlogs exceed limit (Allowed: ${drive.eligibility.backlogsAllowed})`);
      eligibilityDetails = issues.join(' · ');
    }

    // Calculate skill overlap
    const studentSkillsLower = student.skills.map((s) => s.toLowerCase());
    const required = drive.requiredSkills || [];
    let matchedCount = 0;
    const matchedNames: string[] = [];

    required.forEach((r: string) => {
      if (studentSkillsLower.some((s) => s.includes(r.toLowerCase()) || r.toLowerCase().includes(s))) {
        matchedCount++;
        matchedNames.push(r);
      }
    });

    const skillRatio = required.length > 0 ? matchedCount / required.length : 0.5;
    const cgpaBonus = Math.min(15, (student.cgpa - drive.eligibility.cgpaMin) * 8);

    let matchScore = Math.round(skillRatio * 75 + cgpaBonus + (isEligible ? 10 : -20));
    matchScore = Math.min(98, Math.max(30, matchScore));

    const reasons: string[] = [];
    if (matchedNames.length > 0) {
      reasons.push(`Strong overlap in ${matchedNames.slice(0, 3).join(', ')}`);
    }
    if (student.cgpa >= drive.eligibility.cgpaMin + 0.5) {
      reasons.push(`CGPA (${student.cgpa}) comfortably satisfies ${drive.eligibility.cgpaMin} cutoff`);
    }
    if (isEligible) {
      reasons.push(`Target role for ${student.branch} graduates`);
    } else {
      reasons.push(`Requires meeting criteria: ${eligibilityDetails}`);
    }

    recommendations.push({
      driveId: drive._id,
      role: drive.role,
      companyName: drive.companyName,
      ctc: drive.ctc,
      matchScore,
      reasons,
      eligibilityStatus: isEligible ? 'eligible' : 'ineligible',
      eligibilityDetails,
    });
  }

  // Sort descending by matchScore
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  return recommendations.slice(0, 5);
}
