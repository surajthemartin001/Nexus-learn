import { GoogleGenAI } from '@google/genai';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function analyzeSyllabus(params: {
  input: string;
  inputType: string;
  goal: string;
  level: string;
  targetDomain?: string;
}) {
  const ai = getAiClient();
  const systemPrompt = `You are the NEXUS Curriculum & Syllabus AI Architect.
Analyze the provided syllabus / topics / course content and transform it into a deeply structured, prerequisite-aware learning roadmap.
Do NOT just follow the linear order pasted if dependencies require fundamental prerequisites first.
Return ONLY valid JSON matching this schema:
{
  "curriculumTitle": string,
  "domain": string,
  "level": "beginner" | "intermediate" | "advanced",
  "estimatedTotalHours": number,
  "prerequisiteAnalysis": {
    "assumedKnowledge": string[],
    "missingPrerequisitesFound": string[],
    "reorderedReasoning": string
  },
  "subjects": [
    {
      "id": string,
      "title": string,
      "description": string,
      "color": string,
      "topics": [
        {
          "id": string,
          "title": string,
          "description": string,
          "difficulty": "beginner" | "intermediate" | "advanced",
          "estimatedMinutes": number,
          "prerequisites": string[],
          "practicalRelevance": string,
          "examRelevance": string,
          "recommendedStack": {
            "primary": string,
            "secondary": string,
            "practice": string,
            "project": string,
            "advanced": string
          }
        }
      ]
    }
  ],
  "suggestedProjects": [
    {
      "title": string,
      "description": string,
      "requiredTopics": string[],
      "milestones": string[]
    }
  ]
}`;

  if (!ai) {
    // High-quality fallback structure if API key is not yet set
    return getFallbackSyllabus(params);
  }

  try {
    const prompt = `Input Type: ${params.inputType}\nUser Learning Goal: ${params.goal}\nLearner Level: ${params.level}\nDomain: ${params.targetDomain || 'Interdisciplinary'}\n\nSyllabus Content:\n${params.input}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error('Error analyzing syllabus with Gemini:', error);
    return getFallbackSyllabus(params);
  }
}

export async function generateQuestions(params: {
  topic: string;
  domain?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  questionTypes?: string[];
  count?: number;
  mode?: string;
  contextText?: string;
}) {
  const ai = getAiClient();
  const count = params.count || 5;

  if (!ai) {
    return getFallbackQuestions(params);
  }

  const systemInstruction = `You are the NEXUS Adaptive AI Question Engine.
Generate ${count} academic, technical, or practical questions on the topic "${params.topic}" (${params.difficulty || 'intermediate'} level).
Domain context: ${params.domain || 'General'}.
Mode: ${params.mode || 'practice'}.
For cybersecurity: use safe, authorized educational scenarios, defense, OWASP, networking, and secure coding.
For robotics/hardware: use realistic sensor, math, kinematics, electronics, and embedded control problems.
For software: real programming, algorithmic design, and debugging exercises.
Return JSON with format:
{
  "questions": [
    {
      "id": string,
      "prompt": string,
      "type": "mcq" | "multi_select" | "true_false" | "coding" | "short_answer" | "numerical" | "scenario",
      "options": string[] (only for mcq and multi_select),
      "correctAnswer": string,
      "explanation": string,
      "difficulty": "beginner" | "intermediate" | "advanced",
      "hint": string,
      "codeSnippet": string (optional),
      "domain": string
    }
  ]
}`;

  try {
    const contents = `Generate ${count} practice questions for: ${params.topic}. ${params.contextText ? `Based on source notes: ${params.contextText}` : ''}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{"questions":[]}';
    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    return getFallbackQuestions(params);
  }
}

export async function tutorChat(params: {
  messages: Array<{ role: 'user' | 'assistant' | 'model'; content: string }>;
  currentTopic?: string;
  learningPathTitle?: string;
  domain?: string;
  sources?: string[];
  mode?: string;
}) {
  const ai = getAiClient();
  if (!ai) {
    return {
      reply: `I am your NEXUS AI Tutor. Currently analyzing "${params.currentTopic || 'your curriculum'}". I recommend breaking down key prerequisites, applying active recall exercises, and writing code or solving conceptual proofs. What specific concept would you like to explore first?`,
      groundedInSources: false,
    };
  }

  const systemInstruction = `You are the NEXUS AI Personal Institute Tutor & Research Mentor.
You are assisting a student working on "${params.learningPathTitle || 'Curriculum'}" with current topic: "${params.currentTopic || 'General Study'}".
Domain: ${params.domain || 'Multidisciplinary'}.
Mode: ${params.mode || 'Socratic'}.
Guidelines:
1. Be rigorous, academic, and encouraging without condescension.
2. Ground your explanations in real-world engineering, math proofs, or verified theory.
3. If source documents are provided, prioritize grounded facts and cite the source clearly.
4. Distinguish clearly between source facts and inferred explanations.
5. In Socratic or Practice mode, challenge the learner with a mini check question at the end to verify understanding.
${params.sources && params.sources.length > 0 ? `Active Sources Grounding Content:\n${params.sources.join('\n---\n')}` : ''}`;

  try {
    // Format conversation history
    const contents = params.messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    return {
      reply: response.text || 'I could not generate an answer at this moment.',
      groundedInSources: Boolean(params.sources && params.sources.length > 0),
    };
  } catch (error) {
    console.error('Error in tutorChat:', error);
    return {
      reply: 'An error occurred while communicating with the AI Tutor. Please try again.',
      groundedInSources: false,
    };
  }
}

export async function generateNoteArtifact(params: {
  topic: string;
  artifactType: 'summary' | 'study_guide' | 'flashcards' | 'faq' | 'concept_map' | 'revision_sheet';
  sourceText?: string;
}) {
  const ai = getAiClient();
  if (!ai) {
    return {
      title: `${params.topic} - ${params.artifactType.replace('_', ' ').toUpperCase()}`,
      content: `# ${params.topic}\n\n## Overview\nCore principles and fundamental mechanisms of ${params.topic}.\n\n### Key Takeaways\n- Principle 1: Modular architecture\n- Principle 2: Verification and mathematical boundaries\n- Principle 3: Practical implementation constraints`,
    };
  }

  const systemInstruction = `You are an AI Academic Note Synthesizer and Research Assistant.
Generate a high-density, professional ${params.artifactType.replace('_', ' ')} for the topic "${params.topic}".
${params.sourceText ? `Strictly ground your points in the provided source text:\n${params.sourceText}` : 'Provide comprehensive, up-to-date academic & engineering notes.'}
Structure with Markdown headers, bullet points, code or mathematical formulas where relevant, and a clear "Practical Synthesis" section.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate a detailed ${params.artifactType} for "${params.topic}".`,
      config: { systemInstruction },
    });

    return {
      title: `${params.topic} (${params.artifactType.replace('_', ' ').toUpperCase()})`,
      content: response.text || '',
    };
  } catch (error) {
    console.error('Error generating note artifact:', error);
    return {
      title: `${params.topic} Note`,
      content: `Failed to synthesize notes. Error occurred.`,
    };
  }
}

export async function generateTTS(text: string) {
  const ai = getAiClient();
  if (!ai) {
    return { audioBase64: null, message: 'Audio synthesis requires GEMINI_API_KEY' };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 1000), // safe chunk limit
              speechMetadata: {
                style: 'Professional, articulate university tutor',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    return { audioBase64: base64Audio };
  } catch (err) {
    console.error('Error generating TTS:', err);
    return { audioBase64: null };
  }
}

// Fallback generators when API key is pending
function getFallbackSyllabus(params: { input: string; goal: string; level: string; targetDomain?: string }) {
  const domain = params.targetDomain || (params.goal.toLowerCase().includes('cyber') ? 'Cybersecurity' : params.goal.toLowerCase().includes('robot') ? 'Robotics & AI' : 'Software Engineering');

  if (domain.toLowerCase().includes('cyber')) {
    return {
      curriculumTitle: 'Ethical Hacking & Modern Cybersecurity Roadmap',
      domain: 'Cybersecurity',
      level: params.level || 'beginner',
      estimatedTotalHours: 95,
      prerequisiteAnalysis: {
        assumedKnowledge: ['Basic command line', 'TCP/IP fundamentals'],
        missingPrerequisitesFound: ['Assembly basics', 'Network packet inspection'],
        reorderedReasoning: 'Placed Networking Architecture before Web Security to guarantee defensive understanding.',
      },
      subjects: [
        {
          id: 'sub-net-1',
          title: 'Networking & Protocol Security',
          description: 'Deep dive into OSI layers, packet crafting, Wireshark, and firewall configurations.',
          color: '#3b82f6',
          topics: [
            {
              id: 'top-net-101',
              title: 'TCP/IP Handshake & Packet Inspection',
              description: 'Analyze SYN, ACK, FIN packets and inspect protocol anomalies using Wireshark.',
              difficulty: 'beginner',
              estimatedMinutes: 60,
              prerequisites: [],
              practicalRelevance: 'Essential for firewall rule crafting and intrusion detection.',
              examRelevance: 'Heavily tested in CompTIA Security+ and CEH.',
              recommendedStack: {
                primary: 'Wireshark User Guide & RFC 793',
                secondary: 'Computer Networking: A Top-Down Approach',
                practice: 'OverTheWire Bandit & Network Labs',
                project: 'Build a Python Packet Sniffer',
                advanced: 'Zeek / Snort Rule Writing',
              },
            },
            {
              id: 'top-net-102',
              title: 'DNS, TLS/SSL & Cryptographic Primitives',
              description: 'Public key infrastructure, certificates, cipher suites, and modern transport encryption.',
              difficulty: 'intermediate',
              estimatedMinutes: 90,
              prerequisites: ['TCP/IP Handshake & Packet Inspection'],
              practicalRelevance: 'Securing web applications and enterprise traffic.',
              examRelevance: 'Fundamental for security certifications.',
              recommendedStack: {
                primary: 'Cloudflare Learning Center (TLS / SSL)',
                secondary: 'Serious Cryptography by Jean-Philippe Aumasson',
                practice: 'Cryptohack challenges',
                project: 'Implement a Toy RSA Encryption Tool',
                advanced: 'Post-Quantum Cryptography standards',
              },
            },
          ],
        },
        {
          id: 'sub-web-2',
          title: 'Web Application Security & OWASP Top 10',
          description: 'Defensive coding, injection attacks, broken access control, and API vulnerabilities.',
          color: '#ef4444',
          topics: [
            {
              id: 'top-web-201',
              title: 'SQL Injection & Prepared Statements',
              description: 'Mechanisms of SQLi, error-based, union-based, and complete mitigation via parameterized queries.',
              difficulty: 'intermediate',
              estimatedMinutes: 75,
              prerequisites: ['Database basics'],
              practicalRelevance: 'Preventing catastrophic database exfiltration.',
              examRelevance: 'Core OWASP Top 10 focus area.',
              recommendedStack: {
                primary: 'OWASP SQL Injection Prevention Cheat Sheet',
                secondary: 'PortSwigger Web Security Academy SQLi Lab',
                practice: 'PortSwigger SQL Injection Labs',
                project: 'Secure an Express/PostgreSQL Authentication API',
                advanced: 'Second-order and blind time-based SQLi evasion',
              },
            },
            {
              id: 'top-web-202',
              title: 'Cross-Site Scripting (XSS) & Content Security Policy',
              description: 'Stored, Reflected, and DOM-based XSS with modern CSP header deployment.',
              difficulty: 'intermediate',
              estimatedMinutes: 80,
              prerequisites: ['HTML/DOM understanding'],
              practicalRelevance: 'Client-side defense against session hijacking.',
              examRelevance: 'Common in web penetration testing.',
              recommendedStack: {
                primary: 'MDN Web Security & CSP Specification',
                secondary: 'Web Hacking 101',
                practice: 'XSS-Game and PortSwigger XSS',
                project: 'Build an XSS Sanitization Filter with strict CSP',
                advanced: 'DOM Clobbering & Mutation XSS',
              },
            },
          ],
        },
      ],
      suggestedProjects: [
        {
          title: 'Automated Port Scanner & Vulnerability Auditing Tool',
          description: 'A modular Python tool that safely inspects open ports, banners, and identifies known CVE configurations in an authorized sandbox.',
          requiredTopics: ['TCP/IP Handshake & Packet Inspection', 'DNS, TLS/SSL'],
          milestones: ['Socket connection pool', 'Banner grabbing', 'CVE mapping database', 'CLI output with color coding'],
        },
      ],
    };
  }

  if (domain.toLowerCase().includes('robot') || domain.toLowerCase().includes('nexora')) {
    return {
      curriculumTitle: 'NEXORA Advanced Robotics & Autonomous AI Systems',
      domain: 'Robotics & AI',
      level: params.level || 'intermediate',
      estimatedTotalHours: 120,
      prerequisiteAnalysis: {
        assumedKnowledge: ['Multivariable Calculus', 'Basic Linear Algebra', 'C++ / Python'],
        missingPrerequisitesFound: ['State Space Representations', 'Kinematic Transform Matrices'],
        reorderedReasoning: 'Placed Rigid Body Transformations prior to Forward & Inverse Kinematics.',
      },
      subjects: [
        {
          id: 'sub-kin-1',
          title: 'Kinematics & Spatial Transformations',
          description: 'Rotation matrices, quaternions, DH-parameters, and forward/inverse kinematic solvers.',
          color: '#8b5cf6',
          topics: [
            {
              id: 'top-kin-101',
              title: 'SO(3) Rotations, Quaternions & SE(3) Rigid Transforms',
              description: 'Representing orientation without gimbal lock and composing homogeneous transformation frames.',
              difficulty: 'intermediate',
              estimatedMinutes: 90,
              prerequisites: ['Linear Algebra'],
              practicalRelevance: 'Foundation for every robotic manipulator and drone telemetry system.',
              examRelevance: 'Robotics university core examinations.',
              recommendedStack: {
                primary: 'Modern Robotics: Mechanics, Planning, and Control (Lynch & Park)',
                secondary: 'Peter Corke Robotics Toolbox Documentation',
                practice: 'Quaternion math exercises in Python/NumPy',
                project: '3D Robot Arm Coordinate Frame Visualizer',
                advanced: 'Lie Groups and Lie Algebras in Robotics',
              },
            },
            {
              id: 'top-kin-102',
              title: 'Forward & Inverse Kinematics (DH Parameters & Numerical Solvers)',
              description: 'Denavit-Hartenberg conventions and solving inverse kinematics using Jacobian pseudo-inverse.',
              difficulty: 'advanced',
              estimatedMinutes: 120,
              prerequisites: ['SO(3) Rotations, Quaternions & SE(3) Rigid Transforms'],
              practicalRelevance: 'Precision trajectory tracking in robotic surgery and manufacturing.',
              examRelevance: 'Graduate level robotics robotics exam.',
              recommendedStack: {
                primary: 'Robotics, Vision and Control by Peter Corke',
                secondary: 'Stanford Robotics CS223A Lectures',
                practice: 'Analytical 3-DOF and 6-DOF Inverse Kinematics coding',
                project: '6-DOF Robotic Arm Inverse Kinematic Engine',
                advanced: 'Damped Least Squares & Nullspace Projection',
              },
            },
          ],
        },
        {
          id: 'sub-ctrl-2',
          title: 'Sensors, State Estimation & Control Systems',
          description: 'Kalman filtering, IMU fusion, PID / LQR control, and embedded actuation.',
          color: '#06b6d4',
          topics: [
            {
              id: 'top-ctrl-201',
              title: 'Kalman Filter & Sensor Fusion (IMU + Odometry)',
              description: 'Linear Kalman filtering and Extended Kalman Filter (EKF) for noisy robotic sensors.',
              difficulty: 'advanced',
              estimatedMinutes: 110,
              prerequisites: ['Probability and Statistics', 'State-space models'],
              practicalRelevance: 'Drift correction in mobile robots and self-driving vehicles.',
              examRelevance: 'Control theory and autonomous systems assessments.',
              recommendedStack: {
                primary: 'Probabilistic Robotics by Thrun, Burgard, and Fox',
                secondary: 'Kalman and Bayesian Filters in Python by Roger Labbe',
                practice: 'FilterPy Python Simulation Notebooks',
                project: '2D Mobile Robot Pose Estimator with EKF',
                advanced: 'Unscented Kalman Filter & Graph SLAM',
              },
            },
          ],
        },
      ],
      suggestedProjects: [
        {
          title: 'Autonomous Mobile Robot Simulation with Path Planning (A* & DWA)',
          description: 'Build an autonomous mobile robot navigation pipeline combining sensor fusion, global A* planner, and local Dynamic Window Approach obstacle avoidance.',
          requiredTopics: ['SO(3) Rotations', 'Kalman Filter & Sensor Fusion'],
          milestones: ['Kinematic simulation engine', 'Sensor noise generator', 'A* Pathfinding on 2D grid', 'Closed-loop PID path follower'],
        },
      ],
    };
  }

  // Default: Full-Stack & Developer / AI
  return {
    curriculumTitle: 'Full-Stack Software Architecture & Modern Systems',
    domain: 'Software Engineering',
    level: params.level || 'beginner',
    estimatedTotalHours: 80,
    prerequisiteAnalysis: {
      assumedKnowledge: ['High School Mathematics', 'Computer Basics'],
      missingPrerequisitesFound: ['Memory Model Concepts', 'Asynchronous Event Loop'],
      reorderedReasoning: 'Structured basics before asynchronous programming and distributed backend patterns.',
    },
    subjects: [
      {
        id: 'sub-core-1',
        title: 'Core Programming & Computational Thinking',
        description: 'Variables, data structures, algorithm efficiency, and object-oriented paradigms.',
        color: '#10b981',
        topics: [
          {
            id: 'top-core-101',
            title: 'Memory Models, Variables & Control Flow',
            description: 'Stack vs heap, execution context, scoping, and branching logic.',
            difficulty: 'beginner',
            estimatedMinutes: 50,
            prerequisites: [],
            practicalRelevance: 'Prevents memory leaks and silent runtime bugs.',
            examRelevance: 'Foundational programming assessments.',
            recommendedStack: {
              primary: 'Official Language Documentation (TypeScript/Python)',
              secondary: 'Structure and Interpretation of Computer Programs (SICP)',
              practice: 'LeetCode Easy & Exercism',
              project: 'CLI Task Manager with JSON persistence',
              advanced: 'Memory profiling with Chrome DevTools / Valgrind',
            },
          },
          {
            id: 'top-core-102',
            title: 'Data Structures: Hash Tables, Trees & Graphs',
            description: 'Collision resolution, binary search trees, BFS, DFS, and Big-O computational complexity.',
            difficulty: 'intermediate',
            estimatedMinutes: 90,
            prerequisites: ['Memory Models, Variables & Control Flow'],
            practicalRelevance: 'Writing performant search indices and caching layers.',
            examRelevance: 'Core technical interviews at top engineering firms.',
            recommendedStack: {
              primary: 'Introduction to Algorithms (CLRS)',
              secondary: 'Grokking Algorithms by Aditya Bhargava',
              practice: 'NeetCode 150 DS&A Roadmap',
              project: 'In-Memory Key-Value Store with LRU Cache',
              advanced: 'Self-balancing AVL Trees and B-Trees',
            },
          },
        ],
      },
      {
        id: 'sub-backend-2',
        title: 'Distributed Backends, APIs & Database Systems',
        description: 'REST, GraphQL, ACID transactions, relational schema design, and caching.',
        color: '#6366f1',
        topics: [
          {
            id: 'top-backend-201',
            title: 'Relational Database Design & ACID Compliance',
            description: 'Normalization, foreign keys, query optimization, indexing strategies, and transaction isolation.',
            difficulty: 'intermediate',
            estimatedMinutes: 80,
            prerequisites: ['Data Structures'],
            practicalRelevance: 'Ensuring financial and enterprise data consistency.',
            examRelevance: 'System design and software engineering qualifications.',
            recommendedStack: {
              primary: 'Designing Data-Intensive Applications by Martin Kleppmann',
              secondary: 'Use The Index, Luke (SQL Indexing Guide)',
              practice: 'PostgreSQL interactive query challenges',
              project: 'E-Commerce Database Schema with Transactions',
              advanced: 'Sharding, Replication Lag & Distributed Consensus',
            },
          },
        ],
      },
    ],
    suggestedProjects: [
      {
        title: 'Production-Grade REST API with In-Memory Caching & Rate Limiting',
        description: 'Design and deploy a resilient backend service featuring JWT authentication, PostgreSQL ORM, Redis caching, and automated unit tests.',
        requiredTopics: ['Memory Models', 'Relational Database Design'],
        milestones: ['Schema definition', 'Auth endpoints', 'Redis cache integration', 'Docker compose setup'],
      },
    ],
  };
}

function getFallbackQuestions(params: { topic: string; difficulty?: string }) {
  return {
    questions: [
      {
        id: `q-demo-1-${Date.now()}`,
        prompt: `In the context of ${params.topic}, what is the fundamental theoretical principle governing its core behavior?`,
        type: 'mcq',
        options: [
          'Deterministic state guarantees through mathematical invariants',
          'Heuristic guessing without bounded error margins',
          'Ignoring temporal constraints during execution',
          'Arbitrary unchecked mutable operations',
        ],
        correctAnswer: 'Deterministic state guarantees through mathematical invariants',
        explanation: 'Rigorous engineering systems establish formal invariants and mathematical guarantees to maintain stability and predictable outcomes.',
        difficulty: params.difficulty || 'intermediate',
        hint: 'Look for the option that emphasizes formal guarantees rather than unchecked operations.',
        domain: 'Computer Science',
      },
      {
        id: `q-demo-2-${Date.now()}`,
        prompt: `Explain how a developer or engineer verifies the correctness of an implementation in "${params.topic}" before deploying to production.`,
        type: 'short_answer',
        options: [],
        correctAnswer: 'Through automated unit tests, integration testing, boundary edge-case audits, and benchmark profiling.',
        explanation: 'Verification requires rigorous multi-tier testing that validates both nominal execution paths and extreme edge boundaries.',
        difficulty: params.difficulty || 'intermediate',
        hint: 'Consider test-driven validation and boundary condition audits.',
        domain: 'Engineering Practice',
      },
      {
        id: `q-demo-3-${Date.now()}`,
        prompt: `True or False: In ${params.topic}, runtime latency can be optimized without considering algorithmic complexity or data structure layout.`,
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Algorithmic time complexity (Big-O) and memory cache locality are the primary determinants of real-world latency.',
        difficulty: 'beginner',
        hint: 'Think about asymptotic complexity limits.',
        domain: 'Foundations',
      },
    ],
  };
}
