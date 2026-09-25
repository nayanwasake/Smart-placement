import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import {
  IUser,
  IStudent,
  ICompany,
  IDrive,
  IApplication,
  IForumPost,
  INotification,
} from './models.ts';

// In-Memory & File-Persistent Store
// Allows running out-of-the-box without requiring an external MongoDB server,
// while preserving state and providing complete MongoDB/Mongoose schemas.

interface DatabaseState {
  users: (IUser & { _id: string })[];
  students: (IStudent & { _id: string })[];
  companies: (ICompany & { _id: string })[];
  drives: (IDrive & { _id: string })[];
  applications: (IApplication & { _id: string })[];
  forumPosts: IForumPost[];
  notifications: INotification[];
}

const DATA_FILE = path.resolve(process.cwd(), 'database-seed.json');

class DatabaseService {
  private state: DatabaseState = {
    users: [],
    students: [],
    companies: [],
    drives: [],
    applications: [],
    forumPosts: [],
    notifications: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.state = JSON.parse(raw);
        console.log('[DB] Loaded existing data from storage.');
        return;
      } catch (err) {
        console.error('[DB] Failed reading cache file, resetting with seed data.', err);
      }
    }
    this.seedInitialData();
    this.persist();
  }

  public persist() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed persisting database to file', err);
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('campus123', salt);
    const adminPasswordHash = bcrypt.hashSync('admin123', salt);

    // 1. Users
    const adminUser = {
      _id: 'user_admin_1',
      email: 'tpo@campus.edu',
      passwordHash: adminPasswordHash,
      name: 'Dr. Aris Thorne (TPO Head)',
      role: 'admin' as const,
      createdAt: new Date('2025-01-10'),
    };

    const googleUser = {
      _id: 'user_recruiter_google',
      email: 'recruiter@google.com',
      passwordHash: defaultPasswordHash,
      name: 'Google University Talent',
      role: 'recruiter' as const,
      createdAt: new Date('2025-01-12'),
    };

    const msftUser = {
      _id: 'user_recruiter_msft',
      email: 'careers@microsoft.com',
      passwordHash: defaultPasswordHash,
      name: 'Microsoft Campus Hiring',
      role: 'recruiter' as const,
      createdAt: new Date('2025-01-14'),
    };

    const atlassianUser = {
      _id: 'user_recruiter_atlassian',
      email: 'jobs@atlassian.com',
      passwordHash: defaultPasswordHash,
      name: 'Atlassian People Team',
      role: 'recruiter' as const,
      createdAt: new Date('2025-01-15'),
    };

    const innovUser = {
      _id: 'user_recruiter_innov',
      email: 'talent@innovatex.io',
      passwordHash: defaultPasswordHash,
      name: 'InnovateX Labs Hiring',
      role: 'recruiter' as const,
      createdAt: new Date('2025-02-01'),
    };

    // 10 Student Users
    const studentSeedList = [
      {
        id: 'user_student_1',
        name: 'Priya Sharma',
        email: 'priya.sharma@campus.edu',
        rollNo: '22CS1042',
        cgpa: 8.92,
        branch: 'Computer Science',
        batch: 2026,
        backlogs: 0,
        isPlaced: true,
        placedCompany: 'Google',
        placedPackage: 42.5,
        skills: ['React', 'TypeScript', 'Node.js', 'Go', 'Distributed Systems', 'Data Structures', 'PostgreSQL', 'Docker'],
        resumeText: `PRIYA SHARMA | Computer Science Engineering (Batch 2026) | CGPA: 8.92
Email: priya.sharma@campus.edu | Phone: +91 98765 43210 | GitHub: github.com/priyasharma
EDUCATION: B.Tech in CSE, Apex Institute of Technology (2022-2026)
TECHNICAL SKILLS:
- Languages: TypeScript, Go, C++, Python, SQL
- Technologies: React, Node.js, Express, Docker, Kubernetes, GraphQL, Redis
PROJECTS:
1. Distributed Cache System: Designed a high-throughput in-memory caching daemon in Go supporting LRU eviction and consistent hashing across nodes.
2. Real-time Collaboration Board: Multi-user whiteboard using React, WebSockets, and Canvas API with conflict-free replicated data types (CRDT).
INTERNSHIP: Summer Analyst at FinTech Corp - optimized indexing query latency by 34%.`,
      },
      {
        id: 'user_student_2',
        name: 'Rahul Verma',
        email: 'rahul.verma@campus.edu',
        rollNo: '22CS1077',
        cgpa: 7.85,
        branch: 'Computer Science',
        batch: 2026,
        backlogs: 0,
        isPlaced: false,
        skills: ['Java', 'Spring Boot', 'MySQL', 'React', 'Microservices', 'REST APIs', 'AWS'],
        resumeText: `RAHUL VERMA | Computer Science Engineering | CGPA: 7.85
Email: rahul.verma@campus.edu | LinkedIn: linkedin.com/in/rahul-verma
TECHNICAL SKILLS: Java, Spring Boot, Hibernate, React, MySQL, Docker, RESTful APIs, Git
EXPERIENCE & PROJECTS:
- E-Commerce Microservices: Built order and payment handling services using Spring Cloud, Eureka, and RabbitMQ.
- Campus Lost & Found: Full-stack portal in React and Express with image recognition.
ACTIVITIES: Core Member of Campus Developer Student Club.`,
      },
      {
        id: 'user_student_3',
        name: 'Ananya Deshmukh',
        email: 'ananya.d@campus.edu',
        rollNo: '22IT1019',
        cgpa: 8.45,
        branch: 'Information Technology',
        batch: 2026,
        backlogs: 0,
        isPlaced: true,
        placedCompany: 'Microsoft',
        placedPackage: 38.0,
        skills: ['Python', 'Azure', 'C#', '.NET Core', 'Machine Learning', 'FastAPI', 'Pandas', 'Kubernetes'],
        resumeText: `ANANYA DESHMUKH | Information Technology (Batch 2026) | CGPA: 8.45
SKILLS: C#, .NET Core, Python, PyTorch, Azure Cloud Services, PostgreSQL, Linux
PROJECTS:
- Intelligent Document Retrieval: Vector search engine leveraging Azure OpenAI and embedding spaces for campus research papers.
- Smart Traffic Monitoring: Computer vision pipeline analyzing CCTV feeds for congestion alerts.
ACHIEVEMENTS: Winner, National Cloud Hackathon 2025.`,
      },
      {
        id: 'user_student_4',
        name: 'Rohan Mehta',
        email: 'rohan.m@campus.edu',
        rollNo: '22EC1031',
        cgpa: 7.20,
        branch: 'Electronics & Communication',
        batch: 2026,
        backlogs: 0,
        isPlaced: false,
        skills: ['Embedded C', 'IoT', 'Python', 'C++', 'Microcontrollers', 'MQTT', 'Hardware Debugging'],
        resumeText: `ROHAN MEHTA | Electronics & Communication | CGPA: 7.20
SKILLS: C/C++, Embedded Linux, FreeRTOS, Python, MQTT, PCB Design, I2C/SPI
PROJECTS:
- Industrial IoT Telemetry Node: Low-power environmental sensor transmitting data over LoRaWAN.
- Autonomous Obstacle Rover: Arduino and STM32 based robotic platform with ultrasonic mapping.`,
      },
      {
        id: 'user_student_5',
        name: 'Sneha Patel',
        email: 'sneha.patel@campus.edu',
        rollNo: '22CS1090',
        cgpa: 9.35,
        branch: 'Computer Science',
        batch: 2026,
        backlogs: 0,
        isPlaced: false,
        skills: ['Algorithms', 'C++', 'System Design', 'Python', 'React', 'Linux', 'Distributed Systems'],
        resumeText: `SNEHA PATEL | Computer Science Engineering | CGPA: 9.35 (Rank 2)
COMPETITIVE PROGRAMMING: Candidate Master on Codeforces (Rating 1980), LeetCode Knight (Top 1%).
TECHNICAL SKILLS: Advanced Algorithms, C++, Concurrency, System Architecture, Go, React.
PROJECTS:
- Distributed Key-Value Store implementing Raft consensus protocol.
- High Performance HTTP Load Balancer in C++ with epoll.`,
      },
      {
        id: 'user_student_6',
        name: 'Amit Kumar',
        email: 'amit.k@campus.edu',
        rollNo: '22ME1008',
        cgpa: 6.80,
        branch: 'Mechanical Engineering',
        batch: 2026,
        backlogs: 1,
        isPlaced: false,
        skills: ['Python', 'Data Analysis', 'AutoCAD', 'SolidWorks', 'MATLAB', 'SQL'],
        resumeText: `AMIT KUMAR | Mechanical Engineering | CGPA: 6.80 | Backlogs: 1
SKILLS: Python, Pandas, SQL, CAD Modeling, Finite Element Analysis, Operations Research.
PROJECTS:
- Predictive Maintenance Model for Industrial HVAC equipment using sensor telemetry.
- Formula Student Chassis Design and stress analysis.`,
      },
      {
        id: 'user_student_7',
        name: 'Divya Nair',
        email: 'divya.nair@campus.edu',
        rollNo: '22IT1055',
        cgpa: 7.95,
        branch: 'Information Technology',
        batch: 2026,
        backlogs: 0,
        isPlaced: false,
        skills: ['JavaScript', 'React', 'TailwindCSS', 'Next.js', 'Node.js', 'MongoDB', 'UI/UX Design'],
        resumeText: `DIVYA NAIR | Information Technology | CGPA: 7.95
SKILLS: React, Next.js, TypeScript, Tailwind CSS, Redux Toolkit, Figma, Web Performance
PROJECTS:
- Healthcare Appointment & Teleconsultation Web App with Stripe integration.
- Analytics Dashboard for Student Clubs with responsive data visualizations.`,
      },
      {
        id: 'user_student_8',
        name: 'Vikram Singh',
        email: 'vikram.s@campus.edu',
        rollNo: '22EC1072',
        cgpa: 6.45,
        branch: 'Electronics & Communication',
        batch: 2026,
        backlogs: 0,
        isPlaced: false,
        skills: ['C++', 'Python', 'Networking', 'Linux Administration', 'Git', 'Bash Scripting'],
        resumeText: `VIKRAM SINGH | ECE | CGPA: 6.45
SKILLS: C++, Python, Computer Networks, Linux, Shell Scripting, Wireshark, Git.
PROJECTS: Network packet analyzer and firewall rules manager in Python.`,
      },
      {
        id: 'user_student_9',
        name: 'Pooja Iyer',
        email: 'pooja.iyer@campus.edu',
        rollNo: '22CS1023',
        cgpa: 8.68,
        branch: 'Computer Science',
        batch: 2026,
        backlogs: 0,
        isPlaced: true,
        placedCompany: 'Atlassian',
        placedPackage: 34.0,
        skills: ['Java', 'React', 'Kotlin', 'REST APIs', 'Spring Boot', 'GraphQL', 'AWS'],
        resumeText: `POOJA IYER | Computer Science Engineering | CGPA: 8.68
SKILLS: Java, Kotlin, React, Spring Boot, AWS DynamoDB, CI/CD, Agile.
EXPERIENCE: Open source contributor to developer tooling libraries. Built team retro tool.`,
      },
      {
        id: 'user_student_10',
        name: 'Karthik Reddy',
        email: 'karthik.r@campus.edu',
        rollNo: '22EE1014',
        cgpa: 7.55,
        branch: 'Electrical Engineering',
        batch: 2026,
        backlogs: 0,
        isPlaced: false,
        skills: ['Python', 'SQL', 'Data Science', 'Power BI', 'Machine Learning', 'Excel'],
        resumeText: `KARTHIK REDDY | Electrical Engineering | CGPA: 7.55
SKILLS: Python, SQL, PowerBI, Statistical Analysis, Scikit-learn, Tableau.
PROJECTS: Smart Grid Load Forecasting algorithm using recurrent neural networks.`,
      },
    ];

    const users: (IUser & { _id: string })[] = [
      adminUser as any,
      googleUser as any,
      msftUser as any,
      atlassianUser as any,
      innovUser as any,
    ];

    const students: (IStudent & { _id: string })[] = [];

    studentSeedList.forEach((s) => {
      users.push({
        _id: s.id,
        email: s.email,
        passwordHash: defaultPasswordHash,
        name: s.name,
        role: 'student',
        createdAt: new Date('2025-01-20'),
      } as any);

      students.push({
        _id: `student_${s.rollNo}`,
        userId: s.id,
        name: s.name,
        email: s.email,
        rollNo: s.rollNo,
        cgpa: s.cgpa,
        branch: s.branch,
        batch: s.batch,
        backlogs: s.backlogs,
        skills: s.skills,
        resumeText: s.resumeText,
        phone: '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
        isPlaced: s.isPlaced,
        placedCompany: s.placedCompany,
        placedPackage: s.placedPackage,
        createdAt: new Date('2025-01-20'),
      } as any);
    });

    // 2. Companies
    const companies: (ICompany & { _id: string })[] = [
      {
        _id: 'comp_google',
        userId: 'user_recruiter_google',
        name: 'Google',
        email: 'recruiter@google.com',
        industry: 'Internet & Cloud Services',
        logoUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=120&h=120&q=80',
        website: 'https://careers.google.com',
        description: 'Google’s mission is to organize the world’s information and make it universally accessible and useful.',
        verified: true,
        createdAt: new Date('2025-01-12'),
      } as any,
      {
        _id: 'comp_msft',
        userId: 'user_recruiter_msft',
        name: 'Microsoft',
        email: 'careers@microsoft.com',
        industry: 'Enterprise Software & Cloud',
        logoUrl: 'https://images.unsplash.com/photo-1642132652806-963d08e5c8e3?auto=format&fit=crop&w=120&h=120&q=80',
        website: 'https://careers.microsoft.com',
        description: 'Empowering every person and organization on the planet to achieve more through technology and cloud platforms.',
        verified: true,
        createdAt: new Date('2025-01-14'),
      } as any,
      {
        _id: 'comp_atlassian',
        userId: 'user_recruiter_atlassian',
        name: 'Atlassian',
        email: 'jobs@atlassian.com',
        industry: 'Developer Tools & Collaboration',
        logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
        website: 'https://www.atlassian.com/company/careers',
        description: 'Makers of Jira, Confluence, Trello, and Bitbucket empowering agile team collaboration globally.',
        verified: true,
        createdAt: new Date('2025-01-15'),
      } as any,
      {
        _id: 'comp_innovatex',
        userId: 'user_recruiter_innov',
        name: 'InnovateX Labs',
        email: 'talent@innovatex.io',
        industry: 'AI & Robotics Tech',
        logoUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=120&h=120&q=80',
        website: 'https://innovatex.io',
        description: 'Next-gen robotics and autonomic agents company powering smart industrial automation.',
        verified: false, // Pending Admin Approval
        createdAt: new Date('2025-02-01'),
      } as any,
    ];

    // 3. Drives
    const drives: (IDrive & { _id: string })[] = [
      {
        _id: 'drive_google_sde',
        companyId: 'comp_google',
        companyName: 'Google',
        companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=120&h=120&q=80',
        role: 'Software Development Engineer (SDE I)',
        ctc: 42.5,
        description: 'We are seeking world-class early career software engineers to solve complex engineering challenges across search, cloud, AI systems, and scalable infrastructure.',
        requiredSkills: ['Data Structures', 'Algorithms', 'C++', 'Go', 'Distributed Systems', 'Problem Solving'],
        eligibility: {
          cgpaMin: 8.0,
          branches: ['Computer Science', 'Information Technology', 'Electronics & Communication'],
          batch: 2026,
          backlogsAllowed: 0,
        },
        rounds: [
          { name: 'Online Coding Challenge', description: '2 algorithmic questions on HackerEarth (90 mins)', order: 1 },
          { name: 'Technical Round 1 (Data Structures)', description: 'Trees, Graphs, Dynamic Programming on shared Google Doc', order: 2 },
          { name: 'Technical Round 2 (System & Concurrency)', description: 'Multithreading, API design, memory management', order: 3 },
          { name: 'Googleyness & Leadership', description: 'Behavioral and ethical problem solving with Engineering Director', order: 4 },
        ],
        deadline: '2026-10-15',
        status: 'approved',
        openings: 8,
        location: 'Bangalore / Hyderabad',
        createdAt: new Date('2025-01-22'),
      } as any,
      {
        _id: 'drive_msft_cloud',
        companyId: 'comp_msft',
        companyName: 'Microsoft',
        companyLogo: 'https://images.unsplash.com/photo-1642132652806-963d08e5c8e3?auto=format&fit=crop&w=120&h=120&q=80',
        role: 'Cloud Solutions & Software Engineer',
        ctc: 38.0,
        description: 'Join Azure core systems and intelligent cloud divisions building hyper-scale microservices, enterprise reliability, and generative AI copilot backends.',
        requiredSkills: ['Python', 'C#', 'Cloud Architecture', 'Distributed Systems', 'REST APIs', 'SQL'],
        eligibility: {
          cgpaMin: 7.5,
          branches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering'],
          batch: 2026,
          backlogsAllowed: 0,
        },
        rounds: [
          { name: 'Codility Assessment', description: '3 algorithmic problems on arrays, graphs, and strings', order: 1 },
          { name: 'Technical Deep Dive', description: 'Object-Oriented Design & algorithm optimization', order: 2 },
          { name: 'Cloud Architecture & Systems', description: 'High availability, caching, latency tradeoffs', order: 3 },
          { name: 'Director Fit Round', description: 'Collaboration, customer empathy, growth mindset', order: 4 },
        ],
        deadline: '2026-10-20',
        status: 'approved',
        openings: 12,
        location: 'Hyderabad / Noida',
        createdAt: new Date('2025-01-25'),
      } as any,
      {
        _id: 'drive_atlassian_dev',
        companyId: 'comp_atlassian',
        companyName: 'Atlassian',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
        role: 'Associate Software Engineer (Full-Stack)',
        ctc: 34.0,
        description: 'Atlassian is hiring full-stack associates to build team collaboration tools used by over 250,000 global companies. You will touch React frontends and Java/Kotlin microservices.',
        requiredSkills: ['React', 'JavaScript', 'Java', 'REST APIs', 'SQL', 'Git'],
        eligibility: {
          cgpaMin: 7.0,
          branches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering'],
          batch: 2026,
          backlogsAllowed: 0,
        },
        rounds: [
          { name: 'HackerRank Online Test', description: 'Coding & debugging questions', order: 1 },
          { name: 'Live Code Pairing', description: 'Pair programming on a real-world component in React/Java', order: 2 },
          { name: 'System Craftsmanship', description: 'Code maintainability, testing strategies, clean architecture', order: 3 },
          { name: 'Values Interview', description: 'Open Company No Bullshit, Play as a Team', order: 4 },
        ],
        deadline: '2026-10-25',
        status: 'approved',
        openings: 6,
        location: 'Bengaluru (Remote Friendly)',
        createdAt: new Date('2025-01-28'),
      } as any,
      {
        _id: 'drive_goldman_fin',
        companyId: 'comp_google', // demo existing company ref
        companyName: 'Goldman Sachs',
        companyLogo: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=120&h=120&q=80',
        role: 'Analyst - Engineering & Quantitative Tech',
        ctc: 28.0,
        description: 'Develop algorithmic trading engines, risk analytics calculators, and security pipelines operating at low latency and global scale.',
        requiredSkills: ['Java', 'C++', 'Python', 'Algorithms', 'Probability & Stats', 'SQL'],
        eligibility: {
          cgpaMin: 7.5,
          branches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering'],
          batch: 2026,
          backlogsAllowed: 1, // Allows 1 backlog
        },
        rounds: [
          { name: 'Aptitude & Math Assessment', description: 'Quantitative reasoning, probability, and 2 coding tasks', order: 1 },
          { name: 'Technical Interview', description: 'Core computer science, memory management, algorithm speed', order: 2 },
          { name: 'Senior Partner Round', description: 'Commercial awareness and leadership potential', order: 3 },
        ],
        deadline: '2026-11-05',
        status: 'approved',
        openings: 10,
        location: 'Bengaluru',
        createdAt: new Date('2025-02-02'),
      } as any,
      {
        _id: 'drive_innovatex_pending',
        companyId: 'comp_innovatex',
        companyName: 'InnovateX Labs',
        companyLogo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=120&h=120&q=80',
        role: 'Autonomous AI Robotics Engineer',
        ctc: 25.0,
        description: 'InnovateX is looking for enthusiastic engineers to train neural controllers, robotic arm path planning, and computer vision models.',
        requiredSkills: ['Python', 'PyTorch', 'ROS2', 'C++', 'Robotics'],
        eligibility: {
          cgpaMin: 7.0,
          branches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering'],
          batch: 2026,
          backlogsAllowed: 0,
        },
        rounds: [
          { name: 'Take-home Simulation Assignment', description: 'Implement PID/RL controller in simulator', order: 1 },
          { name: 'Technical Defense', description: 'Walkthrough of algorithm choices with research staff', order: 2 },
          { name: 'Founders Round', description: 'Culture, grit, and vision alignment', order: 3 },
        ],
        deadline: '2026-11-12',
        status: 'pending', // Pending Admin Approval
        openings: 4,
        location: 'Bangalore / San Jose',
        createdAt: new Date('2025-02-05'),
      } as any,
    ];

    // 4. Applications (realistic statuses)
    const applications: (IApplication & { _id: string })[] = [
      {
        _id: 'app_1',
        studentId: 'student_22CS1042', // Priya Sharma
        studentName: 'Priya Sharma',
        studentEmail: 'priya.sharma@campus.edu',
        studentRollNo: '22CS1042',
        studentBranch: 'Computer Science',
        studentCgpa: 8.92,
        studentSkills: ['React', 'TypeScript', 'Node.js', 'Go', 'Distributed Systems'],
        driveId: 'drive_google_sde',
        companyName: 'Google',
        roleTitle: 'Software Development Engineer (SDE I)',
        status: 'Selected',
        resumeScore: 94,
        scoreBreakdown: {
          matchPercentage: 94,
          matchedSkills: ['Distributed Systems', 'Go', 'Data Structures', 'Algorithms'],
          missingSkills: ['Kubernetes in production'],
          strengths: ['Exceptional Go project with distributed caching', 'High CGPA', 'Clean system design concepts'],
          feedback: 'Candidate demonstrates superior depth in systems programming and data structures.',
        },
        appliedAt: '2025-01-24T10:15:00Z',
        currentRound: 'Offer Accepted (Selected)',
        feedbackNotes: 'Outstanding algorithmic clarity in Round 2 and strong behavioral alignment.',
      } as any,
      {
        _id: 'app_2',
        studentId: 'student_22IT1019', // Ananya
        studentName: 'Ananya Deshmukh',
        studentEmail: 'ananya.d@campus.edu',
        studentRollNo: '22IT1019',
        studentBranch: 'Information Technology',
        studentCgpa: 8.45,
        studentSkills: ['Python', 'Azure', 'C#', '.NET Core', 'Machine Learning'],
        driveId: 'drive_msft_cloud',
        companyName: 'Microsoft',
        roleTitle: 'Cloud Solutions & Software Engineer',
        status: 'Selected',
        resumeScore: 91,
        scoreBreakdown: {
          matchPercentage: 91,
          matchedSkills: ['Python', 'Azure', 'C#', 'Cloud Architecture'],
          missingSkills: ['Kubernetes'],
          strengths: ['Azure cloud hackathon winner', 'Solid systems foundation'],
          feedback: 'High aptitude for cloud infrastructure and services.',
        },
        appliedAt: '2025-01-26T14:30:00Z',
        currentRound: 'Offer Accepted (Selected)',
      } as any,
      {
        _id: 'app_3',
        studentId: 'student_22CS1077', // Rahul Verma
        studentName: 'Rahul Verma',
        studentEmail: 'rahul.verma@campus.edu',
        studentRollNo: '22CS1077',
        studentBranch: 'Computer Science',
        studentCgpa: 7.85,
        studentSkills: ['Java', 'Spring Boot', 'MySQL', 'React'],
        driveId: 'drive_atlassian_dev',
        companyName: 'Atlassian',
        roleTitle: 'Associate Software Engineer (Full-Stack)',
        status: 'Interview',
        resumeScore: 82,
        scoreBreakdown: {
          matchPercentage: 82,
          matchedSkills: ['Java', 'React', 'REST APIs', 'SQL'],
          missingSkills: ['GraphQL'],
          strengths: ['Hands-on full stack project experience', 'Clean microservice pattern'],
          feedback: 'Strong practical familiarity with React and Spring Boot.',
        },
        appliedAt: '2025-01-30T09:00:00Z',
        currentRound: 'Live Code Pairing',
        interviewDetails: {
          date: '2026-10-02',
          time: '02:30 PM IST',
          roundName: 'Live Code Pairing',
          meetLink: 'https://meet.google.com/atl-code-pair',
          notes: 'Please have your local IDE and Node/Java environment ready.',
        },
      } as any,
      {
        _id: 'app_4',
        studentId: 'student_22CS1090', // Sneha Patel
        studentName: 'Sneha Patel',
        studentEmail: 'sneha.patel@campus.edu',
        studentRollNo: '22CS1090',
        studentBranch: 'Computer Science',
        studentCgpa: 9.35,
        studentSkills: ['Algorithms', 'C++', 'System Design', 'Linux'],
        driveId: 'drive_google_sde',
        companyName: 'Google',
        roleTitle: 'Software Development Engineer (SDE I)',
        status: 'Interview',
        resumeScore: 96,
        scoreBreakdown: {
          matchPercentage: 96,
          matchedSkills: ['Data Structures', 'Algorithms', 'C++', 'Problem Solving'],
          missingSkills: [],
          strengths: ['Codeforces Candidate Master', 'Top CGPA', 'Distributed Raft project'],
          feedback: 'Candidate exhibits competitive programming mastery and deep algorithmic understanding.',
        },
        appliedAt: '2025-01-23T11:45:00Z',
        currentRound: 'Technical Round 2 (System & Concurrency)',
        interviewDetails: {
          date: '2026-10-04',
          time: '11:00 AM IST',
          roundName: 'Technical Round 2',
          meetLink: 'https://meet.google.com/goo-sde-round2',
          notes: 'Focus on multi-threading, concurrency locks, and memory caching architectures.',
        },
      } as any,
      {
        _id: 'app_5',
        studentId: 'student_22CS1023', // Pooja Iyer
        studentName: 'Pooja Iyer',
        studentEmail: 'pooja.iyer@campus.edu',
        studentRollNo: '22CS1023',
        studentBranch: 'Computer Science',
        studentCgpa: 8.68,
        studentSkills: ['Java', 'React', 'Kotlin', 'REST APIs'],
        driveId: 'drive_atlassian_dev',
        companyName: 'Atlassian',
        roleTitle: 'Associate Software Engineer (Full-Stack)',
        status: 'Selected',
        resumeScore: 89,
        appliedAt: '2025-01-29T16:20:00Z',
        currentRound: 'Offer Extended (Selected)',
      } as any,
      {
        _id: 'app_6',
        studentId: 'student_22EC1031', // Rohan Mehta
        studentName: 'Rohan Mehta',
        studentEmail: 'rohan.m@campus.edu',
        studentRollNo: '22EC1031',
        studentBranch: 'Electronics & Communication',
        studentCgpa: 7.20,
        studentSkills: ['Embedded C', 'IoT', 'Python', 'C++'],
        driveId: 'drive_goldman_fin',
        companyName: 'Goldman Sachs',
        roleTitle: 'Analyst - Engineering & Quantitative Tech',
        status: 'Shortlisted',
        resumeScore: 74,
        appliedAt: '2025-02-04T12:00:00Z',
        currentRound: 'Aptitude & Math Assessment Scheduled',
      } as any,
      {
        _id: 'app_7',
        studentId: 'student_22IT1055', // Divya Nair
        studentName: 'Divya Nair',
        studentEmail: 'divya.nair@campus.edu',
        studentRollNo: '22IT1055',
        studentBranch: 'Information Technology',
        studentCgpa: 7.95,
        studentSkills: ['JavaScript', 'React', 'TailwindCSS', 'Next.js'],
        driveId: 'drive_atlassian_dev',
        companyName: 'Atlassian',
        roleTitle: 'Associate Software Engineer (Full-Stack)',
        status: 'Applied',
        resumeScore: 80,
        appliedAt: '2025-02-06T18:10:00Z',
        currentRound: 'Resume Screening',
      } as any,
    ];

    // 5. Forum Posts
    const forumPosts: IForumPost[] = [
      {
        id: 'post_1',
        driveId: 'drive_google_sde',
        authorId: 'student_22CS1042',
        authorName: 'Priya Sharma',
        authorRole: 'Student (Placed)',
        title: 'Tips for Google SDE Round 1 & Round 2',
        content: 'Hey everyone! For the online assessment, brush up on sliding window problems, graph traversals (BFS/DFS with cycle detection), and union-find. In the technical interview, make sure to talk aloud about time and space complexity tradeoffs before writing a single line of code!',
        category: 'interview-prep',
        upvotes: 24,
        upvotedBy: ['user_student_2', 'user_student_5'],
        createdAt: '2025-02-01T10:00:00Z',
        replies: [
          {
            id: 'rep_1',
            authorId: 'user_student_5',
            authorName: 'Sneha Patel',
            authorRole: 'Student',
            content: 'Super helpful Priya! Did they ask any dynamic programming on intervals or trees?',
            createdAt: '2025-02-01T11:20:00Z',
          },
          {
            id: 'rep_2',
            authorId: 'student_22CS1042',
            authorName: 'Priya Sharma',
            authorRole: 'Student (Placed)',
            content: 'Yes! Round 2 had a variant of interval scheduling with weighted rewards (memoized DP).',
            createdAt: '2025-02-01T12:05:00Z',
          },
        ],
      },
      {
        id: 'post_2',
        driveId: 'drive_msft_cloud',
        authorId: 'user_recruiter_msft',
        authorName: 'Microsoft Campus Hiring',
        authorRole: 'Recruiter',
        title: 'Preparation Guidelines for Cloud & Systems Round',
        content: 'Candidates are encouraged to understand horizontal scaling vs vertical scaling, basic caching architectures (Redis/Memcached), REST API design, and asynchronous message queues. We value clean code and clarity in reasoning!',
        category: 'general',
        upvotes: 19,
        upvotedBy: ['user_student_1', 'user_student_3'],
        createdAt: '2025-02-03T09:30:00Z',
        replies: [],
      },
    ];

    // 6. Notifications
    const notifications: INotification[] = [
      {
        id: 'notif_1',
        userId: 'user_student_2', // Rahul Verma
        title: 'Interview Scheduled: Atlassian',
        message: 'Your Live Code Pairing interview has been scheduled for Oct 2, 2:30 PM IST.',
        type: 'interview',
        read: false,
        link: '/applications',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif_2',
        userId: 'user_admin_1',
        title: 'New Drive Approval Needed',
        message: 'InnovateX Labs submitted an Autonomous AI Robotics Engineer drive for 4 openings.',
        type: 'drive',
        read: false,
        link: '/admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif_3',
        userId: 'user_student_5', // Sneha Patel
        title: 'Google SDE Round 2 Scheduled',
        message: 'Your Technical Round 2 (System & Concurrency) is set for Oct 4, 11:00 AM IST.',
        type: 'interview',
        read: false,
        link: '/applications',
        createdAt: new Date().toISOString(),
      },
    ];

    this.state = {
      users,
      students,
      companies,
      drives,
      applications,
      forumPosts,
      notifications,
    };
  }

  // --- Users ---
  public findUserByEmail(email: string) {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string) {
    return this.state.users.find((u) => u._id === id);
  }

  public createUser(user: Partial<IUser> & { email: string; passwordHash: string; name: string; role: any }) {
    const newUser = {
      _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date(),
      ...user,
    } as IUser & { _id: string };
    this.state.users.push(newUser);
    this.persist();
    return newUser;
  }

  // --- Students ---
  public getAllStudents() {
    return this.state.students;
  }

  public getStudentByUserId(userId: string) {
    return this.state.students.find((s) => s.userId === userId);
  }

  public getStudentById(id: string) {
    return this.state.students.find((s) => s._id === id);
  }

  public createStudent(studentData: Partial<IStudent>) {
    const student = {
      _id: 'student_' + (studentData.rollNo || Date.now().toString()),
      createdAt: new Date(),
      backlogs: 0,
      skills: [],
      isPlaced: false,
      resumeText: '',
      ...studentData,
    } as IStudent & { _id: string };
    this.state.students.push(student);
    this.persist();
    return student;
  }

  public updateStudent(id: string, updates: Partial<IStudent>) {
    const index = this.state.students.findIndex((s) => s._id === id || s.userId === id);
    if (index !== -1) {
      this.state.students[index] = { ...this.state.students[index], ...updates };
      this.persist();
      return this.state.students[index];
    }
    return null;
  }

  public bulkImportStudents(studentsList: Partial<IStudent>[]) {
    const salt = bcrypt.genSaltSync(10);
    const defaultHash = bcrypt.hashSync('campus123', salt);
    const created: IStudent[] = [];

    studentsList.forEach((item) => {
      if (!item.email || !item.rollNo) return;
      const existingUser = this.findUserByEmail(item.email);
      let userId = existingUser?._id;
      if (!existingUser) {
        const u = this.createUser({
          name: item.name || 'Student',
          email: item.email,
          passwordHash: defaultHash,
          role: 'student',
        });
        userId = u._id;
      }
      const existingStudent = this.getStudentByUserId(userId!);
      if (!existingStudent) {
        const newStudent = this.createStudent({
          userId,
          name: item.name || 'Student',
          email: item.email,
          rollNo: item.rollNo,
          cgpa: item.cgpa || 7.0,
          branch: item.branch || 'Computer Science',
          batch: item.batch || 2026,
          backlogs: item.backlogs || 0,
          skills: item.skills || ['Python', 'SQL'],
          resumeText: item.resumeText || '',
          isPlaced: item.isPlaced || false,
        });
        created.push(newStudent);
      }
    });

    return created;
  }

  // --- Companies ---
  public getAllCompanies() {
    return this.state.companies;
  }

  public getCompanyByUserId(userId: string) {
    return this.state.companies.find((c) => c.userId === userId);
  }

  public getCompanyById(id: string) {
    return this.state.companies.find((c) => c._id === id);
  }

  public createCompany(companyData: Partial<ICompany>) {
    const newComp = {
      _id: 'comp_' + Date.now().toString(36),
      verified: false,
      createdAt: new Date(),
      logoUrl: companyData.logoUrl || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=120&h=120&q=80',
      ...companyData,
    } as ICompany & { _id: string };
    this.state.companies.push(newComp);
    this.persist();
    return newComp;
  }

  public verifyCompany(id: string, verified: boolean) {
    const company = this.state.companies.find((c) => c._id === id);
    if (company) {
      company.verified = verified;
      this.persist();
      return company;
    }
    return null;
  }

  // --- Drives ---
  public getAllDrives(filterStatus?: string) {
    if (filterStatus) {
      return this.state.drives.filter((d) => d.status === filterStatus);
    }
    return this.state.drives;
  }

  public getDriveById(id: string) {
    return this.state.drives.find((d) => d._id === id);
  }

  public getDrivesByCompanyId(companyId: string) {
    return this.state.drives.filter((d) => d.companyId === companyId);
  }

  public createDrive(driveData: Partial<IDrive>) {
    const newDrive = {
      _id: 'drive_' + Date.now().toString(36),
      status: 'pending', // Requires admin approval by default
      openings: 5,
      createdAt: new Date(),
      ...driveData,
    } as IDrive & { _id: string };
    this.state.drives.unshift(newDrive);
    this.persist();
    return newDrive;
  }

  public updateDrive(id: string, updates: Partial<IDrive>) {
    const index = this.state.drives.findIndex((d) => d._id === id);
    if (index !== -1) {
      this.state.drives[index] = { ...this.state.drives[index], ...updates };
      this.persist();
      return this.state.drives[index];
    }
    return null;
  }

  // --- Applications ---
  public getAllApplications() {
    return this.state.applications;
  }

  public getApplicationsByStudentId(studentId: string) {
    return this.state.applications.filter((a) => a.studentId === studentId);
  }

  public getApplicationsByDriveId(driveId: string) {
    return this.state.applications.filter((a) => a.driveId === driveId);
  }

  public getApplicationById(id: string) {
    return this.state.applications.find((a) => a._id === id);
  }

  public createApplication(appData: Partial<IApplication>) {
    const newApp = {
      _id: 'app_' + Date.now().toString(36),
      status: 'Applied',
      appliedAt: new Date().toISOString(),
      currentRound: 'Application Submitted',
      ...appData,
    } as IApplication & { _id: string };
    this.state.applications.unshift(newApp);
    this.persist();
    return newApp;
  }

  public updateApplication(id: string, updates: Partial<IApplication>) {
    const index = this.state.applications.findIndex((a) => a._id === id);
    if (index !== -1) {
      this.state.applications[index] = { ...this.state.applications[index], ...updates };
      this.persist();
      return this.state.applications[index];
    }
    return null;
  }

  // --- Forum Posts ---
  public getForumPostsByDriveId(driveId: string) {
    return this.state.forumPosts.filter((p) => p.driveId === driveId);
  }

  public createForumPost(postData: Omit<IForumPost, 'id' | 'createdAt' | 'upvotes' | 'upvotedBy' | 'replies'>) {
    const newPost: IForumPost = {
      id: 'post_' + Date.now().toString(36),
      ...postData,
      upvotes: 0,
      upvotedBy: [],
      createdAt: new Date().toISOString(),
      replies: [],
    };
    this.state.forumPosts.unshift(newPost);
    this.persist();
    return newPost;
  }

  public replyToForumPost(postId: string, reply: { authorId: string; authorName: string; authorRole: string; content: string }) {
    const post = this.state.forumPosts.find((p) => p.id === postId);
    if (post) {
      const newReply = {
        id: 'reply_' + Date.now().toString(36),
        ...reply,
        createdAt: new Date().toISOString(),
      };
      post.replies.push(newReply);
      this.persist();
      return newReply;
    }
    return null;
  }

  public upvoteForumPost(postId: string, userId: string) {
    const post = this.state.forumPosts.find((p) => p.id === postId);
    if (post) {
      const hasUpvoted = post.upvotedBy.includes(userId);
      if (hasUpvoted) {
        post.upvotedBy = post.upvotedBy.filter((u) => u !== userId);
        post.upvotes = Math.max(0, post.upvotes - 1);
      } else {
        post.upvotedBy.push(userId);
        post.upvotes += 1;
      }
      this.persist();
      return post;
    }
    return null;
  }

  // --- Notifications ---
  public getNotificationsByUserId(userId: string) {
    return this.state.notifications.filter((n) => n.userId === userId);
  }

  public createNotification(notif: Omit<INotification, 'id' | 'createdAt' | 'read'>) {
    const newNotif: INotification = {
      id: 'notif_' + Date.now().toString(36),
      ...notif,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.state.notifications.unshift(newNotif);
    this.persist();
    return newNotif;
  }

  public markNotificationAsRead(id: string) {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.persist();
      return notif;
    }
    return null;
  }

  // --- Analytics Aggregation ---
  public getAnalytics() {
    const totalStudents = this.state.students.length;
    const placedStudents = this.state.students.filter((s) => s.isPlaced);
    const placementRate = totalStudents > 0 ? Math.round((placedStudents.length / totalStudents) * 100) : 0;

    const totalApplications = this.state.applications.length;
    const shortlistedCount = this.state.applications.filter((a) => a.status === 'Shortlisted').length;
    const interviewCount = this.state.applications.filter((a) => a.status === 'Interview').length;
    const selectedCount = this.state.applications.filter((a) => a.status === 'Selected').length;

    // Packages
    const placedPackages = placedStudents.map((s) => s.placedPackage || 0).filter((p) => p > 0);
    const avgPackage = placedPackages.length > 0 ? (placedPackages.reduce((a, b) => a + b, 0) / placedPackages.length).toFixed(1) : '0';
    const highestPackage = placedPackages.length > 0 ? Math.max(...placedPackages).toFixed(1) : '0';

    // Department-wise Breakdown
    const departmentStats: Record<string, { total: number; placed: number; avgCgpa: number }> = {};
    this.state.students.forEach((s) => {
      if (!departmentStats[s.branch]) {
        departmentStats[s.branch] = { total: 0, placed: 0, avgCgpa: 0 };
      }
      departmentStats[s.branch].total += 1;
      if (s.isPlaced) departmentStats[s.branch].placed += 1;
      departmentStats[s.branch].avgCgpa += s.cgpa;
    });

    const departmentData = Object.entries(departmentStats).map(([branch, stats]) => ({
      branch,
      total: stats.total,
      placed: stats.placed,
      placementRate: Math.round((stats.placed / stats.total) * 100),
      avgCgpa: (stats.avgCgpa / stats.total).toFixed(2),
    }));

    // Drives overview
    const totalDrives = this.state.drives.length;
    const activeDrives = this.state.drives.filter((d) => d.status === 'approved').length;
    const pendingDrives = this.state.drives.filter((d) => d.status === 'pending').length;

    return {
      overview: {
        totalStudents,
        placedCount: placedStudents.length,
        placementRate,
        avgPackageLPA: avgPackage,
        highestPackageLPA: highestPackage,
        totalDrives,
        activeDrives,
        pendingDrives,
        totalApplications,
      },
      funnel: {
        applied: totalApplications,
        shortlisted: shortlistedCount + interviewCount + selectedCount,
        interview: interviewCount + selectedCount,
        selected: selectedCount,
      },
      departmentData,
      recentDrives: this.state.drives.slice(0, 5),
    };
  }
}

export const db = new DatabaseService();
