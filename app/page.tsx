"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Folder,
  FileText,
  Search,
  Plus,
  Trash2,
  Cpu,
  RefreshCw,
  Sparkles,
  Layers,
  Activity,
  Send,
  Eye,
  Edit3,
  Network,
  Download,
  Upload,
  Clock,
  Volume2,
  FileCode,
  Compass,
  ArrowRight,
  Shield,
  Heart,
  ChevronRight,
  ChevronDown,
  Radio,
  User,
  MessageSquare,
  Share2,
  History,
  UserPlus,
  UserCheck,
  Flame,
  ImageIcon,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchUserProfile,
  saveUserProfile,
  fetchPosts,
  createPost,
  toggleLikePost,
  fetchComments,
  createComment,
  UserProfile,
  FeedPost,
  PostComment
} from "@/lib/social-db";
import { auth, isRealFirebase } from "@/lib/firebase";

// Define TypeScript structures
interface VaultFile {
  path: string; // e.g. "01_Projects/PROJECTS.md"
  name: string;
  folder: string;
  content: string;
  updatedAt: string;
  tags?: string[];
}

interface Pattern {
  id: string;
  title: string;
  number: number;
  observation: string;
  implication: string;
  opportunity: string;
  strength: string;
  strengthVal: number;
}

interface Signal {
  id: string;
  title: string;
  number: number;
  stage: string;
  description: string;
  impact: "High" | "Medium" | "Low";
  impactColor: string;
}

interface Connection {
  patternId: string;
  signalId: string;
  strength: "Strong" | "Emerging" | "Weak";
  notes?: string;
}

// Fixed-relative SVG mapping coordinate helpers
const PATTERN_ELEMENTS_COUNT = 7;
const SIGNAL_ELEMENTS_COUNT = 8;

const INITIAL_PATTERNS: Pattern[] = [
  {
    id: "pat_1",
    number: 1,
    title: "Automation Replaces Repetition",
    observation: "Repetitive knowledge tasks are increasingly automated shift-by-shift.",
    implication: "Labor resource structures re-orient quickly from execution to high-level oversight.",
    opportunity: "Build autonomous software orchestrators that automate the repeatable.",
    strength: "7/8",
    strengthVal: 87.5
  },
  {
    id: "pat_2",
    number: 2,
    title: "AI Compresses Time",
    observation: "Complex, specialized work that once took hours now requires minutes.",
    implication: "Raw operational and iteration speed becomes a leading compounding advantage.",
    opportunity: "Increase iteration velocity and launch speed to multiply market feedback loops.",
    strength: "8/8",
    strengthVal: 100.0
  },
  {
    id: "pat_3",
    number: 3,
    title: "Information Becomes Infrastructure",
    observation: "Organized, verified structures provide permanent structural asset utility.",
    implication: "High-context intelligence engines compound value over active execution cycles.",
    opportunity: "Construct durable strategic information maps, not just static transient documents.",
    strength: "6/8",
    strengthVal: 75.0
  },
  {
    id: "pat_4",
    number: 4,
    title: "Systems Scale Better Than Manual Effort",
    observation: "Automated architecture scales exponentially compared to linear headcount.",
    implication: "Designing systems once lets you capture compounding yield indefinitely.",
    opportunity: "Invest directly in repeatable templates and micro-agent frameworks.",
    strength: "7/8",
    strengthVal: 87.5
  },
  {
    id: "pat_5",
    number: 5,
    title: "Leverage Multiplies Output",
    observation: "Technological leverage unlocks disproportionate capability for lean groups.",
    implication: "Highly structured micro-teams of 1-3 people can execute enterprise-scale items.",
    opportunity: "Minimize administrative scale and maximize programmatic API integrations.",
    strength: "6/8",
    strengthVal: 75.0
  },
  {
    id: "pat_6",
    number: 6,
    title: "Clarity Creates Momentum",
    observation: "Frictionless operational environments reduce execution delay drastically.",
    implication: "Extremely simple, transparent guidelines prevent decision paralysis.",
    opportunity: "Implement hard strategic filters and clear execution goals.",
    strength: "6/8",
    strengthVal: 75.0
  },
  {
    id: "pat_7",
    number: 7,
    title: "Adaptation Compounds Advantage",
    observation: "The capacity to quickly alter tactics beats static optimization patterns.",
    implication: "Continuous active learning constructs barriers other competitors cannot match.",
    opportunity: "Design robust live feedback structures that listen and self-correct.",
    strength: "5/8",
    strengthVal: 62.5
  }
];

const INITIAL_SIGNALS: Signal[] = [
  {
    id: "sig_1",
    number: 1,
    title: "AI Customer Service Expansion",
    stage: "Acceleration",
    description: "Multimodal systems replace standard tier-1 support across major consumer platforms.",
    impact: "High",
    impactColor: "emerald"
  },
  {
    id: "sig_2",
    number: 2,
    title: "Enterprise Copilot Adoption",
    stage: "Acceleration",
    description: "Collaborative developer and operational assistants scale to standard enterprise suites.",
    impact: "Medium",
    impactColor: "amber"
  },
  {
    id: "sig_3",
    number: 3,
    title: "GPU & Infrastructure Investment",
    stage: "Acceleration",
    description: "Massive scale-out capital expenditure projects for high-density AI cluster datacenters.",
    impact: "High",
    impactColor: "emerald"
  },
  {
    id: "sig_4",
    number: 4,
    title: "Open-Source LLM Competition",
    stage: "Acceleration",
    description: "Highly performant open-weights models close capabilities gap with proprietary models.",
    impact: "Medium",
    impactColor: "amber"
  },
  {
    id: "sig_5",
    number: 5,
    title: "AI Automation Platforms Scale",
    stage: "Consolidation",
    description: "Centralized workspace suites merge operational tools with automated step flows.",
    impact: "High",
    impactColor: "emerald"
  },
  {
    id: "sig_6",
    number: 6,
    title: "AI Agent Frameworks Growth",
    stage: "Acceleration",
    description: "Multi-agent tool invocation architectures transition from research to commercial deploy.",
    impact: "High",
    impactColor: "emerald"
  },
  {
    id: "sig_7",
    number: 7,
    title: "Enterprise AI Budget Expansion",
    stage: "Acceleration",
    description: "Technology spending budgets shift from maintenance software toward generative pipelines.",
    impact: "High",
    impactColor: "emerald"
  },
  {
    id: "sig_8",
    number: 8,
    title: "Regulation & Governance Increase",
    stage: "Acceleration",
    description: "Global governing frameworks structure compliance checks for advanced models.",
    impact: "Low",
    impactColor: "blue"
  }
];

const INITIAL_CONNECTIONS: Connection[] = [
  { patternId: "pat_1", signalId: "sig_1", strength: "Strong" },
  { patternId: "pat_1", signalId: "sig_5", strength: "Strong" },
  { patternId: "pat_1", signalId: "sig_6", strength: "Strong" },
  
  { patternId: "pat_2", signalId: "sig_1", strength: "Strong" },
  { patternId: "pat_2", signalId: "sig_2", strength: "Strong" },
  { patternId: "pat_2", signalId: "sig_5", strength: "Strong" },
  { patternId: "pat_2", signalId: "sig_6", strength: "Strong" },

  { patternId: "pat_3", signalId: "sig_3", strength: "Strong" },
  { patternId: "pat_3", signalId: "sig_7", strength: "Strong" },

  { patternId: "pat_4", signalId: "sig_3", strength: "Emerging" },
  { patternId: "pat_4", signalId: "sig_5", strength: "Strong" },
  { patternId: "pat_4", signalId: "sig_6", strength: "Strong" },

  { patternId: "pat_5", signalId: "sig_2", strength: "Strong" },
  { patternId: "pat_5", signalId: "sig_6", strength: "Strong" },

  { patternId: "pat_6", signalId: "sig_2", strength: "Strong" },
  { patternId: "pat_6", signalId: "sig_7", strength: "Emerging" },

  { patternId: "pat_7", signalId: "sig_4", strength: "Strong" },
  { patternId: "pat_7", signalId: "sig_8", strength: "Emerging" }
];

const FOLDERS = [
  "00_Inbox",
  "01_Projects",
  "02_Research",
  "03_AI",
  "04_Content",
  "05_Finance",
  "06_Learning",
  "07_Archive",
  "99_System"
];

// Initial pre-populated files
const INITIAL_FILES: VaultFile[] = [
  {
    path: "00_Inbox/BRAIN_DUMP.md",
    name: "BRAIN_DUMP.md",
    folder: "00_Inbox",
    updatedAt: "2026-05-23T21:48:00Z",
    tags: ["inbox", "ideas"],
    content: `# Brain Dump & Raw Inputs

Capture thoughts, market signals, or voice transcriptions here first.

- AI systems are changing how businesses operate at an exponential rate.
- I keep thinking about automation and reusable strategic infrastructure [[SYSTEM_MAP]].
- Information feels disconnected and should link together via interactive mapping visualizations.
- Markets move in cycles based on human behavior.
- There is a premium opportunity to organize this research into operational systems [[PROJECTS]].

---
### Strategic Signals Immediacy
We need to monitor how fast **Enterprise Copilot Adoption** is strengthening **AI Compresses Time**. Look at enterprise developer performance reports.`
  },
  {
    path: "01_Projects/PROJECTS.md",
    name: "PROJECTS.md",
    folder: "01_Projects",
    updatedAt: "2026-05-23T21:48:00Z",
    tags: ["projects", "status"],
    content: `# Active & Future Strategic Projects

Managed dynamically through the decision filters inside [[DECISION_FILTER]].

## Active Projects

### AI Strategic Intelligence Vault
- **Status**: Active & Deploying
- **Objective**: Build an interactive, AI-assisted pattern mapping system and Obsidian-style database to convert signals into actionable leverage.
- **Market**: Strategy, knowledge workers, and executive researchers.
- **AI Leverage**: Synthesis, pattern linkage recommendations, and automated vault filing system [[all_skills]].
- **Revenue Model**: High-tier business subscriptions or proprietary intelligence products.
- **Next Actions**: Expand signals mapping and launch dynamic real-time integrations.

---

## Future Projects
- **Project Intrepid**: Multi-agent orchestration tracking pipeline.
- **Knowledge Architecture Hub**: Enterprise automated document pipeline.
- **Automated Competitor Tracker**: Continuous signal-to-pattern mapper.`
  },
  {
    path: "02_Research/CORE_THESIS.md",
    name: "CORE_THESIS.md",
    folder: "02_Research",
    updatedAt: "2026-05-23T21:48:00Z",
    tags: ["thesis", "research"],
    content: `# Core Strategic Thesis

## Primary Observation
AI will restructure knowledge work, economic leverage, and organizational coordination faster than traditional institutions can adapt.

## Supporting Assumptions
1. AI capabilities will improve faster than regulatory structures.
2. Information work is easier to automate than physical labor.
3. Individuals utilizing AI effectively gain disproportionate leverage.
4. Data, integration, and structured files become the new core infrastructure block.

## Major Implications
- Knowledge extraction compresses to near-zero time.
- Operational overhead drops drastically.
- Small, hyper-focused teams outperform large groups.
- Systems that organize and refine information efficiently possess continuous advantage.`
  },
  {
    path: "02_Research/COMPETITORS.md",
    name: "COMPETITORS.md",
    folder: "02_Research",
    updatedAt: "2026-04-10T21:48:00Z",
    tags: ["competitors", "research"],
    content: `# Strategic Competitor Matrix

## AI Infrastructure Leaders
- **OpenAI**: Fast distribution, GPT multimodal engines, ChatGPT ecosystem.
- **Anthropic**: High security, Claude enterprise API pipelines, complex agent pipelines.
- **Google DeepMind**: Scale, Gemini multi-million token context window, deep technical integration.

## Agent & Automation Platforms
- LangChain, AutoGen, CrewAI: Open-source tooling getting rapidly commoditized.
- Salesforce & HubSpot: Embedding system actions directly inside active CRM workflows.

## Strategic Direction
While raw infrastructure gets cheaper, elite value flows to personalized, domain-specific systems that link research with operational execution.`
  },
  {
    path: "02_Research/SYSTEM_MAP.md",
    name: "SYSTEM_MAP.md",
    folder: "02_Research",
    updatedAt: "2026-05-23T21:48:00Z",
    tags: ["system", "mapping"],
    content: `# Strategic Vault System Map

Purpose:
Build connected operational systems that organize research, workflows, intelligence, and automation into scalable, compounding structures.

- **Core Thesis**: Match technological acceleration with real-time operational capacity.
- **Bipartite Mapping**: Link the abstract Core Patterns directly to the concrete Key Signals occurring in the market.
- **Continuous Iteration**: Loop raw inputs in 00_Inbox back through our systems to maintain fresh strategic relevance.

See also: [[CORE_THESIS]] and [[DAILY_OPERATING_LOOP]].`
  },
  {
    path: "03_AI/PROMPTS.md",
    name: "PROMPTS.md",
    folder: "03_AI",
    updatedAt: "2026-04-15T21:48:00Z",
    tags: ["ai", "prompts"],
    content: `# High-Value Model Prompts & System Rules

## Prompts for Signal Extraction
\`\`\`markdown
Given raw industry news:
- Summarize strategically.
- Map to closest economic value layers.
- Predict secondary failure modes.
\`\`\`

## Prompts for System Health
- Identify redundant files or directories inside [[SYSTEM_MAP]].
- Surface divergent anomalies.
- Re-evaluate supporting assumptions against current news.`
  },
  {
    path: "05_Finance/ECONOMIC_DIRECTION.md",
    name: "ECONOMIC_DIRECTION.md",
    folder: "05_Finance",
    updatedAt: "2026-05-23T21:48:00Z",
    tags: ["finance", "strategy"],
    content: `# Economic Direction & Paths to Market

## Monetization Principles
Structured intelligence systems generate commercial value by reducing error rates and compressing research time for executives from days to minutes.

## Monetization Paths
- **Enterprise Strategic Consulting**: Charging premiums for tailored AI adaptation roadmap models.
- **Proprietary Knowledge Dashboards**: Licensable interactive maps of shifting market signals.
- **Workflow Automation Setup**: Building custom agentic pipelines to feed intelligence into CRM/databases.`
  },
  {
    path: "99_System/all_skills.json",
    name: "all_skills.json",
    folder: "99_System",
    updatedAt: "2026-05-23T21:48:00Z",
    tags: ["system", "capabilities"],
    content: `{
  "system_version": "1.0.0",
  "capabilities": {
    "text_synthesis": "Gemini-3.5-flash server-side pipeline",
    "mapping_index": "Bipartite graph with real-time weights",
    "file_persistence": "HTML5 LocalStorage context mirroring"
  }
}`
  },
  {
    path: "99_System/DECISION_FILTER.md",
    name: "DECISION_FILTER.md",
    folder: "99_System",
    updatedAt: "2026-05-23T21:48:00Z",
    tags: ["system", "filters"],
    content: `# Core Decision Filter

Before executing any strategic movement, filter it through these parameters:

- Does it create outsized leverage?
- Does it scale gracefully without linear headcount?
- Does it automate a repetitive bottleneck?
- Does it compound over time?
- Is it aligned with the Primary Thesis [[CORE_THESIS]]?
- What is the cost of absolute failure?`
  },
  {
    path: "99_System/DAILY_OPERATING_LOOP.md",
    name: "DAILY_OPERATING_LOOP.md",
    folder: "99_System",
    updatedAt: "2026-05-23T21:48:00Z",
    tags: ["system", "operations"],
    content: `# Daily Operating Loop Structure

## 1. Input Capture
- Feed raw emails, links, or notes to [[BRAIN_DUMP]].

## 2. Signal Analysis
- What appears to be recurring? What is just transient noise?

## 3. Pattern Connection
- How does this news link with the 7 Core Patterns? See [[SYSTEM_MAP]].

## 4. Operational execution
- Translate insights into tasks in PROJECTS.md or filters to apply.`
  },
  {
    path: "99_System/BREATHING_SPACE.md",
    name: "BREATHING_SPACE.md",
    folder: "99_System",
    updatedAt: "2026-05-23T21:48:00Z",
    tags: ["system", "breathing"],
    content: `# Cognitive Breathing Space

Continuous intake without selective reduction leads to cognitive overload and saturation.

## Pause Strategy
- Halt all incoming data feeds in **00_Inbox**.
- Re-evaluate the core objective: What actually matters?
- Strip duplication and remove folder noise.
- Space is an active part of tactical strategic intelligence.

Use the box breathing mechanism inside the **Cognitive Space** tab of this system to reset active friction.`
  }
];

// Synthesizer State Messages
const REASSURING_MESSAGES = [
  "Establishing server telemetry pipeline, querying 'gemini-3.5-flash'...",
  "Injecting raw strategic context... parsing syntax strings...",
  "Parsing semantic elements, classifying information layers...",
  "Re-evaluating mathematical weights for Core Patterns..."
];

interface AutoGrowingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
}

function AutoGrowingTextarea({ value, onChange, className, ...props }: AutoGrowingTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={className}
      {...props}
    />
  );
}

export default function AIStrategicIntelligenceVault() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"workspace" | "graph" | "decompression" | "feed" | "profile">("workspace");
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [activeFile, setActiveFile] = useState<VaultFile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("preview");
  const [editingContent, setEditingContent] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  // --- Social / Community Feed and Profile State ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [activeComments, setActiveComments] = useState<Record<string, PostComment[]>>({});
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Create Post Form state
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImagePrompt, setNewPostImagePrompt] = useState("");
  const [newPostSelectedFile, setNewPostSelectedFile] = useState("");
  const [isGeneratingPostImage, setIsGeneratingPostImage] = useState(false);
  const [postDraftImageUrl, setPostDraftImageUrl] = useState("");
  const [isPublishingPost, setIsPublishingPost] = useState(false);

  // Edit Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarGeneratePrompt, setAvatarGeneratePrompt] = useState("cyberpunk strategic AI neural architect");

  // Bipartite Map Interactive State
  const [patterns, setPatterns] = useState<Pattern[]>(INITIAL_PATTERNS);
  const [signals, setSignals] = useState<Signal[]>(INITIAL_SIGNALS);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null);
  const [patternEditForm, setPatternEditForm] = useState<{title: string; observation: string; opportunity: string}>({title: "", observation: "", opportunity: ""});

  // Future Impact Scenarios State
  const [generatingImpactKey, setGeneratingImpactKey] = useState<string | null>(null);
  const [connectionImpacts, setConnectionImpacts] = useState<Record<string, {
    title: string;
    text: string;
    takeaway: string;
    probability: string;
  }>>({});

  // Gemini Synthesis Intake Form State
  const [intakeText, setIntakeText] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisMessages, setSynthesisMessages] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [synthesisResult, setSynthesisResult] = useState<any | null>(null);

  // AI Sage Chatbot State
  const [sageMessage, setSageMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "sage"; text: string }[]>([
    {
      sender: "sage",
      text: "Greetings. I am Sage, your strategic intelligence companion. Ask me anything about your current thesis, core market signals, or active projects, and I will parse your vault's structure directly."
    }
  ]);
  const [isSageResponding, setIsSageResponding] = useState(false);

  // Box Breathing Space Animation Loop
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold (Full)" | "Exhale" | "Hold (Empty)">("Inhale");
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [newDecisionText, setNewDecisionText] = useState("");

  // Simulated live clock and terminal output logs
  const [utcTime, setUtcTime] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // DOM node references for visual SVG connections
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  // Load and Save persisted state in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFiles = localStorage.getItem("strategic_vault_files");
      const storedConnections = localStorage.getItem("strategic_vault_connections");
      const storedPatterns = localStorage.getItem("strategic_vault_patterns");
      if (storedPatterns) {
        try {
          setPatterns(JSON.parse(storedPatterns));
        } catch (err) {
          console.error("Failed to parse stored patterns", err);
        }
      }
      if (storedFiles) {
        try {
          const parsed = JSON.parse(storedFiles);
          const migratedFiles = parsed.map((f: any) => ({
            ...f,
            tags: f.tags || []
          }));
          setVaultFiles(migratedFiles);
          // Set initial active file
          const brainDump = migratedFiles.find((f: VaultFile) => f.name === "BRAIN_DUMP.md") || migratedFiles[0];
          if (brainDump) {
            setActiveFile(brainDump);
            setEditingContent(brainDump.content);
          }
        } catch (e) {
          setVaultFiles(INITIAL_FILES);
          setActiveFile(INITIAL_FILES[0]);
          setEditingContent(INITIAL_FILES[0].content);
        }
      } else {
        setVaultFiles(INITIAL_FILES);
        setActiveFile(INITIAL_FILES[0]);
        setEditingContent(INITIAL_FILES[0].content);
      }

      if (storedConnections) {
        try {
          setConnections(JSON.parse(storedConnections));
        } catch (e) {
          setConnections(INITIAL_CONNECTIONS);
        }
      }

      const storedImpacts = localStorage.getItem("strategic_vault_connection_impacts");
      if (storedImpacts) {
        try {
          setConnectionImpacts(JSON.parse(storedImpacts));
        } catch (e) {
          console.error("Failed to parse connection impacts", e);
        }
      }
    }

    // Load social integrations
    const loadSocialIntegrations = async (curUser: any) => {
      try {
        const userUid = curUser ? curUser.uid : "current_user_strategist"; 
        const fetchedProfile = await fetchUserProfile(userUid);
        
        let needsUpdate = false;
        let updatedProfile = { ...fetchedProfile };

        // If newly authenticated via Google, populate their Google details if profile is default
        if (curUser) {
          if (updatedProfile.username.startsWith("Strategist_") && curUser.displayName) {
            const sanitizedName = curUser.displayName.toLowerCase().replace(/[^a-z0-9]/g, "");
            updatedProfile.username = sanitizedName || updatedProfile.username;
            needsUpdate = true;
          }
          if (updatedProfile.avatarUrl.includes("photo-1535713875002-d1d5cf377fde") && curUser.photoURL) {
            updatedProfile.avatarUrl = curUser.photoURL;
            needsUpdate = true;
          }
        }

        let fileCount = 9;
        const storedFiles = localStorage.getItem("strategic_vault_files");
        if (storedFiles) {
          try {
            fileCount = JSON.parse(storedFiles).length;
          } catch(e){}
        } else {
          fileCount = INITIAL_FILES.length;
        }

        if (updatedProfile.savedProjectsCount !== fileCount) {
          updatedProfile.savedProjectsCount = fileCount;
          needsUpdate = true;
        }

        setProfile(updatedProfile);
        setEditUsername(updatedProfile.username);
        setEditAvatarUrl(updatedProfile.avatarUrl);

        if (needsUpdate) {
          await saveUserProfile(updatedProfile);
        }

        const fetchedPosts = await fetchPosts();
        setFeedPosts(fetchedPosts);
        
        for (const p of fetchedPosts) {
          const comments = await fetchComments(p.id);
          setActiveComments(prev => ({ ...prev, [p.id]: comments }));
        }
      } catch (err) {
        console.error("Failed to load community/profile integrations:", err);
      }
    };

    let unsubscribeAuth: (() => void) | undefined;
    if (isRealFirebase && auth) {
      import("firebase/auth").then(({ onAuthStateChanged }) => {
        unsubscribeAuth = onAuthStateChanged(auth, (user) => {
          setFirebaseUser(user);
          setIsAuthLoading(false);
          loadSocialIntegrations(user);
          if (user) {
            addTerminalLog(`Secure session established with Agent UID: ${user.uid.substring(0, 8)}...`);
          } else {
            addTerminalLog("Securing off-network workspace profile (Offline simulation active).");
          }
        });
      });
    } else {
      setIsAuthLoading(false);
      loadSocialIntegrations(null);
      addTerminalLog("Establishing local simulated workspace...");
    }

    addTerminalLog("System initialized. Vault structures loaded.");
    addTerminalLog("AI Strategic Synthesis node online.");

    const updateClock = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    setIsMounted(true);
    return () => {
      clearInterval(interval);
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  // Update SVG connections dimensions on change or resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setSvgDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab]);

  // Save changes to vault files
  const saveVaultToLocalStorage = (filesToSave: VaultFile[]) => {
    localStorage.setItem("strategic_vault_files", JSON.stringify(filesToSave));
  };

  const addTerminalLog = (msg: string) => {
    setTerminalLogs((prev) => [
      `[${new Date().toISOString().substring(11, 19)}] ${msg}`,
      ...prev.slice(0, 15)
    ]);
  };

  // Switch Active File
  const handleSelectFile = (file: VaultFile) => {
    // Save current file text first if was editing
    if (activeFile) {
      const updated = vaultFiles.map((f) =>
        f.path === activeFile.path ? { ...f, content: editingContent, updatedAt: new Date().toISOString() } : f
      );
      setVaultFiles(updated);
      saveVaultToLocalStorage(updated);
    }
    setActiveFile(file);
    setEditingContent(file.content);
    addTerminalLog(`Opened file: ${file.path}`);
  };

  // Add a new file inside a folder
  const handleCreateFile = (folder: string) => {
    const name = prompt("Enter a name for the new file (include .md or .json, e.g. competitor_news.md):");
    if (!name) return;
    const cleanName = name.endsWith(".md") || name.endsWith(".json") ? name : `${name}.md`;
    const newPath = `${folder}/${cleanName}`;

    if (vaultFiles.some((f) => f.path === newPath)) {
      alert("A file with this name already exists in that folder.");
      return;
    }

    const newFile: VaultFile = {
      path: newPath,
      name: cleanName,
      folder: folder,
      content: `# ${cleanName.replace(".md", "").toUpperCase()}\n\nCreated: ${new Date().toLocaleDateString()}\n\nEnter strategic analysis here...`,
      updatedAt: new Date().toISOString(),
      tags: []
    };

    const updated = [...vaultFiles, newFile];
    setVaultFiles(updated);
    saveVaultToLocalStorage(updated);
    setActiveFile(newFile);
    setEditingContent(newFile.content);
    addTerminalLog(`Created file: ${newPath}`);
  };

  // Delete active file
  const handleDeleteFile = (pathToDelete: string) => {
    if (!confirm(`Are you absolutely sure you want to delete ${pathToDelete}?`)) return;
    const updated = vaultFiles.filter((f) => f.path !== pathToDelete);
    setVaultFiles(updated);
    saveVaultToLocalStorage(updated);

    if (activeFile?.path === pathToDelete) {
      if (updated.length > 0) {
        setActiveFile(updated[0]);
        setEditingContent(updated[0].content);
      } else {
        setActiveFile(null);
        setEditingContent("");
      }
    }
    addTerminalLog(`Deleted file: ${pathToDelete}`);
  };

  // Save current editing content
  const handleSaveCurrentContent = () => {
    if (!activeFile) return;
    const updated = vaultFiles.map((f) =>
      f.path === activeFile.path ? { ...f, content: editingContent, updatedAt: new Date().toISOString() } : f
    );
    setVaultFiles(updated);
    saveVaultToLocalStorage(updated);
    addTerminalLog(`Saved file: ${activeFile.path}`);
  };

  // Reset to original factory database structures
  const handleFactoryReset = () => {
    if (!confirm("This will erase all local modifications to your files and mappings. Proceed?")) return;
    localStorage.removeItem("strategic_vault_files");
    localStorage.removeItem("strategic_vault_connections");
    localStorage.removeItem("strategic_vault_patterns");
    setVaultFiles(INITIAL_FILES);
    const brainDump = INITIAL_FILES.find((f) => f.name === "BRAIN_DUMP.md") || INITIAL_FILES[0];
    setActiveFile(brainDump);
    setEditingContent(brainDump.content);
    setConnections(INITIAL_CONNECTIONS);
    setPatterns(INITIAL_PATTERNS);
    setSelectedPatternId(null);
    setSelectedSignalId(null);
    setHoveredNodeId(null);
    addTerminalLog("System reset complete. Loaded pure template schemas.");
  };

  // Download entire vault as an simulated markdown package export
  const handleExportVaultJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vaultFiles, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ai_strategic_vault_export_${new Date().toISOString().substring(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addTerminalLog("Strategic Vault files JSON package exported successfully.");
  };

  // Box Breathing Space Dynamic Interval Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Switch phase
          switch (breathingPhase) {
            case "Inhale":
              setBreathingPhase("Hold (Full)");
              return 4;
            case "Hold (Full)":
              setBreathingPhase("Exhale");
              return 4;
            case "Exhale":
              setBreathingPhase("Hold (Empty)");
              return 4;
            case "Hold (Empty)":
              setBreathingPhase("Inhale");
              return 4;
            default:
              return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingPhase]);

  // Submit high-leverage decision directly inside the breathing session
  const handleSubmitDecompressionDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecisionText.trim()) return;

    // Locate or create decisions.md file
    const decisionsFile = vaultFiles.find((f) => f.path === "99_System/DECISION_FILTER.md") || 
                          vaultFiles.find((f) => f.path.endsWith("decisions.md"));

    const newDecisionSection = `\n- **Decision (${new Date().toLocaleDateString()}):** ${newDecisionText}\n  - *Leverage Assessment:* Approved in decompression silence.`;

    let updatedFiles = [...vaultFiles];
    if (decisionsFile) {
      updatedFiles = vaultFiles.map((f) =>
        f.path === decisionsFile.path ? { ...f, content: f.content + newDecisionSection, updatedAt: new Date().toISOString() } : f
      );
      if (activeFile?.path === decisionsFile.path) {
        setEditingContent(decisionsFile.content + newDecisionSection);
      }
    } else {
      // Create one in projects
      const newPath = "01_Projects/DECISIONS_LOG.md";
      const newFile: VaultFile = {
        path: newPath,
        name: "DECISIONS_LOG.md",
        folder: "01_Projects",
        content: `# Decisions Log\n\n- **Decision:** ${newDecisionText}`,
        updatedAt: new Date().toISOString(),
        tags: ["decisions"]
      };
      updatedFiles.push(newFile);
    }

    setVaultFiles(updatedFiles);
    saveVaultToLocalStorage(updatedFiles);
    setNewDecisionText("");
    addTerminalLog("Committed absolute strategic decision to files.");
  };

  // --- SOCIAL SYSTEM EVENT HANDLERS ---
  const recordHistoryLog = async (actionText: string) => {
    if (!profile) return;
    const newHistoryItem = {
      id: `hist_${Date.now()}`,
      action: actionText,
      timestamp: new Date().toISOString()
    };
    const updatedProfile = {
      ...profile,
      history: [newHistoryItem, ...profile.history],
      savedProjectsCount: vaultFiles.length
    };
    setProfile(updatedProfile);
    await saveUserProfile(updatedProfile);
  };

  const handleToggleLike = async (postId: string) => {
    if (!profile) return;
    const liked = await toggleLikePost(postId, profile.uid);
    const updatedPosts = feedPosts.map((p) => {
      if (p.id === postId) {
        const hasLiked = p.likes.includes(profile.uid);
        const brandNewLikes = hasLiked 
          ? p.likes.filter((u) => u !== profile.uid) 
          : [...p.likes, profile.uid];
        return {
          ...p,
          likes: brandNewLikes,
          likesCount: brandNewLikes.length
        };
      }
      return p;
    });
    setFeedPosts(updatedPosts);
    addTerminalLog(liked ? `Liked community post: ${postId}` : `Unliked community post: ${postId}`);
    await recordHistoryLog(liked ? `Liked community post titled "${feedPosts.find(p => p.id === postId)?.title || postId}"` : `Removed like from post: ${postId}`);
  };

  const handleToggleFollow = async (creatorUid: string, creatorName: string) => {
    if (!profile) return;
    const isFollowing = profile.following.includes(creatorUid);
    const newFollowing = isFollowing 
      ? profile.following.filter(uid => uid !== creatorUid) 
      : [...profile.following, creatorUid];
      
    const updatedProfile = {
      ...profile,
      following: newFollowing
    };
    setProfile(updatedProfile);
    await saveUserProfile(updatedProfile);
    
    // Find matching post in feed and update author follow status
    const actStr = isFollowing ? `Unsubscribed from creator: @${creatorName}` : `Subscribed/Followed creator: @${creatorName}`;
    addTerminalLog(actStr);
    await recordHistoryLog(actStr);
  };

  const handleGoogleSignIn = async () => {
    if (!isRealFirebase || !auth) {
      addTerminalLog("Auth error: Firebase is simulated. Sign in is not supported.");
      return;
    }
    try {
      addTerminalLog("Initiating professional Google Identity synchronization...");
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      addTerminalLog(`Credentials sync failure: ${err.message}`);
    }
  };

  const handleGoogleSignOut = async () => {
    if (!isRealFirebase || !auth) return;
    try {
      addTerminalLog("De-synchronizing Google identity session...");
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
    } catch (err: any) {
      addTerminalLog(`Sign-out failure: ${err.message}`);
    }
  };

  const handleGenerateImpactScenario = async (patternId: string, signalId: string) => {
    const key = `${patternId}_${signalId}`;
    const pat = patterns.find(p => p.id === patternId);
    const sig = signals.find(s => s.id === signalId);
    const conn = connections.find(c => c.patternId === patternId && c.signalId === signalId);
    
    if (!pat || !sig || !conn) {
      addTerminalLog("Impact error: missing connection definition.");
      return;
    }
    
    setGeneratingImpactKey(key);
    addTerminalLog(`Initiating Future Impact Scenario projection for P${pat.number} <-> S${sig.number}...`);
    
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_future_impact",
          payload: {
            patternTitle: pat.title,
            patternDesc: `${pat.observation}\n${pat.implication}\n${pat.opportunity}`,
            signalTitle: sig.title,
            signalDesc: sig.description,
            connectionStrength: conn.strength,
            noteHistory: conn.notes
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const scenario = await response.json();
      
      const newImpacts = {
        ...connectionImpacts,
        [key]: {
          title: scenario.scenarioTitle || "Simulated Futures Projection",
          text: scenario.scenarioText || "No detailed scenario returned.",
          takeaway: scenario.strategicTakeaway || "No strategic takeaway provided.",
          probability: scenario.probabilityScore || "50%"
        }
      };
      
      setConnectionImpacts(newImpacts);
      localStorage.setItem("strategic_vault_connection_impacts", JSON.stringify(newImpacts));
      addTerminalLog(`Future Impact Scenario generated for connection P${pat.number} <-> S${sig.number}.`);
      
      await recordHistoryLog(`Generated Future Impact Scenario for connection: P${pat.number} <-> S${sig.number}`);
    } catch (err: any) {
      addTerminalLog(`Synthesis projection failed: ${err.message}`);
    } finally {
      setGeneratingImpactKey(null);
    }
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert("Please provide both a title and description of your creation.");
      return;
    }
    
    setIsPublishingPost(true);
    try {
      const linkedFile = vaultFiles.find(f => f.path === newPostSelectedFile);
      const newPostId = `post_${Date.now()}`;
      
      const newPost = await createPost({
        id: newPostId,
        title: newPostTitle,
        content: newPostContent,
        imageUrl: postDraftImageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        authorId: profile.uid,
        authorName: profile.username,
        authorAvatar: profile.avatarUrl,
        createdAt: new Date().toISOString(),
        associatedFile: linkedFile?.path
      });
      
      setFeedPosts(prev => [newPost, ...prev]);
      setActiveComments(prev => ({ ...prev, [newPostId]: [] }));
      
      addTerminalLog(`Disseminated core strategic insight: ${newPostTitle}`);
      await recordHistoryLog(`Published community feed project: "${newPostTitle}"`);
      
      // Reset form variables
      setNewPostTitle("");
      setNewPostContent("");
      setPostDraftImageUrl("");
      setNewPostSelectedFile("");
      setNewPostImagePrompt("");
    } catch (err) {
      console.error("Publishing post failed:", err);
    } finally {
      setIsPublishingPost(false);
    }
  };

  const handleGeneratePostImage = async () => {
    if (!newPostTitle.trim()) {
      alert("Please provide a pattern title first to seed the artwork generation.");
      return;
    }
    setIsGeneratingPostImage(true);
    addTerminalLog("Invoking Neural AI Art Synthesizer engine...");
    try {
      const promptTerm = encodeURIComponent(newPostImagePrompt ? `${newPostImagePrompt} cyberpunk tech sci-fi schematic diagram` : `${newPostTitle} vector high-tech schematic blueprints violet and cyan colors`);
      const generatedUrl = `https://image.pollinations.ai/prompt/${promptTerm}?width=800&height=450&seed=${Math.floor(Math.random() * 100000)}&nologo=true`;
      
      setPostDraftImageUrl(generatedUrl);
      addTerminalLog("Artwork synthesized successfully. Visual node linked in draft.");
      await recordHistoryLog(`Synthesized AI blueprint artwork for topic: "${newPostTitle}"`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPostImage(false);
    }
  };

  const handleGenerateAvatarImage = async () => {
    setIsGeneratingAvatar(true);
    addTerminalLog("Spinning up avatar neural layout generation...");
    try {
      const promptTerm = encodeURIComponent(avatarGeneratePrompt || "minimalist tech cyberpunk futuristic icon glowing avatar");
      const generatedUrl = `https://image.pollinations.ai/prompt/${promptTerm}?width=150&height=150&seed=${Math.floor(Math.random() * 100000)}&nologo=true`;
      
      setEditAvatarUrl(generatedUrl);
      addTerminalLog("Synthesized virtual professional profile avatar.");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleSaveProfileChanges = async () => {
    if (!profile) return;
    if (!editUsername.trim()) {
      alert("Username cannot be empty.");
      return;
    }
    
    const updatedProfile = {
      ...profile,
      username: editUsername,
      avatarUrl: editAvatarUrl
    };
    setProfile(updatedProfile);
    await saveUserProfile(updatedProfile);
    setIsEditingProfile(false);
    addTerminalLog(`Updated profile details: @${editUsername}`);
    await recordHistoryLog(`Modified personal profile settings (Updated username to @${editUsername})`);
  };

  const handlePostComment = async (postId: string) => {
    if (!profile) return;
    const text = newCommentTexts[postId] || "";
    if (!text.trim()) return;
    
    try {
      const commentId = `comment_${Date.now()}`;
      const newComment = await createComment(postId, {
        id: commentId,
        postId,
        authorId: profile.uid,
        authorName: profile.username,
        authorAvatar: profile.avatarUrl,
        content: text,
        createdAt: new Date().toISOString()
      });
      
      setActiveComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      
      setFeedPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
      setNewCommentTexts(prev => ({ ...prev, [postId]: "" }));
      addTerminalLog(`Added comment on post: ${postId}`);
      await recordHistoryLog(`Commented on community post: "${feedPosts.find(p => p.id === postId)?.title || postId}"`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    addTerminalLog(`Uploading profile picture: ${file.name}`);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      if (base64String) {
        setEditAvatarUrl(base64String);
        addTerminalLog("Profile picture compiled into local stream.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Synthesis dynamic message loader sequence
  useEffect(() => {
    let timer: any;
    if (isSynthesizing) {
      timer = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % REASSURING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isSynthesizing]);

  // AI-Assisted Strategic Synthesis (Raw News Intake Feed)
  const handleExecuteSynthesis = async () => {
    if (!intakeText.trim()) return;
    setIsSynthesizing(true);
    setSynthesisResult(null);
    setCurrentMessageIndex(0);
    addTerminalLog("Streaming raw concept signal into Gemini synthesizer engine...");

    try {
      const response = await fetch("/api/gemini/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "synthesize",
          payload: {
            textInput: intakeText,
            existingStructure: vaultFiles.map((f) => ({ path: f.path, name: f.name }))
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Synthesis pipeline failed: ${response.statusText}`);
      }

      const result = await response.json();
      setSynthesisResult(result);
      addTerminalLog(`Gemini synthesis output received! Proposed slot: ${result.folder}/${result.filename}`);
    } catch (e: any) {
      console.error(e);
      addTerminalLog(`Synthesis Error: ${e.message || "Endpoint failed"}`);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Commit synthesis output raw markdown directly into the vault database files
  const handleCommitSynthesisToVault = () => {
    if (!synthesisResult) return;
    const { folder, filename, title, markdownContent, associatedPattern, associatedSignal, connectionStrength } = synthesisResult;
    const targetPath = `${folder}/${filename}`;

    // Verify duplication
    if (vaultFiles.some((f) => f.path === targetPath)) {
      if (!confirm(`File ${targetPath} already exists. Do you want to overwrite it?`)) return;
    }

    const newFile: VaultFile = {
      path: targetPath,
      name: filename,
      folder: folder,
      content: markdownContent,
      updatedAt: new Date().toISOString(),
      tags: ["ai-synthesized"]
    };

    // Filter out old file if overwriting, then add
    const updated = [...vaultFiles.filter((f) => f.path !== targetPath), newFile];
    setVaultFiles(updated);
    saveVaultToLocalStorage(updated);
    setActiveFile(newFile);
    setEditingContent(markdownContent);

    // Dynamic pattern connection mapping update
    const patternObj = patterns.find((p) => p.title.toLowerCase().includes(associatedPattern.toLowerCase()) || associatedPattern.toLowerCase().includes(p.title.toLowerCase()));
    const signalObj = signals.find((s) => s.title.toLowerCase().includes(associatedSignal.toLowerCase()) || associatedSignal.toLowerCase().includes(s.title.toLowerCase()));

    if (patternObj && signalObj) {
      // Add dynamic strength linkage inside state 
      const existingConnIdx = connections.findIndex(
        (c) => c.patternId === patternObj.id && c.signalId === signalObj.id
      );

      let newConnections = [...connections];
      if (existingConnIdx > -1) {
        newConnections[existingConnIdx].strength = connectionStrength as any;
        if (!newConnections[existingConnIdx].notes) {
          newConnections[existingConnIdx].notes = `Linked via Strategic Synthesis payload: /${targetPath}`;
        }
      } else {
        newConnections.push({
          patternId: patternObj.id,
          signalId: signalObj.id,
          strength: connectionStrength as any || "Emerging",
          notes: `Established automatically from Synthesis payload: /${targetPath}`
        });
      }
      setConnections(newConnections);
      localStorage.setItem("strategic_vault_connections", JSON.stringify(newConnections));
      
      // Strengthen progress metrics slightly
      setPatterns((prevPatterns) =>
        prevPatterns.map((pat) =>
          pat.id === patternObj.id
            ? { ...pat, strengthVal: Math.min(100, pat.strengthVal + 8) }
            : pat
        )
      );
      addTerminalLog(`Committed synthesis item. Connection reinforced: ${patternObj.title} <-> ${signalObj.title}`);
    }

    setSynthesisResult(null);
    setIntakeText("");
    setActiveTab("workspace");
    setEditorMode("preview");
    addTerminalLog(`Successfully mapped intelligence payload to vault: /${targetPath}`);
  };

  // Submit Sage chat system message
  const handleSendSageQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sageMessage.trim()) return;

    const userMsg = sageMessage;
    setSageMessage("");
    setChatHistory((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsSageResponding(true);
    addTerminalLog("Consulting Strategic Sage chatbot companion...");

    try {
      const response = await fetch("/api/gemini/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          payload: {
            message: userMsg,
            chatHistory: chatHistory.slice(-8), // send last 8 turns
            vaultFiles: vaultFiles
          }
        })
      });

      if (!response.ok) {
        throw new Error("Sage engine query failed.");
      }

      const result = await response.json();
      setChatHistory((prev) => [...prev, { sender: "sage", text: result.text }]);
      addTerminalLog("Sage synthesized advice report.");
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "sage", text: `I encountered an operational interruption: ${err.message}. Please verify process secrets.` }
      ]);
    } finally {
      setIsSageResponding(false);
    }
  };

  // All unique tags in the system
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    vaultFiles.forEach((f) => {
      if (f.tags) {
        f.tags.forEach((tag) => {
          if (tag.trim()) {
            tagsSet.add(tag.trim().toLowerCase());
          }
        });
      }
    });
    return Array.from(tagsSet).sort();
  }, [vaultFiles]);

  // Helper to suggest moving files with no updates for over 30 days to '07_Archive'
  const archiveSuggestions = useMemo(() => {
    // 30 days ago in milliseconds
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return vaultFiles.filter((f) => {
      if (f.folder === "07_Archive") return false;
      const updatedTime = new Date(f.updatedAt).getTime();
      return !isNaN(updatedTime) && updatedTime < thirtyDaysAgo;
    });
  }, [vaultFiles]);

  const handleArchiveFile = (fileToArchive: VaultFile) => {
    let finalName = fileToArchive.name;
    let newPath = `07_Archive/${finalName}`;
    let counter = 1;
    while (vaultFiles.some((f) => f.path === newPath)) {
      const parts = fileToArchive.name.split(".");
      const ext = parts.pop();
      const base = parts.join(".");
      finalName = `${base}_${counter}.${ext}`;
      newPath = `07_Archive/${finalName}`;
      counter++;
    }

    const updated = vaultFiles.map((f) => {
      if (f.path === fileToArchive.path) {
        return {
          ...f,
          path: newPath,
          name: finalName,
          folder: "07_Archive",
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    });

    setVaultFiles(updated);
    saveVaultToLocalStorage(updated);

    if (activeFile && activeFile.path === fileToArchive.path) {
      const updatedActive = updated.find((f) => f.path === newPath);
      if (updatedActive) {
        setActiveFile(updatedActive);
        setEditingContent(updatedActive.content);
      }
    }

    addTerminalLog(`Archived file: ${fileToArchive.path} -> ${newPath}`);
  };

  const handleArchiveAllSuggestions = () => {
    if (archiveSuggestions.length === 0) return;
    let currentVault = [...vaultFiles];
    
    archiveSuggestions.forEach((fileToArchive) => {
      let finalName = fileToArchive.name;
      let newPath = `07_Archive/${finalName}`;
      let counter = 1;
      while (currentVault.some((f) => f.path === newPath)) {
        const parts = fileToArchive.name.split(".");
        const ext = parts.pop();
        const base = parts.join(".");
        finalName = `${base}_${counter}.${ext}`;
        newPath = `07_Archive/${finalName}`;
        counter++;
      }
      
      currentVault = currentVault.map((f) => {
        if (f.path === fileToArchive.path) {
          return {
            ...f,
            path: newPath,
            name: finalName,
            folder: "07_Archive",
            updatedAt: new Date().toISOString()
          };
        }
        return f;
      });
      addTerminalLog(`Archived file: ${fileToArchive.path} -> ${newPath}`);
    });

    setVaultFiles(currentVault);
    saveVaultToLocalStorage(currentVault);

    if (activeFile) {
      const updatedActive = currentVault.find((f) => f.path === activeFile.path || (activeFile.folder !== "07_Archive" && f.name === activeFile.name && f.folder === "07_Archive"));
      if (updatedActive) {
        setActiveFile(updatedActive);
        setEditingContent(updatedActive.content);
      }
    }
  };

  // Filtering files inside Obsidian Sidebar
  const filteredFiles = useMemo(() => {
    let files = vaultFiles;
    if (selectedTag) {
      files = files.filter(
        (f) => f.tags && f.tags.map((t) => t.toLowerCase().trim()).includes(selectedTag)
      );
    }
    if (!searchQuery) return files;
    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vaultFiles, selectedTag, searchQuery]);

  // Grouping filtered files into Folder dictionary lists
  const groupedFiles = useMemo(() => {
    const map: Record<string, VaultFile[]> = {};
    FOLDERS.forEach((f) => (map[f] = []));
    filteredFiles.forEach((file) => {
      if (!map[file.folder]) map[file.folder] = [];
      map[file.folder].push(file);
    });
    return map;
  }, [filteredFiles]);

  const toggleFolderCollapse = (folder: string) => {
    setCollapsedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  // Helper parser to render wiki-links like [[PROJECTS]] with interactive triggers in markdown blocks
  const parseWikiLinks = (text: string) => {
    if (!text) return "";
    const regex = /\[\[([a-zA-Z0-9_\s\-]+)\]\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      // Plain text before match
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }

      const wikiName = match[1];
      // Search matching file
      const linkedFile = vaultFiles.find(
        (f) =>
          f.name.replace(".md", "").toLowerCase() === wikiName.toLowerCase() ||
          f.name.toLowerCase() === `${wikiName.toLowerCase()}.md`
      );

      parts.push({
        isLink: true,
        text: wikiName,
        file: linkedFile
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  // Custom visual wiki parser output blocks
  const renderFormattedMarkdownParts = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, lIdx) => {
      // Direct element lines checks
      if (line.startsWith("# ")) {
        return (
          <h1 key={lIdx} className="text-2xl font-bold font-sans text-zinc-100 mt-5 mb-3 pb-1 border-b border-zinc-800">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={lIdx} className="text-xl font-medium font-sans text-zinc-200 mt-4 mb-2">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={lIdx} className="text-lg font-medium font-sans text-zinc-300 mt-3 mb-2">
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const parsedLineParts = parseWikiLinks(line.substring(2));
        return (
          <li key={lIdx} className="ml-5 list-disc my-1 text-zinc-400">
            {typeof parsedLineParts === "string" ? (
              parsedLineParts
            ) : (
              parsedLineParts.map((part, pIdx) => {
                if (typeof part === "string") return <span key={pIdx}>{part}</span>;
                if (part.isLink) {
                  return (
                    <button
                      key={pIdx}
                      onClick={() => part.file && handleSelectFile(part.file)}
                      disabled={!part.file}
                      className={cn(
                        "inline-flex mx-1 px-1.5 py-0.5 rounded text-xs font-mono border",
                        part.file
                          ? "bg-violet-950/40 border-violet-800 text-violet-300 hover:bg-violet-900/60"
                          : "bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed"
                      )}
                      title={part.file ? `Link to /${part.file.path}` : "Disconnected link state"}
                    >
                      [[{part.text}]]
                    </button>
                  );
                }
                return null;
              })
            )}
          </li>
        );
      }

      // Check for markdown code fence tags block
      if (line.startsWith("```")) {
        return null; // hide code fences in simplified formatter
      }

      // Custom wiki links parse on flat text lines
      const flatParts = parseWikiLinks(line);
      if (typeof flatParts === "string") {
        return <p key={lIdx} className="my-2 leading-relaxed text-zinc-400 text-sm whitespace-pre-wrap">{flatParts}</p>;
      } else {
        return (
          <p key={lIdx} className="my-2 leading-relaxed text-zinc-400 text-sm whitespace-pre-wrap">
            {flatParts.map((part, pIdx) => {
              if (typeof part === "string") return <span key={pIdx}>{part}</span>;
              if (part.isLink) {
                return (
                  <button
                    key={pIdx}
                    onClick={() => part.file && handleSelectFile(part.file)}
                    disabled={!part.file}
                    className={cn(
                      "inline-flex mx-1 px-1.5 py-0.5 rounded text-xs font-mono border",
                      part.file
                        ? "bg-violet-950/40 border-violet-800 text-violet-300 hover:bg-violet-900/60"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed"
                    )}
                    title={part.file ? `Link to /${part.file.path}` : "Disconnected link state"}
                  >
                    [[{part.text}]]
                  </button>
                );
              }
              return null;
            })}
          </p>
        );
      }
    });
  };

  // Generate connected lines coordinates between left pattern nodes and right signal nodes
  const activeLines = useMemo(() => {
    return connections.map((conn) => {
      const pIdx = patterns.findIndex((p) => p.id === conn.patternId);
      const sIdx = signals.findIndex((s) => s.id === conn.signalId);
      
      if (pIdx === -1 || sIdx === -1) return null;

      // Left column coordinates offset: x = 10, y scale based on 7 elements
      const y1 = 40 + pIdx * 90;
      // Right column coordinates offset: x = 90, y scale based on 8 elements
      const y2 = 40 + sIdx * 90;

      // Color weights highlight
      let isHighlighted = false;
      if (hoveredNodeId) {
        isHighlighted = (conn.patternId === hoveredNodeId || conn.signalId === hoveredNodeId);
      } else if (selectedPatternId) {
        isHighlighted = (conn.patternId === selectedPatternId);
      } else if (selectedSignalId) {
        isHighlighted = (conn.signalId === selectedSignalId);
      }

      const isCurrentFilterActive = hoveredNodeId || selectedPatternId || selectedSignalId;

      return {
        id: `${conn.patternId}-${conn.signalId}`,
        y1,
        y2,
        strength: conn.strength,
        isHighlighted,
        isDimmed: isCurrentFilterActive && !isHighlighted
      };
    }).filter(Boolean);
  }, [connections, patterns, signals, selectedPatternId, selectedSignalId, hoveredNodeId]);

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-400 p-6 font-mono text-center">
        <div className="space-y-4 animate-pulse">
          <h1 className="text-xl text-violet-400 font-bold tracking-tight">AI STRATEGIC VAULT SYSTEM INITIALIZING</h1>
          <p className="text-xs text-zinc-500 max-w-md">
            Decrypting intelligence channels and mounting secure data directories...
          </p>
          <div className="w-10 h-10 border-2 border-t-violet-400 border-zinc-800 rounded-full animate-spin mx-auto mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-violet-900 selection:text-white">
      {/* Absolute Header with Realtime clocks & humble, human status indicators */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur px-5 py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-violet-600 to-cyan-500 rounded-lg text-white shadow-lg shadow-violet-950/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm tracking-wider font-semibold uppercase text-zinc-200">
                AI Strategic Intelligence Vault
              </h1>
              <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono px-2 py-0.5 rounded-full">
                ● Live Setup
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5 font-mono">
              Obsidian-style structural mapper & knowledge architect
            </p>
          </div>
        </div>

        {/* Status indicator readouts */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800 text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-violet-400" />
            <span className="font-mono text-[11px] text-zinc-300">{utcTime || "2026-05-23 21:48:00 UTC"}</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800">
            <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="font-mono text-zinc-400 text-[11px]">Gemini: <strong className="text-zinc-200">3.5-flash</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {isRealFirebase && firebaseUser ? (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-violet-950/40 border border-violet-900/60 rounded max-w-[200px]">
                {firebaseUser.photoURL ? (
                  <img src={firebaseUser.photoURL} alt="pfp" className="w-5 h-5 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-[9px] text-white shrink-0">G</div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-mono font-bold text-zinc-200 truncate leading-none">@{profile?.username || "Agent"}</span>
                  <button onClick={handleGoogleSignOut} className="text-[8px] font-mono text-zinc-500 hover:text-red-400 mt-1 text-left leading-none">Disconnect</button>
                </div>
              </div>
            ) : isRealFirebase ? (
              <button
                onClick={handleGoogleSignIn}
                className="px-3 h-8 flex items-center gap-1.5 rounded bg-violet-600 hover:bg-violet-750 text-[10px] font-mono text-white transition font-bold"
                title="Connect Google account to sync profile & feed to cloud"
              >
                <Shield className="h-3 w-3 text-violet-300" />
                <span>Connect Cloud</span>
              </button>
            ) : null}

            <button
              onClick={handleFactoryReset}
              className="px-2 w-8 h-8 flex items-center justify-center rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
              title="Reset Vault to original template blueprints"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleExportVaultJSON}
              className="px-2 w-8 h-8 flex items-center justify-center rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
              title="Download entire Vault folder in JSON package"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Subnavigation Strategy tabs */}
      <nav className="border-b border-zinc-900 bg-zinc-900/20 px-5 flex items-center gap-1">
        <button
          onClick={() => setActiveTab("workspace")}
          className={cn(
            "px-4 py-3 text-xs tracking-wider transition-all duration-150 uppercase border-b-2 font-mono flex items-center gap-2",
            activeTab === "workspace"
              ? "border-violet-500 text-zinc-100 bg-zinc-900/50"
              : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20"
          )}
        >
          <Folder className="h-3.5 w-3.5" />
          Workspace & Vault
        </button>
        <button
          onClick={() => setActiveTab("graph")}
          className={cn(
            "px-4 py-3 text-xs tracking-wider transition-all duration-150 uppercase border-b-2 font-mono flex items-center gap-2",
            activeTab === "graph"
              ? "border-violet-500 text-zinc-100 bg-zinc-900/50"
              : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20"
          )}
        >
          <Network className="h-3.5 w-3.5" />
          Patterns ⇄ Signals Index
        </button>
        <button
          onClick={() => setActiveTab("decompression")}
          className={cn(
            "px-4 py-3 text-xs tracking-wider transition-all duration-150 uppercase border-b-2 font-mono flex items-center gap-2",
            activeTab === "decompression"
              ? "border-violet-500 text-zinc-100 bg-zinc-900/50"
              : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20"
          )}
        >
          <Compass className="h-3.5 w-3.5" />
          Cognitive Breathing Space
        </button>
        <button
          onClick={() => setActiveTab("feed")}
          className={cn(
            "px-4 py-3 text-xs tracking-wider transition-all duration-150 uppercase border-b-2 font-mono flex items-center gap-2",
            activeTab === "feed"
              ? "border-violet-500 text-zinc-100 bg-zinc-900/50"
              : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20"
          )}
        >
          <Radio className="h-3.5 w-3.5" />
          Intelligence Feed
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "px-4 py-3 text-xs tracking-wider transition-all duration-150 uppercase border-b-2 font-mono flex items-center gap-2",
            activeTab === "profile"
              ? "border-violet-500 text-zinc-100 bg-zinc-900/50"
              : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20"
          )}
        >
          <User className="h-3.5 w-3.5" />
          Profile Directory
        </button>
      </nav>

      {/* Main View Grid switcher container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {activeTab === "workspace" && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* COLUMN 1: Dynamic File Explorer Sidebar */}
            <aside className="w-full md:w-72 border-r border-zinc-900 bg-zinc-950 flex flex-col shrink-0 overflow-y-auto">
              <div className="p-4 border-b border-zinc-900 space-y-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search markdown text..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 text-xs text-zinc-300 pl-8 pr-3 py-2 rounded border border-zinc-800 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                {allTags.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold block">
                        Filter by Tag
                      </span>
                      {selectedTag && (
                        <button
                          onClick={() => setSelectedTag(null)}
                          className="text-[9px] font-mono text-violet-400 hover:text-violet-300 transition cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                      {allTags.map((tag) => {
                        const isSelected = selectedTag === tag;
                        const count = vaultFiles.filter(
                          (f) => f.tags && f.tags.map((t) => t.toLowerCase().trim()).includes(tag)
                        ).length;
                        return (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(isSelected ? null : tag)}
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-mono transition flex items-center gap-1 border cursor-pointer",
                              isSelected
                                ? "bg-violet-950/45 border-violet-500/50 text-violet-300"
                                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-350"
                            )}
                          >
                            <span>#{tag}</span>
                            <span className="text-[8px] text-zinc-500 font-sans">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {archiveSuggestions.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-amber-500 font-bold flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Stale Files ({archiveSuggestions.length})
                      </span>
                      <button
                        onClick={handleArchiveAllSuggestions}
                        className="text-[9px] font-mono text-zinc-400 hover:text-amber-400 transition cursor-pointer hover:underline"
                        title="Archive all stale files"
                      >
                        Archive All
                      </button>
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                      {archiveSuggestions.map((file) => {
                        const lastUpdate = new Date(file.updatedAt).getTime();
                        const days = Math.max(0, Math.floor((Date.now() - lastUpdate) / (24 * 60 * 60 * 1000)));
                        return (
                          <div
                            key={file.path}
                            className="flex items-center justify-between gap-1 p-1 rounded bg-zinc-900/60 border border-zinc-800/40 text-[10px] font-mono animate-fade-in"
                          >
                            <span className="text-zinc-400 truncate max-w-[125px] select-none" title={file.path}>
                              {file.name}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[8px] text-zinc-500 font-sans">{days}d stale</span>
                              <button
                                onClick={() => handleArchiveFile(file)}
                                className="px-1.5 py-0.5 bg-amber-950/20 hover:bg-amber-900/40 border border-amber-800/50 text-amber-350 hover:text-amber-200 text-[8px] font-semibold rounded transition cursor-pointer"
                                title="Move to 07_Archive"
                              >
                                Archive
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Obsidian-Style database folder listings */}
              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
                  <span>Vault Folders</span>
                  <span>{vaultFiles.length} files</span>
                </div>

                {FOLDERS.map((folder) => {
                  const filesInFolder = groupedFiles[folder] || [];
                  const isCollapsed = collapsedFolders[folder];
                  return (
                    <div key={folder} className="space-y-0.5">
                      <div
                        onClick={() => toggleFolderCollapse(folder)}
                        className="group flex items-center justify-between px-2 py-1.5 rounded hover:bg-zinc-900/40 text-xs font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2">
                          {isCollapsed ? (
                            <ChevronRight className="h-3 w-3 text-zinc-600" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-zinc-600" />
                          )}
                          <Folder className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                          <span className={cn(filesInFolder.length > 0 && "text-zinc-300 font-medium")}>
                            {folder}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-150">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateFile(folder);
                            }}
                            className="p-1 hover:text-cyan-400 hover:bg-zinc-800 rounded transition"
                            title="Add file inside folder"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Folder nesting content output */}
                      {!isCollapsed && (
                        <div className="pl-6 space-y-0.5 border-l border-zinc-900 ml-3 py-0.5">
                          {filesInFolder.length === 0 ? (
                            <p className="text-[10px] text-zinc-600 p-2 font-mono italic">No items</p>
                          ) : (
                            filesInFolder.map((file) => {
                              const isActive = activeFile?.path === file.path;
                              const isJson = file.name.endsWith(".json");
                              return (
                                <div
                                  key={file.path}
                                  onClick={() => handleSelectFile(file)}
                                  className={cn(
                                    "group flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition font-mono",
                                    isActive
                                      ? "bg-violet-950/30 text-violet-300 border-l-2 border-violet-500 pl-1.5"
                                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                                  )}
                                >
                                  <div className="flex items-center gap-2 truncate pr-1">
                                    {isJson ? (
                                      <FileCode className="h-3 w-3 text-cyan-500 shrink-0" />
                                    ) : (
                                      <FileText className="h-3 w-3 text-zinc-500 shrink-0" />
                                    )}
                                    <span className="truncate">{file.name}</span>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteFile(file.path);
                                    }}
                                    className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-red-400 transition"
                                    title="Delete file"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Terminal Logs section inside left sidebar */}
              <div className="mt-auto border-t border-zinc-900 bg-zinc-950 p-4">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-2 font-semibold">
                  <Activity className="h-3.5 w-3.5 text-violet-400" />
                  <span>Terminal Activity Stream</span>
                </div>
                <div className="bg-zinc-900 p-2 rounded border border-zinc-800 text-[10px] font-mono h-28 overflow-y-auto space-y-1 scrollbar-thin">
                  {terminalLogs.length === 0 ? (
                    <p className="text-zinc-600">Awaiting system status updates...</p>
                  ) : (
                    terminalLogs.map((log, i) => (
                      <p key={i} className="text-zinc-400 leading-normal truncate">{log}</p>
                    ))
                  )}
                </div>
              </div>
            </aside>

            {/* COLUMN 2: Obsidian Active Markdown Document Editor */}
            <main className="flex-1 flex flex-col bg-zinc-900/20 overflow-y-auto min-w-0">
              {activeFile ? (
                <div className="flex-1 flex flex-col min-w-0">
                  {/* File Metadata Toolbar bar */}
                  <div className="px-5 py-3 border-b border-zinc-900 bg-zinc-950/40 flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-zinc-500 shrink-0" />
                      <div className="truncate text-xs font-mono">
                        <span className="text-zinc-500">{activeFile.folder} / </span>
                        <strong className="text-zinc-200">{activeFile.name}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <div className="bg-zinc-900 rounded p-1 flex border border-zinc-800 text-[10px]">
                        <button
                          onClick={() => setEditorMode("edit")}
                          className={cn(
                            "px-3.5 py-1 rounded transition uppercase flex items-center gap-1 font-semibold font-mono",
                            editorMode === "edit" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          <Edit3 className="h-3 w-3" />
                          Edit Code
                        </button>
                        <button
                          onClick={() => setEditorMode("preview")}
                          className={cn(
                            "px-3.5 py-1 rounded transition uppercase flex items-center gap-1 font-semibold font-mono",
                            editorMode === "preview" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </button>
                      </div>

                      {editorMode === "edit" && (
                        <button
                          onClick={handleSaveCurrentContent}
                          className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 transition rounded text-[11px] font-mono text-white font-semibold shadow shadow-violet-950/35"
                        >
                          Save State
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tags Management Sub-Bar */}
                  <div className="px-5 py-2 border-b border-zinc-900 bg-zinc-950/20 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-zinc-500 mr-1.5 uppercase flex items-center gap-1 font-semibold shrink-0">
                      <Tag className="h-3 w-3 text-zinc-500 shrink-0" />
                      <span>Tags</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(!activeFile.tags || activeFile.tags.length === 0) ? (
                        <span className="text-[10px] font-mono text-zinc-600 italic">No tags</span>
                      ) : (
                        activeFile.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 font-mono border border-zinc-800"
                          >
                            <span>#{tag}</span>
                            <button
                              onClick={() => {
                                const newTags = activeFile.tags?.filter((t) => t !== tag) || [];
                                const updated = vaultFiles.map((f) =>
                                  f.path === activeFile.path ? { ...f, tags: newTags } : f
                                );
                                setVaultFiles(updated);
                                saveVaultToLocalStorage(updated);
                                setActiveFile({ ...activeFile, tags: newTags });
                                addTerminalLog(`Removed tag #${tag} from ${activeFile.name}`);
                              }}
                              className="text-[9px] text-zinc-500 hover:text-red-400 font-bold ml-0.5 transition shrink-0 cursor-pointer"
                              title="Delete tag"
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      )}

                      {/* Add Tag interactive prompt */}
                      <button
                        onClick={() => {
                          const tagPrompt = prompt("Enter a tag for this file (letters, numbers, underscores only):");
                          if (tagPrompt) {
                            const cleaned = tagPrompt.trim().toLowerCase().replace(/[^a-zA-Z0-9_\-]/g, "");
                            if (cleaned) {
                              const currentTags = activeFile.tags || [];
                              if (currentTags.includes(cleaned)) {
                                alert("Tag already exists.");
                                return;
                              }
                              const newTags = [...currentTags, cleaned];
                              const updated = vaultFiles.map((f) =>
                                f.path === activeFile.path ? { ...f, tags: newTags } : f
                              );
                              setVaultFiles(updated);
                              saveVaultToLocalStorage(updated);
                              setActiveFile({ ...activeFile, tags: newTags });
                              addTerminalLog(`Added tag #${cleaned} to ${activeFile.name}`);
                            }
                          }
                        }}
                        className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 hover:bg-zinc-800 text-violet-400 border border-zinc-800 hover:border-zinc-700 font-mono transition inline-flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        <span>Add Tag</span>
                      </button>
                    </div>
                  </div>

                  {/* Editing Panel interface */}
                  <div className="flex-1 p-5 overflow-auto">
                    {editorMode === "edit" ? (
                      <div className="h-full flex flex-col gap-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="flex-1 w-full bg-zinc-950 text-xs font-mono text-zinc-300 p-4 rounded border border-zinc-800 focus:outline-none focus:border-violet-500 resize-none h-[calc(100vh-320px)] leading-relaxed"
                          placeholder="Write markdown here..."
                        />
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                          <span>Auto-save activated to cache</span>
                          <span>{editingContent.length} characters</span>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-2xl mx-auto bg-zinc-950/40 p-8 rounded-lg border border-zinc-900 shadow-xl overflow-hidden min-h-[400px]">
                        <div className="markdown-body space-y-4">
                          {renderFormattedMarkdownParts(editingContent)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                  <Layers className="h-12 w-12 text-zinc-700 mb-3" />
                  <p className="text-sm font-mono">No active document selected.</p>
                  <p className="text-xs text-zinc-600 mt-1">Select a note from the file sidebar to view or modify it.</p>
                </div>
              )}
            </main>

            {/* COLUMN 3: Realtime AI Strategic Synthesizer Feed */}
            <aside className="w-full md:w-80 border-l border-zinc-900 bg-zinc-950 flex flex-col shrink-0 overflow-y-auto">
              <div className="p-4 border-b border-zinc-900 bg-zinc-950/50">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  <h2 className="text-xs tracking-wider font-semibold uppercase text-zinc-200">
                    AI Market Stream Intake
                  </h2>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                  Paste market events, tech breakthroughs, or raw observations. Gemini will analyze, write directories, and draft files.
                </p>
              </div>

              {/* Synthesizer Form panel inputs */}
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Raw Signal Raw Text Feed</label>
                  <textarea
                    value={intakeText}
                    onChange={(e) => setIntakeText(e.target.value)}
                    placeholder="E.g., Nvidia announced new hyper-scale Tensor core platforms today causing general GPU budget re-allocation at Microsoft..."
                    className="w-full h-36 bg-zinc-900 text-xs font-mono text-zinc-300 p-2.5 rounded border border-zinc-800 focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleExecuteSynthesis}
                  disabled={isSynthesizing || !intakeText.trim()}
                  className="w-full py-2 bg-gradient-to-r from-violet-600 to-cyan-600 disabled:opacity-50 hover:opacity-90 transition rounded text-xs font-mono font-semibold text-white flex items-center justify-center gap-1.5 shadow shadow-violet-950/50"
                >
                  <Cpu className="h-3.5 w-3.5" />
                  Synthesize & Map to Vault
                </button>

                {/* Synthesis Reassuring loading animation UI */}
                {isSynthesizing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-zinc-900 rounded border border-zinc-800 space-y-2 text-center"
                  >
                    <div className="flex justify-center">
                      <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin" />
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={currentMessageIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-[10px] text-zinc-400 font-mono leading-relaxed h-8"
                      >
                        {REASSURING_MESSAGES[currentMessageIndex]}
                      </motion.p>
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Synthesis output proposal card */}
                {synthesisResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900 text-zinc-300 rounded border border-zinc-800 p-4 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between text-[9px] uppercase font-mono tracking-wider border-b border-zinc-800 pb-1.5">
                      <span className="text-cyan-400">Proposed Strategy Document</span>
                      <span className="text-zinc-500">Slot Recommendation</span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-mono text-zinc-500">Destination Folder Filename</div>
                      <div className="text-xs text-zinc-200 font-mono font-semibold bg-zinc-950 px-2 py-1 rounded border border-zinc-800 truncate">
                        /{synthesisResult.folder}/{synthesisResult.filename}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <div className="text-[9px] uppercase font-mono text-zinc-500">Link Pattern</div>
                        <div className="text-[10px] text-violet-300 truncate font-semibold font-mono bg-violet-950/20 px-2 py-0.5 rounded border border-violet-800/40">
                          {synthesisResult.associatedPattern}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[9px] uppercase font-mono text-zinc-500">Link Signal</div>
                        <div className="text-[10px] text-cyan-300 truncate font-semibold font-mono bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-800/40">
                          {synthesisResult.associatedSignal}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-mono text-zinc-500">Intel Summary</div>
                      <p className="text-xs text-zinc-400 font-mono leading-relaxed bg-zinc-950 p-2 rounded border border-zinc-800">
                        {synthesisResult.strategicSummary}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSynthesisResult(null)}
                        className="flex-1 py-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 transition rounded text-[10px] text-zinc-400 font-mono font-semibold"
                      >
                        Discard
                      </button>
                      <button
                        onClick={handleCommitSynthesisToVault}
                        className="flex-1 py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono rounded text-[10px] font-semibold flex items-center justify-center gap-1"
                      >
                        Commit to Vault
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Dedicated Strategic Sage assistant chat block */}
                <div className="border-t border-zinc-900 pt-4 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-xs tracking-wider font-semibold uppercase text-zinc-200">
                      Query AI Sage Companion
                    </h2>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 rounded p-2 text-[10px] font-mono h-40 overflow-y-auto space-y-2 scrollbar-thin">
                    {chatHistory.map((h, i) => (
                      <div key={i} className={cn("space-y-0.5", h.sender === "user" ? "text-right" : "text-left")}>
                        <div className="text-[8px] uppercase tracking-wider text-zinc-500 font-semibold font-sans">
                          {h.sender === "user" ? "Researcher input" : "Strategic Sage advice"}
                        </div>
                        <p className={cn(
                          "p-2 rounded inline-block text-left leading-normal max-w-[90%] whitespace-pre-wrap",
                          h.sender === "user" ? "bg-violet-950/40 border border-violet-800 text-zinc-300" : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                        )}>
                          {h.text}
                        </p>
                      </div>
                    ))}
                    {isSageResponding && (
                      <div className="text-left">
                        <span className="inline-flex gap-1 items-center bg-zinc-900 px-2 py-1 rounded text-zinc-500 animate-pulse">
                          Sage thinking...
                        </span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendSageQuery} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Ask Sage advice or thesis check..."
                      value={sageMessage}
                      onChange={(e) => setSageMessage(e.target.value)}
                      className="flex-1 bg-zinc-900 text-xs font-mono text-zinc-300 px-2 py-1.5 rounded border border-zinc-800 focus:outline-none focus:border-violet-500"
                    />
                    <button
                      type="submit"
                      disabled={isSageResponding || !sageMessage.trim()}
                      className="px-3 bg-zinc-800 hover:bg-zinc-700 transition rounded border border-zinc-800 text-zinc-400 disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* TAB 2: Interactive Bipartite Patterns ↔ Signals Mapping Canvas */}
        {activeTab === "graph" && (
          <div className="flex-1 overflow-auto flex flex-col md:flex-row bg-zinc-950/40 p-6 gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-200">
                    Patterns ↔ Signals Living Map Matrix
                  </h2>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    Hover nodes to highlight causal lines. Strong connections mean persistent reinforcement across multiple areas.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-6 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"></span> Strong</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-6 bg-zinc-700 border-t border-dashed border-zinc-500"></span> Emerging</span>
                </div>
              </div>

              {/* Bipartite Graph Container Layout */}
              <div 
                ref={containerRef}
                className="flex-1 min-h-[500px] relative mt-4 grid grid-cols-1 md:grid-cols-2 gap-20 p-2 overflow-visible select-none"
              >
                {/* SVG Visual lines underlay overlay */}
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none z-0"
                  style={{ minHeight: "500px" }}
                >
                  <defs>
                    <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="dim-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#27272a" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#27272a" stopOpacity="0.15" />
                    </linearGradient>
                  </defs>

                  {activeLines.map((line) => {
                    if (!line) return null;
                    const pathD = `M 20 ${line.y1} C ${svgDimensions.width / 2} ${line.y1}, ${svgDimensions.width / 2} ${line.y2}, ${svgDimensions.width - 20} ${line.y2}`;

                    return (
                      <g key={line.id}>
                        {/* Highlighted glows underneath */}
                        {line.isHighlighted && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="url(#glow-grad)"
                            strokeWidth="5"
                            className="opacity-45 blur-sm"
                          />
                        )}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={line.isDimmed ? "url(#dim-grad)" : line.isHighlighted ? "url(#glow-grad)" : "#2e2e33"}
                          strokeWidth={line.isHighlighted ? "2.5" : "1.25"}
                          strokeDasharray={line.strength === "Emerging" ? "4,4" : undefined}
                          className="transition-all duration-300"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* LEFT COLUMN: 7 Core Patterns */}
                <div ref={leftColRef} className="flex flex-col justify-between h-full space-y-6 z-10">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-semibold mb-2 bg-zinc-950 px-2 py-1 inline-block border border-zinc-900 rounded select-none">
                    Core Intelligence Patterns
                  </div>

                  {patterns.map((pat, pIdx) => {
                    const isSelected = selectedPatternId === pat.id;
                    const isHighlighted = hoveredNodeId === pat.id || (selectedSignalId && connections.some(c => c.patternId === pat.id && c.signalId === selectedSignalId));
                    
                    if (editingPatternId === pat.id) {
                      return (
                        <div key={pat.id} className="p-3 rounded-lg border bg-zinc-950 border-violet-700/60 transition duration-200" style={{ height: "auto", minHeight: "70px", zIndex: 50 }}>
                          <div className="flex flex-col gap-2">
                            <input 
                              value={patternEditForm.title}
                              onChange={e => setPatternEditForm({...patternEditForm, title: e.target.value})}
                              className="w-full bg-zinc-900 text-xs text-zinc-200 px-2 py-1.5 rounded border border-zinc-800 focus:border-violet-500 focus:outline-none"
                              placeholder="Title"
                            />
                            <textarea
                              value={patternEditForm.observation}
                              onChange={e => setPatternEditForm({...patternEditForm, observation: e.target.value})}
                              className="w-full bg-zinc-900 text-[10px] text-zinc-300 px-2 py-1.5 rounded border border-zinc-800 focus:border-violet-500 focus:outline-none resize-none font-mono"
                              rows={2}
                              placeholder="Observation"
                            />
                            <textarea
                              value={patternEditForm.opportunity}
                              onChange={e => setPatternEditForm({...patternEditForm, opportunity: e.target.value})}
                              className="w-full bg-zinc-900 text-[10px] text-zinc-300 px-2 py-1.5 rounded border border-zinc-800 focus:border-violet-500 focus:outline-none resize-none font-mono"
                              rows={2}
                              placeholder="Strategic Opportunity"
                            />
                            <div className="flex justify-end gap-2 mt-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPatternId(null);
                                }}
                                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded text-[10px] transition cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = patterns.map(p => p.id === pat.id ? {...p, ...patternEditForm} : p);
                                  setPatterns(updated);
                                  localStorage.setItem("strategic_vault_patterns", JSON.stringify(updated));
                                  setEditingPatternId(null);
                                }}
                                className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded text-[10px] transition cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={pat.id}
                        onClick={() => {
                          setSelectedPatternId(isSelected ? null : pat.id);
                          setSelectedSignalId(null);
                        }}
                        onMouseEnter={() => setHoveredNodeId(pat.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className={cn(
                          "p-4 rounded-lg border text-left cursor-pointer transition duration-200 select-none group relative",
                          isSelected
                            ? "bg-violet-950/40 border-violet-500 shadow-lg shadow-violet-950/30"
                            : isHighlighted
                            ? "bg-zinc-900 border-violet-700/60"
                            : "bg-zinc-950 border-zinc-900 hover:bg-zinc-900/40"
                        )}
                        style={{ height: "70px" }}
                      >
                        <div className="flex items-center justify-between gap-2 overflow-hidden">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[10px] font-mono text-violet-400 bg-violet-950 border border-violet-900 rounded-full h-5 w-5 flex items-center justify-center font-bold shrink-0">
                              {pat.number}
                            </span>
                            <h3 className="text-xs font-semibold text-zinc-100 truncate">{pat.title}</h3>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPatternId(pat.id);
                              setPatternEditForm({
                                title: pat.title, 
                                observation: pat.observation, 
                                opportunity: pat.opportunity || ""
                              });
                            }}
                            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 p-1 rounded opacity-0 group-hover:opacity-100 transition shrink-0 cursor-pointer"
                            title="Edit Pattern"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1 lines-clamp-1 truncate font-mono">
                          {pat.observation}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* RIGHT COLUMN: 8 Key Signals */}
                <div ref={rightColRef} className="flex flex-col justify-between h-full space-y-5 z-10">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-semibold mb-2 bg-zinc-950 px-2 py-1 inline-block border border-zinc-900 rounded self-start select-none">
                    Key Market Signals
                  </div>

                  {signals.map((sig, sIdx) => {
                    const isSelected = selectedSignalId === sig.id;
                    const isHighlighted = hoveredNodeId === sig.id || (selectedPatternId && connections.some(c => c.patternId === selectedPatternId && c.signalId === sig.id));
                    return (
                      <div
                        key={sig.id}
                        onClick={() => {
                          setSelectedSignalId(isSelected ? null : sig.id);
                          setSelectedPatternId(null);
                        }}
                        onMouseEnter={() => setHoveredNodeId(sig.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className={cn(
                          "p-4 rounded-lg border text-left cursor-pointer transition duration-200 select-none",
                          isSelected
                            ? "bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-950/30"
                            : isHighlighted
                            ? "bg-zinc-900 border-cyan-700/60"
                            : "bg-zinc-950 border-zinc-900 hover:bg-zinc-900/40"
                        )}
                        style={{ height: "70px" }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-900 rounded-full h-5 w-5 flex items-center justify-center font-bold">
                              {sig.number}
                            </span>
                            <h3 className="text-xs font-semibold text-zinc-100 truncate">{sig.title}</h3>
                          </div>
                          <span className={cn(
                            "text-[8px] px-1.5 py-0.5 rounded uppercase font-mono font-bold tracking-wider shrink-0",
                            sig.impact === "High" ? "bg-emerald-950 border border-emerald-800 text-emerald-400" :
                            sig.impact === "Medium" ? "bg-amber-950 border border-amber-800 text-amber-400" :
                            "bg-blue-950 border border-blue-980 text-blue-400"
                          )}>
                            {sig.impact}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1 lines-clamp-1 truncate font-mono">
                          {sig.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Side summary panel detailing active node highlights */}
            <aside className="w-full md:w-96 flex flex-col gap-5 shrink-0 select-none">
              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-lg shadow-lg space-y-4">
                <div className="flex items-center gap-2 text-xs tracking-wider uppercase font-semibold text-zinc-200 border-b border-zinc-900 pb-3">
                  <Activity className="h-4 w-4 text-violet-400" />
                  <span>Node Inspector View</span>
                </div>

                {/* Inspecting Pattern details */}
                {selectedPatternId ? (
                  (() => {
                    const pat = patterns.find((p) => p.id === selectedPatternId);
                    if (!pat) return null;
                    return (
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1">
                          <div className="text-[9px] uppercase font-mono text-violet-400 font-bold">CORE PATTERN {pat.number}</div>
                          <h3 className="text-sm font-semibold text-zinc-100 font-sans">{pat.title}</h3>
                        </div>

                        <div className="bg-zinc-900 p-3 rounded border border-zinc-800 space-y-3 font-mono text-[11px] leading-relaxed">
                          <div className="space-y-1">
                            <span className="text-zinc-500 uppercase text-[9px] block">Observation:</span>
                            <p className="text-zinc-300">{pat.observation}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-zinc-500 uppercase text-[9px] block">Causal Implication:</span>
                            <p className="text-zinc-300">{pat.implication}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-zinc-500 uppercase text-[9px] block">Opportunity Strategy:</span>
                            <p className="text-violet-300">{pat.opportunity}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-[10px] uppercase font-mono text-zinc-500">Reinforced Connection Support</div>
                          <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-300" style={{ width: `${pat.strengthVal}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                            <span>Pattern Strength Matrix</span>
                            <span className="text-violet-400 font-semibold">{pat.strength} Connections</span>
                          </div>
                        </div>

                        {/* Connection Annotations and Notes */}
                        <div className="space-y-3 pt-3 border-t border-zinc-900">
                          <div className="text-[10px] uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                            <Network className="h-3.5 w-3.5 text-violet-400" />
                            <span>Connection Annotations</span>
                          </div>

                          {(() => {
                            const activeConns = connections.filter(c => c.patternId === pat.id);
                            if (activeConns.length === 0) {
                              return (
                                <p className="text-[10px] text-zinc-650 font-mono leading-normal italic bg-zinc-900/40 p-2.5 rounded border border-zinc-900">
                                  No active signal connections. Establish a path below.
                                </p>
                              );
                            }

                            return (
                              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                                {activeConns.map((c) => {
                                  const sig = signals.find(s => s.id === c.signalId);
                                  if (!sig) return null;
                                  return (
                                    <div key={c.signalId} className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 space-y-2">
                                      <div className="flex items-start justify-between gap-1">
                                        <div className="truncate">
                                          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-900 px-1 py-0.2 rounded mr-1">
                                            S{sig.number}
                                          </span>
                                          <span className="text-[10px] font-medium text-zinc-200 font-sans">{sig.title}</span>
                                        </div>

                                        <button
                                          id={`btn-remove-conn-${pat.id}-${sig.id}`}
                                          onClick={() => {
                                            const newConns = connections.filter(conn => !(conn.patternId === pat.id && conn.signalId === sig.id));
                                            setConnections(newConns);
                                            localStorage.setItem("strategic_vault_connections", JSON.stringify(newConns));
                                            addTerminalLog(`Removed connection: Pattern ${pat.number} <-> Signal ${sig.number}`);
                                          }}
                                          className="text-[10px] font-mono text-red-400 hover:text-red-300 select-none cursor-pointer"
                                          title="Remove this connection"
                                        >
                                          ×
                                        </button>
                                      </div>

                                      <div className="flex items-center justify-between text-[9px] font-mono">
                                        <span className="text-zinc-500">Strength:</span>
                                        <div className="flex gap-1.5 animate-normal">
                                          {(["Strong", "Emerging", "Weak"] as const).map((str) => (
                                            <button
                                              key={str}
                                              id={`btn-str-${pat.id}-${sig.id}-${str}`}
                                              onClick={() => {
                                                const newConns = connections.map(conn => 
                                                  (conn.patternId === pat.id && conn.signalId === sig.id)
                                                    ? { ...conn, strength: str }
                                                    : conn
                                                );
                                                setConnections(newConns);
                                                localStorage.setItem("strategic_vault_connections", JSON.stringify(newConns));
                                              }}
                                              className={cn(
                                                "px-1 rounded text-[8px] font-bold select-none cursor-pointer",
                                                c.strength === str
                                                  ? "bg-violet-900 text-violet-105 font-extrabold"
                                                  : "bg-zinc-950 text-zinc-550 hover:text-zinc-300"
                                              )}
                                            >
                                              {str}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-0.5">
                                        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                                          <span className="uppercase">Connection Annotation Note</span>
                                          <span className={cn(
                                            "font-semibold",
                                            (c.notes || "").length > 280 ? "text-red-400" : "text-zinc-500"
                                          )}>{(c.notes || "").length}/280</span>
                                        </div>
                                        <AutoGrowingTextarea
                                          id={`textarea-notes-${pat.id}-${sig.id}`}
                                          value={c.notes || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            const newConns = connections.map(conn => 
                                              (conn.patternId === pat.id && conn.signalId === sig.id)
                                                ? { ...conn, notes: val }
                                                : conn
                                            );
                                            setConnections(newConns);
                                            localStorage.setItem("strategic_vault_connections", JSON.stringify(newConns));
                                          }}
                                          placeholder="Why are they connected? Write strategic notes..."
                                          className="w-full text-[10px] font-sans p-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-300 focus:outline-none focus:border-violet-500 placeholder-zinc-700 resize-none leading-relaxed"
                                          rows={2}
                                        />
                                      </div>

                                      {/* Future Impact Scenario Panel */}
                                      <div className="pt-2 border-t border-zinc-800/60 mt-2">
                                        {connectionImpacts[`${pat.id}_${sig.id}`] ? (
                                          <div className="bg-zinc-950 border border-zinc-900/80 p-2.5 rounded text-[10px] space-y-1.5 animate-fade-in shadow-inner">
                                            <div className="flex justify-between items-center text-[9px] font-mono">
                                              <span className="text-violet-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Sparkles className="h-2.5 w-2.5" />
                                                <span>AI Futures Projection</span>
                                              </span>
                                              <span className="bg-violet-950 border border-violet-800 text-violet-300 font-bold px-1.5 py-0.2 rounded text-[8px]">
                                                Prob: {connectionImpacts[`${pat.id}_${sig.id}`].probability}
                                              </span>
                                            </div>
                                            <div className="font-semibold text-zinc-200">
                                              {connectionImpacts[`${pat.id}_${sig.id}`].title}
                                            </div>
                                            <div className="text-zinc-400 font-sans leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto pr-1">
                                              {connectionImpacts[`${pat.id}_${sig.id}`].text}
                                            </div>
                                            <div className="text-[9.5px] border-t border-zinc-900 pt-1.5 text-zinc-400 font-sans leading-normal">
                                              <strong className="text-violet-400 font-mono text-[9px] uppercase tracking-wide block mb-0.5 font-bold">Strategic Imperative:</strong>
                                              {connectionImpacts[`${pat.id}_${sig.id}`].takeaway}
                                            </div>
                                            <div className="flex justify-end pt-1">
                                              <button
                                                onClick={() => handleGenerateImpactScenario(pat.id, sig.id)}
                                                disabled={generatingImpactKey === `${pat.id}_${sig.id}`}
                                                className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 hover:underline cursor-pointer flex items-center gap-1"
                                              >
                                                {generatingImpactKey === `${pat.id}_${sig.id}` ? "Re-projecting..." : "Re-project scenario"}
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => handleGenerateImpactScenario(pat.id, sig.id)}
                                            disabled={generatingImpactKey === `${pat.id}_${sig.id}`}
                                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-zinc-950 hover:bg-violet-950/20 border border-zinc-900 hover:border-violet-900/60 transition text-[9.5px] tracking-wide font-mono text-zinc-450 hover:text-violet-300 rounded cursor-pointer mt-1 font-semibold"
                                          >
                                            <Sparkles className="h-3 w-3 text-violet-400 animate-pulse" />
                                            <span>
                                              {generatingImpactKey === `${pat.id}_${sig.id}` ? "Re-evaluating trends..." : "Project Future Impact Scenario"}
                                            </span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {/* Quick add connection builder */}
                          {(() => {
                            const unconnected = signals.filter(s => !connections.some(c => c.patternId === pat.id && c.signalId === s.id));
                            if (unconnected.length === 0) return null;
                            return (
                              <div className="pt-1.5 space-y-1.5">
                                <span className="text-[9px] uppercase font-mono text-zinc-500 block">Establish New Signal Link</span>
                                <select
                                  id={`select-add-sig-${pat.id}`}
                                  value=""
                                  onChange={(e) => {
                                    const sigId = e.target.value;
                                    if (!sigId) return;
                                    const newConns = [...connections, {
                                      patternId: pat.id,
                                      signalId: sigId,
                                      strength: "Emerging" as const,
                                      notes: ""
                                    }];
                                    setConnections(newConns);
                                    localStorage.setItem("strategic_vault_connections", JSON.stringify(newConns));
                                    const addedSig = signals.find(s => s.id === sigId);
                                    addTerminalLog(`Linked Pattern ${pat.number} <-> Signal ${addedSig?.number || sigId} (Emerging)`);
                                  }}
                                  className="w-full text-[10px] font-mono bg-zinc-950 border border-zinc-900 rounded px-2 py-1.5 text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                                >
                                  <option value="">+ Connect map node...</option>
                                  {unconnected.map(s => (
                                    <option key={s.id} value={s.id}>
                                      Signal {s.number}: {s.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })()
                ) : selectedSignalId ? (
                  (() => {
                    const sig = signals.find((s) => s.id === selectedSignalId);
                    if (!sig) return null;
                    return (
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1">
                          <div className="text-[9px] uppercase font-mono text-cyan-400 font-bold">KEY SIGNAL {sig.number}</div>
                          <h2 className="text-sm font-semibold text-zinc-100 font-sans">{sig.title}</h2>
                        </div>

                        <div className="bg-zinc-900 p-3 rounded border border-zinc-800 space-y-3 font-mono text-[11px] leading-relaxed">
                          <div className="space-y-1">
                            <span className="text-zinc-500 uppercase text-[9px] block">Operational Stage:</span>
                            <p className="text-cyan-300 font-semibold">{sig.stage}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-zinc-500 uppercase text-[9px] block">Status description:</span>
                            <p className="text-zinc-300">{sig.description}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-zinc-500 uppercase text-[9px] block">Macro Economic Impact Level:</span>
                            <p className={cn(
                              "font-semibold",
                              sig.impact === "High" ? "text-emerald-400" : "text-amber-400"
                            )}>{sig.impact} Strategic Impact Point</p>
                          </div>
                        </div>

                        {/* Connection Annotations and Notes */}
                        <div className="space-y-3 pt-3 border-t border-zinc-900">
                          <div className="text-[10px] uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                            <Network className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Connection Annotations</span>
                          </div>

                          {(() => {
                            const activeConns = connections.filter(c => c.signalId === sig.id);
                            if (activeConns.length === 0) {
                              return (
                                <p className="text-[10px] text-zinc-650 font-mono leading-normal italic bg-zinc-900/40 p-2.5 rounded border border-zinc-900">
                                  No active pattern connections. Establish a path below.
                                </p>
                              );
                            }

                            return (
                              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                                {activeConns.map((c) => {
                                  const pat = patterns.find(p => p.id === c.patternId);
                                  if (!pat) return null;
                                  return (
                                    <div key={c.patternId} className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 space-y-2">
                                      <div className="flex items-start justify-between gap-1">
                                        <div className="truncate">
                                          <span className="text-[9px] font-mono text-violet-400 bg-violet-950 border border-violet-900 px-1 py-0.2 rounded mr-1">
                                            P{pat.number}
                                          </span>
                                          <span className="text-[10px] font-medium text-zinc-200 font-sans">{pat.title}</span>
                                        </div>

                                        <button
                                          id={`btn-remove-conn-sig-${sig.id}-${pat.id}`}
                                          onClick={() => {
                                            const newConns = connections.filter(conn => !(conn.signalId === sig.id && conn.patternId === pat.id));
                                            setConnections(newConns);
                                            localStorage.setItem("strategic_vault_connections", JSON.stringify(newConns));
                                            addTerminalLog(`Removed connection: Pattern ${pat.number} <-> Signal ${sig.number}`);
                                          }}
                                          className="text-[10px] font-mono text-red-400 hover:text-red-300 select-none cursor-pointer"
                                          title="Remove this connection"
                                        >
                                          ×
                                        </button>
                                      </div>

                                      <div className="flex items-center justify-between text-[9px] font-mono">
                                        <span className="text-zinc-500">Strength:</span>
                                        <div className="flex gap-1.5 animate-normal">
                                          {(["Strong", "Emerging", "Weak"] as const).map((str) => (
                                            <button
                                              key={str}
                                              id={`btn-str-sig-${sig.id}-${pat.id}-${str}`}
                                              onClick={() => {
                                                const newConns = connections.map(conn => 
                                                  (conn.signalId === sig.id && conn.patternId === pat.id)
                                                    ? { ...conn, strength: str }
                                                    : conn
                                                );
                                                setConnections(newConns);
                                                localStorage.setItem("strategic_vault_connections", JSON.stringify(newConns));
                                              }}
                                              className={cn(
                                                "px-1 rounded text-[8px] font-bold select-none cursor-pointer",
                                                c.strength === str
                                                  ? "bg-cyan-900 text-cyan-105 font-extrabold"
                                                  : "bg-zinc-950 text-zinc-550 hover:text-cyan-300"
                                              )}
                                            >
                                              {str}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-0.5">
                                        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                                          <span className="uppercase">Connection Annotation Note</span>
                                          <span className={cn(
                                            "font-semibold",
                                            (c.notes || "").length > 280 ? "text-red-400" : "text-zinc-500"
                                          )}>{(c.notes || "").length}/280</span>
                                        </div>
                                        <AutoGrowingTextarea
                                          id={`textarea-notes-sig-${sig.id}-${pat.id}`}
                                          value={c.notes || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            const newConns = connections.map(conn => 
                                              (conn.signalId === sig.id && conn.patternId === pat.id)
                                                ? { ...conn, notes: val }
                                                : conn
                                            );
                                            setConnections(newConns);
                                            localStorage.setItem("strategic_vault_connections", JSON.stringify(newConns));
                                          }}
                                          placeholder="Why are they connected? Write strategic notes..."
                                          className="w-full text-[10px] font-sans p-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-300 focus:outline-none focus:border-cyan-500 placeholder-zinc-700 resize-none leading-relaxed"
                                          rows={2}
                                        />
                                      </div>

                                      {/* Future Impact Scenario Panel */}
                                      <div className="pt-2 border-t border-zinc-800/60 mt-2">
                                        {connectionImpacts[`${pat.id}_${sig.id}`] ? (
                                          <div className="bg-zinc-950 border border-zinc-900/80 p-2.5 rounded text-[10px] space-y-1.5 animate-fade-in shadow-inner">
                                            <div className="flex justify-between items-center text-[9px] font-mono">
                                              <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Sparkles className="h-2.5 w-2.5" />
                                                <span>AI Futures Projection</span>
                                              </span>
                                              <span className="bg-cyan-950 border border-cyan-900 text-cyan-300 font-bold px-1.5 py-0.2 rounded text-[8px]">
                                                Prob: {connectionImpacts[`${pat.id}_${sig.id}`].probability}
                                              </span>
                                            </div>
                                            <div className="font-semibold text-zinc-200">
                                              {connectionImpacts[`${pat.id}_${sig.id}`].title}
                                            </div>
                                            <div className="text-zinc-400 font-sans leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto pr-1">
                                              {connectionImpacts[`${pat.id}_${sig.id}`].text}
                                            </div>
                                            <div className="text-[9.5px] border-t border-zinc-900 pt-1.5 text-zinc-400 font-sans leading-normal">
                                              <strong className="text-cyan-400 font-mono text-[9px] uppercase tracking-wide block mb-0.5 font-bold">Strategic Imperative:</strong>
                                              {connectionImpacts[`${pat.id}_${sig.id}`].takeaway}
                                            </div>
                                            <div className="flex justify-end pt-1">
                                              <button
                                                onClick={() => handleGenerateImpactScenario(pat.id, sig.id)}
                                                disabled={generatingImpactKey === `${pat.id}_${sig.id}`}
                                                className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 hover:underline cursor-pointer flex items-center gap-1"
                                              >
                                                {generatingImpactKey === `${pat.id}_${sig.id}` ? "Re-projecting..." : "Re-project scenario"}
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => handleGenerateImpactScenario(pat.id, sig.id)}
                                            disabled={generatingImpactKey === `${pat.id}_${sig.id}`}
                                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-zinc-950 hover:bg-cyan-950/20 border border-zinc-900 hover:border-cyan-900/60 transition text-[9.5px] tracking-wide font-mono text-zinc-450 hover:text-cyan-300 rounded cursor-pointer mt-1 font-semibold"
                                          >
                                            <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
                                            <span>
                                              {generatingImpactKey === `${pat.id}_${sig.id}` ? "Re-evaluating trends..." : "Project Future Impact Scenario"}
                                            </span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {/* Quick add connection builder */}
                          {(() => {
                            const unconnected = patterns.filter(p => !connections.some(c => c.signalId === sig.id && c.patternId === p.id));
                            if (unconnected.length === 0) return null;
                            return (
                              <div className="pt-1.5 space-y-1.5">
                                <span className="text-[9px] uppercase font-mono text-zinc-500 block">Establish New Pattern Link</span>
                                <select
                                  id={`select-add-pat-${sig.id}`}
                                  value=""
                                  onChange={(e) => {
                                    const patId = e.target.value;
                                    if (!patId) return;
                                    const newConns = [...connections, {
                                      patternId: patId,
                                      signalId: sig.id,
                                      strength: "Emerging" as const,
                                      notes: ""
                                    }];
                                    setConnections(newConns);
                                    localStorage.setItem("strategic_vault_connections", JSON.stringify(newConns));
                                    const addedPat = patterns.find(p => p.id === patId);
                                    addTerminalLog(`Linked Pattern ${addedPat?.number || patId} <-> Signal ${sig.number} (Emerging)`);
                                  }}
                                  className="w-full text-[10px] font-mono bg-zinc-950 border border-zinc-900 rounded px-2 py-1.5 text-zinc-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                                >
                                  <option value="">+ Connect map node...</option>
                                  {unconnected.map(p => (
                                    <option key={p.id} value={p.id}>
                                      Pattern {p.number}: {p.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    <Network className="h-8 w-8 text-zinc-800 mx-auto mb-2" />
                    <p className="text-xs font-mono">No element highlighted.</p>
                    <p className="text-[10px] text-zinc-600 mt-1 leading-normal">
                      Click any left pattern box or right signal box to audit explicit causal dependencies.
                    </p>
                  </div>
                )}
              </div>

              {/* Progress metrics summarizer */}
              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-lg shadow-lg space-y-4">
                <div className="text-xs tracking-wider uppercase font-semibold text-zinc-200 border-b border-zinc-900 pb-3">
                  Pattern Strength Summary
                </div>
                <div className="space-y-3 font-mono text-[10px]">
                  {patterns.map((pat) => (
                    <div key={pat.id} className="space-y-1">
                      <div className="flex justify-between text-zinc-400 hover:text-zinc-200 transition">
                        <span className="truncate max-w-[80%]">{pat.number}. {pat.title}</span>
                        <span className="text-violet-400 font-semibold">{pat.strength}</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-600 rounded-full transition-all duration-350" style={{ width: `${pat.strengthVal}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* TAB 3: Cognitive Decompression Space */}
        {activeTab === "decompression" && (
          <div className="flex-1 bg-zinc-950 p-6 flex flex-col items-center justify-center overflow-y-auto">
            <div className="max-w-xl w-full text-center space-y-8 my-auto select-none">
              {/* Introduction header */}
              <div className="space-y-2">
                <div className="flex justify-center mb-1">
                  <Compass className="h-8 w-8 text-cyan-400 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold font-sans tracking-wide text-zinc-100 uppercase">
                  Cognitive Decompression Vault
                </h2>
                <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                  Inspired by the <strong>BREATHING_SPACE.md</strong> framework instruction. Pause continuous intake to remove complexity from strategic decision flows.
                </p>
              </div>

              {/* Box breathing sensory ring animation loop */}
              <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/40 rounded-2xl border border-zinc-900 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-950/10 via-transparent to-cyan-950/10 pointer-events-none" />

                {/* Pulsing visual SVG Circle Ring */}
                <div className="relative h-44 w-44 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale:
                        breathingPhase === "Inhale" ? [1, 1.4] :
                        breathingPhase === "Hold (Full)" ? 1.4 :
                        breathingPhase === "Exhale" ? [1.4, 1] :
                        1,
                    }}
                    transition={{
                      duration: 4,
                      ease: "easeInOut"
                    }}
                    className={cn(
                      "absolute inset-0 rounded-full border-4 transition-colors duration-500",
                      breathingPhase === "Inhale" ? "border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]" :
                      breathingPhase === "Hold (Full)" ? "border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.4)]" :
                      breathingPhase === "Exhale" ? "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]" :
                      "border-zinc-800"
                    )}
                  />

                  {/* Breathing countdown text output */}
                  <div className="space-y-1.5 text-center">
                    <span className="text-xs font-mono tracking-widest uppercase text-zinc-500 block">Phase</span>
                    <strong className={cn(
                      "text-sm uppercase tracking-wider font-semibold block transition-colors duration-500",
                      breathingPhase === "Inhale" ? "text-violet-300" :
                      breathingPhase === "Hold (Full)" ? "text-cyan-300" :
                      breathingPhase === "Exhale" ? "text-amber-300" :
                      "text-zinc-500"
                    )}>{breathingPhase}</strong>
                    <span className="text-3xl font-mono text-zinc-200 mt-2 block font-extrabold">{secondsRemaining}s</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-6 text-[10px] uppercase font-mono text-zinc-500 border-t border-zinc-800/40 pt-4 w-full justify-center">
                  <span className={cn(breathingPhase === "Inhale" && "text-violet-400 font-bold")}>Inhale 4s</span>
                  <span>•</span>
                  <span className={cn(breathingPhase === "Hold (Full)" && "text-cyan-400 font-bold")}>Hold 4s</span>
                  <span>•</span>
                  <span className={cn(breathingPhase === "Exhale" && "text-amber-400 font-bold")}>Exhale 4s</span>
                  <span>•</span>
                  <span className={cn(breathingPhase === "Hold (Empty)" && "text-zinc-300 font-bold")}>Hold 4s</span>
                </div>
              </div>

              {/* Submit absolute high-leverage strategic decision flow */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg text-left shadow space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-sans">
                    Formulate Decompressed High-Leverage Decision
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                    Once absolute cognitive clarity is achieved, document your highest value strategy pivot here. It will immediately write into internal strategic filter markdown files.
                  </p>
                </div>

                <form onSubmit={handleSubmitDecompressionDecision} className="space-y-3">
                  <textarea
                    value={newDecisionText}
                    onChange={(e) => setNewDecisionText(e.target.value)}
                    placeholder="We will focus 100% of pipeline resources specifically into building autonomous agent tooling instead of static APIs..."
                    className="w-full h-20 bg-zinc-950 text-xs font-mono text-zinc-300 p-2.5 rounded border border-zinc-800 focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-zinc-600">This writes to 99_System / DECISION_FILTER.md</span>
                    <button
                      type="submit"
                      disabled={!newDecisionText.trim()}
                      className="px-4 py-1.5 bg-violet-600 hover:bg-violet-750 transition disabled:opacity-50 font-mono text-xs text-white rounded font-semibold"
                    >
                      Commit Decision
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Intelligence Feed (Community Hub) */}
        {activeTab === "feed" && (
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Feed Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-900">
                <div>
                  <h2 className="text-xl font-bold font-sans tracking-wide text-zinc-100 uppercase flex items-center gap-2">
                    <Radio className="h-5 w-5 text-violet-500 animate-pulse" />
                    <span>Intelligence Feed</span>
                  </h2>
                  <p className="text-xs text-zinc-500 font-mono mt-1">
                    Disseminate generated blueprints, share index models, and examine peers&apos; strategic vectors.
                  </p>
                </div>
                {profile && (
                  <div className="flex items-center gap-3 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                    <img src={profile.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full border border-violet-500/30 object-cover" />
                    <div className="font-mono text-[10px]">
                      <div className="text-zinc-200 font-bold font-sans">@{profile.username}</div>
                      <div className="text-zinc-500 text-[9px] flex items-center gap-1.5 mt-0.5">
                        <span>{profile.following.length} Following</span>
                        <span>•</span>
                        <span>{profile.followers.length} Followers</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Local Simulation Mode Info Bar */}
              {isRealFirebase && !firebaseUser && (
                <div className="bg-zinc-900/40 border border-zinc-900/80 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in shadow-xl">
                  <div className="flex gap-3 items-start md:items-center">
                    <Shield className="h-5 w-5 text-violet-400 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-zinc-200 block font-sans">Strategic Cloud Synchronization Passive</span>
                      <p className="text-zinc-500 font-mono text-[10.5px] mt-0.5">Connecting your Google ID validates your blueprint authorization and securely publishes posts to the live Firestore.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleGoogleSignIn}
                    className="px-4 py-1.5 bg-violet-600 hover:bg-violet-750 transition text-white text-[11.5px] font-mono font-bold rounded shrink-0 flex items-center gap-1.5 cursor-pointer selection-none"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Synchronize Identity</span>
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left column: Publish new creation */}
                <div className="lg:col-span-4 bg-zinc-900/40 p-5 rounded-lg border border-zinc-900 shadow-xl space-y-4">
                  <div className="border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-violet-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-sans">
                      Share New Blueprint
                    </h3>
                  </div>

                  <form onSubmit={handlePublishPost} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block">Creation Title</label>
                      <input
                        type="text"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        placeholder="e.g. Decentralized Logic Nodes v2"
                        className="w-full bg-zinc-950 text-xs text-zinc-200 p-2.5 rounded border border-zinc-800 focus:outline-none focus:border-violet-500 font-mono placeholder-zinc-700"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block">Strategic Insights & Content</label>
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Write down details on what was synthesized, why it matters, and strategic impact observations..."
                        className="w-full h-24 bg-zinc-950 text-xs text-zinc-200 p-2.5 rounded border border-zinc-800 focus:outline-none focus:border-violet-500 resize-none font-sans placeholder-zinc-700 leading-relaxed"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block">Associate Workspace Context</label>
                      <select
                        value={newPostSelectedFile}
                        onChange={(e) => setNewPostSelectedFile(e.target.value)}
                        className="w-full bg-zinc-950 text-xs text-zinc-300 p-2 rounded border border-zinc-800 focus:outline-none focus:border-violet-500 font-mono"
                      >
                        <option value="">-- No file link --</option>
                        {vaultFiles.map((f) => (
                          <option key={f.path} value={f.path}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Integrated AI Art Generator input */}
                    <div className="space-y-2 pt-1">
                      <div className="bg-zinc-950 p-3 rounded border border-zinc-850 space-y-2">
                        <label className="text-[9px] font-mono text-violet-400 uppercase font-black block tracking-wider">
                          Synthesize AI Blueprint Image
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newPostImagePrompt}
                            onChange={(e) => setNewPostImagePrompt(e.target.value)}
                            placeholder="e.g. vibrant holographic neural circuitry"
                            className="flex-1 bg-zinc-900 text-[10px] text-zinc-300 px-2 py-1.5 rounded border border-zinc-800 focus:outline-none focus:border-violet-500 font-mono placeholder-zinc-700"
                          />
                          <button
                            type="button"
                            onClick={handleGeneratePostImage}
                            disabled={isGeneratingPostImage}
                            className="bg-violet-950 text-violet-300 border border-violet-900 hover:bg-violet-900 text-[10px] px-2.5 py-1.5 rounded font-mono font-bold transition flex items-center gap-1 shrink-0 disabled:opacity-40"
                          >
                            {isGeneratingPostImage ? (
                              <span className="animate-spin inline-block w-2.5 h-2.5 border-t-2 border-violet-300 rounded-full" />
                            ) : (
                              <ImageIcon className="h-3 w-3" />
                            )}
                            <span>Synthesize</span>
                          </button>
                        </div>
                        {postDraftImageUrl && (
                          <div className="relative mt-2 rounded border border-zinc-800 bg-zinc-900 overflow-hidden group">
                            <img
                              src={postDraftImageUrl}
                              alt="Draft"
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => setPostDraftImageUrl("")}
                                className="text-[10px] font-mono text-red-400 bg-red-950 px-2 py-1 rounded border border-red-900"
                              >
                                Discard artwork
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPublishingPost}
                      className="w-full bg-violet-600 hover:bg-violet-750 text-white font-mono text-xs py-2 rounded font-bold transition flex items-center justify-center gap-1.5"
                    >
                      {isPublishingPost ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-white" />
                          <span>Disseminating...</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Publish to Intelligence Feed</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right column: Post Timeline stream list */}
                <div className="lg:col-span-8 space-y-4">
                  {feedPosts.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/10 border border-zinc-900 rounded-lg p-6">
                      <Radio className="h-10 w-10 text-zinc-800 mx-auto mb-3" />
                      <p className="text-xs font-mono text-zinc-500">Intelligence feed is currently silent.</p>
                      <p className="text-[10px] text-zinc-600 mt-1">Publish the first strategic vector above.</p>
                    </div>
                  ) : (
                    feedPosts.map((post) => {
                      const isLiked = profile ? post.likes.includes(profile.uid) : false;
                      const hasFollowed = profile ? profile.following.includes(post.authorId) : false;
                      const isSelf = profile ? profile.uid === post.authorId : false;

                      return (
                        <div key={post.id} className="bg-zinc-900/30 border border-zinc-900 rounded-lg overflow-hidden hover:border-zinc-850 transition duration-150">
                          
                          {/* Post Header layout */}
                          <div className="p-4 flex items-start justify-between gap-3 bg-zinc-900/10 border-b border-zinc-900/50">
                            <div className="flex items-center gap-3">
                              <img
                                src={post.authorAvatar}
                                alt={post.authorName}
                                className="w-9 h-9 rounded-full object-cover border border-zinc-800 shrink-0"
                              />
                              <div>
                                <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                                  <span>@{post.authorName}</span>
                                  {isSelf && (
                                    <span className="text-[8px] uppercase tracking-wider font-mono bg-violet-950 text-violet-400 px-1 py-0.2 rounded border border-violet-900">
                                      you
                                    </span>
                                  )}
                                </div>
                                <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
                                  {new Date(post.createdAt).toLocaleDateString()} @ {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>

                            {/* Adore / Follow toggle button */}
                            {!isSelf &&profile && (
                              <button
                                onClick={() => handleToggleFollow(post.authorId, post.authorName)}
                                className={cn(
                                  "px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-all-opacity shrink-0 flex items-center gap-1 selection-none cursor-pointer border",
                                  hasFollowed
                                    ? "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-red-400 hover:border-red-950"
                                    : "bg-cyan-950 text-cyan-300 border-cyan-900 hover:bg-cyan-900"
                                )}
                              >
                                {hasFollowed ? (
                                  <>
                                    <UserCheck className="h-3 w-3 text-red-400" />
                                    <span>Adoring</span>
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-3 w-3" />
                                    <span>Adore Creator</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Post Visual artwork banner if existing */}
                          {post.imageUrl && (
                            <div className="relative aspect-video w-full bg-zinc-950/80 border-b border-zinc-900 overflow-hidden">
                              <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover opacity-85 hover:scale-101 transition duration-500"
                              />
                              <div className="absolute top-3 left-3 bg-zinc-950/90 text-zinc-400 px-2 py-0.5 rounded font-mono text-[9px] border border-zinc-800/80 flex items-center gap-1">
                                <Radio className="h-2.5 w-2.5 text-violet-400 animate-pulse" />
                                <span>COMMUNITY ASSET</span>
                              </div>
                            </div>
                          )}

                          {/* Post Core texts info */}
                          <div className="p-4 space-y-3">
                            <div className="space-y-1">
                              <h3 className="text-sm font-semibold tracking-wide text-zinc-100 font-sans leading-tight">
                                {post.title}
                              </h3>
                              {post.associatedFile && (
                                <div className="inline-flex items-center gap-1 bg-zinc-900/60 text-cyan-400 border border-zinc-850 px-1.5 py-0.5 rounded text-[9px] font-mono">
                                  <span>Linked project context:</span>
                                  <span className="underline select-all">{post.associatedFile}</span>
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                              {post.content}
                            </p>
                          </div>

                          {/* Action controls toolbar */}
                          <div className="px-4 py-2.5 bg-zinc-900/10 border-t border-zinc-900 flex items-center justify-between">
                            <div className="flex gap-4">
                              <button
                                onClick={() => handleToggleLike(post.id)}
                                className={cn(
                                  "flex items-center gap-1 text-[10px] font-mono select-none cursor-pointer transition",
                                  isLiked 
                                    ? "text-red-400 hover:text-red-300"
                                    : "text-zinc-500 hover:text-zinc-300"
                                )}
                              >
                                <Heart className={cn("h-3.5 w-3.5 transition", isLiked && "fill-red-400 text-red-400")} />
                                <strong>{post.likesCount || 0} Likes</strong>
                              </button>

                              <button
                                onClick={() => setExpandedCommentsPostId(expandedCommentsPostId === post.id ? null : post.id)}
                                className={cn(
                                  "flex items-center gap-1 text-[10px] font-mono select-none cursor-pointer transition",
                                  expandedCommentsPostId === post.id
                                    ? "text-violet-400 hover:text-violet-300"
                                    : "text-zinc-500 hover:text-zinc-300"
                                )}
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>{post.commentsCount || 0} Comments</span>
                              </button>
                            </div>

                            <span className="text-[9px] text-zinc-650 font-mono">ID: {post.id}</span>
                          </div>

                          {/* Expanded interactive Comments element */}
                          {expandedCommentsPostId === post.id && (
                            <div className="bg-zinc-950/60 p-4 border-t border-zinc-900 space-y-3 animate-fade-in">
                              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider pb-1 ml-0.5">
                                Comments Thread
                              </div>

                              {/* Comment items list */}
                              {(() => {
                                const list = activeComments[post.id] || [];
                                if (list.length === 0) {
                                  return (
                                    <p className="text-[10px] text-zinc-600 font-mono italic p-2 rounded bg-zinc-900/20">
                                      No comments recorded yet. Write the first strategy remark below.
                                    </p>
                                  );
                                }
                                return (
                                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                                    {list.map((c) => (
                                      <div key={c.id} className="text-[11px] bg-zinc-950 border border-zinc-900 p-2 rounded flex gap-2">
                                        <img src={c.authorAvatar} alt="avatar" className="w-5 h-5 rounded-full object-cover border border-zinc-800 shrink-0 mt-0.5" />
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-zinc-300">@{c.authorName}</span>
                                            <span className="text-[8px] font-mono text-zinc-650">
                                              {new Date(c.createdAt).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <p className="text-zinc-400 leading-normal">{c.content}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}

                              {/* Save New Comment formulation */}
                              <div className="flex gap-2 pt-1 border-t border-zinc-900/40">
                                <input
                                  type="text"
                                  value={newCommentTexts[post.id] || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setNewCommentTexts(prev => ({ ...prev, [post.id]: val }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handlePostComment(post.id);
                                    }
                                  }}
                                  placeholder="Formulate strategic follow-up reply..."
                                  className="flex-1 bg-zinc-950 text-xs text-zinc-350 px-2.5 py-1.5 rounded border border-zinc-800 focus:outline-none focus:border-violet-500 font-sans placeholder-zinc-750"
                                />
                                <button
                                  type="button"
                                  onClick={() => handlePostComment(post.id)}
                                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs px-3 py-1.5 rounded border border-zinc-800 font-bold"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Profile Directory */}
        {profile && activeTab === "profile" && (
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Profile Card component */}
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-lg p-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-3">
                  <span className="text-[8px] font-mono text-violet-400 bg-violet-950/80 border border-violet-900 px-2 py-0.5 rounded uppercase tracking-widest">
                    Operational Status: Active
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Photo Avatar circle frame */}
                  <div className="relative group shrink-0">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.username}
                      className="w-24 h-24 rounded-full object-cover border-2 border-violet-500/40 shadow-inner"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                      <label htmlFor="pfp-upload" className="cursor-pointer text-[9px] font-mono text-zinc-300">
                        Upload
                      </label>
                      <input
                        type="file"
                        id="pfp-upload"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Profile data and stats summary */}
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="space-y-0.5">
                      <h2 className="text-xl font-bold font-sans tracking-wide text-zinc-100 flex items-center justify-center md:justify-start gap-2">
                        <span>@{profile.username}</span>
                      </h2>
                      <p className="text-[10px] font-mono text-zinc-500">
                        SYSTEM ACCOUNT UNIQUE UID: <span className="text-violet-400 font-semibold">{profile.uid}</span>
                      </p>
                    </div>

                    <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
                      Lead Intelligence Strategist tasked with organizing indices, resolving causal nodes, and maintaining maximum signal clarity.
                    </p>

                    {/* Stats columns */}
                    <div className="flex gap-4 items-center justify-center md:justify-start pt-2">
                      <div className="bg-zinc-950/60 border border-zinc-900 px-3 py-1 rounded text-center">
                        <span className="text-xs text-zinc-100 font-sans block font-bold">{profile.savedProjectsCount}</span>
                        <span className="text-[8px] font-mono uppercase text-zinc-500">Project files</span>
                      </div>
                      <div className="bg-zinc-950/60 border border-zinc-900 px-3 py-1 rounded text-center">
                        <span className="text-xs text-zinc-100 font-sans block font-bold">{profile.followers.length || 0}</span>
                        <span className="text-[8px] font-mono uppercase text-zinc-500">Adoring Followers</span>
                      </div>
                      <div className="bg-zinc-950/60 border border-zinc-900 px-3 py-1 rounded text-center">
                        <span className="text-xs text-zinc-100 font-sans block font-bold">{profile.following.length || 0}</span>
                        <span className="text-[8px] font-mono uppercase text-zinc-500">Following Creators</span>
                      </div>
                    </div>
                  </div>

                  {/* Settings toggle click block */}
                  <div className="shrink-0 pt-4 md:pt-0">
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="px-4 py-1.5 bg-zinc-950 hover:bg-zinc-900 transition font-mono text-xs text-zinc-300 rounded border border-zinc-805 flex items-center gap-1.5"
                    >
                      <User className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{isEditingProfile ? "Cancel editing" : "Edit Profile Profile"}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded configuration profile edit menu block */}
                {isEditingProfile && (
                  <div className="mt-6 pt-5 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in bg-zinc-950/50 p-4 rounded border border-zinc-900">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-extrabold pb-1">
                        General Identity Settings
                      </h4>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase block">Strategist Nickname</label>
                        <input
                          type="text"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="w-full bg-zinc-950 text-xs text-zinc-200 px-3 py-2 rounded border border-zinc-800 focus:outline-none focus:border-violet-500 font-mono"
                          placeholder="Strategist nickname"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase block">Manual Avatar Link or base64 stream</label>
                        <input
                          type="text"
                          value={editAvatarUrl}
                          onChange={(e) => setEditAvatarUrl(e.target.value)}
                          className="w-full bg-zinc-950 text-[10px] text-zinc-400 px-3 py-2 rounded border border-zinc-800 focus:outline-none focus:border-violet-500 font-mono"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-mono text-violet-400 uppercase tracking-wider font-extrabold pb-1">
                        Fast Neural Icon Synthesizer
                      </h4>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase block">Generate Custom Professional Avatar</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={avatarGeneratePrompt}
                            onChange={(e) => setAvatarGeneratePrompt(e.target.value)}
                            placeholder="e.g. quantum cyber strategist face icon"
                            className="flex-1 bg-zinc-950 text-[10px] text-zinc-300 px-2 py-1.5 rounded border border-zinc-800 focus:outline-none focus:border-violet-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleGenerateAvatarImage}
                            disabled={isGeneratingAvatar}
                            className="bg-violet-950 text-violet-300 border border-violet-900 hover:bg-violet-900 text-[10px] px-3 py-1.5 rounded font-mono font-black"
                          >
                            {isGeneratingAvatar ? "Synthesizing..." : "Synthesize"}
                          </button>
                        </div>
                        <p className="text-[8px] font-mono text-zinc-600 leading-normal">
                          Generates instant avatar design artwork using Pollinations server-side vector generator pipeline.
                        </p>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveProfileChanges}
                          className="px-4 py-1.5 bg-violet-600 hover:bg-violet-750 font-mono text-xs text-white rounded font-bold"
                        >
                          Commit Profile Settings
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sub Columns containing saved projects list and live telemetry telemetry logs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                
                {/* Left panel: Active database index file mappings */}
                <div className="bg-zinc-900/20 border border-zinc-900 rounded-lg p-5 space-y-4 shadow-sm">
                  <div className="border-b border-zinc-900 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                      <Flame className="h-4 w-4 text-cyan-400" />
                      <span>Saved File Projects ({vaultFiles.length})</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500">Live indices</span>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {vaultFiles.map((file) => (
                      <div
                        key={file.path}
                        onClick={() => {
                          setActiveFile(file);
                          setEditingContent(file.content);
                          setActiveTab("workspace");
                          addTerminalLog(`Switched file focus context to: ${file.name}`);
                        }}
                        className="p-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded transition duration-150 cursor-pointer flex items-center justify-between group"
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-zinc-200 font-sans group-hover:text-cyan-400 transition">
                            {file.name}
                          </div>
                          <div className="text-[9px] font-mono text-zinc-550 italic">
                            Path: {file.path}
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-700 group-hover:text-cyan-400 transition" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right panel: Historical Telemetry system log */}
                <div className="bg-zinc-900/20 border border-zinc-900 rounded-lg p-5 space-y-4 shadow-sm">
                  <div className="border-b border-zinc-900 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 font-sans">
                      <History className="h-4 w-4 text-violet-400" />
                      <span>Historical Telemetry Log</span>
                    </div>
                    <span className="text-[9px] font-mono text-violet-400 bg-violet-950 border border-violet-900 px-1 py-0.2 rounded font-black">
                      Live audit
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 font-mono text-[10px] leading-relaxed">
                    {profile.history.length === 0 ? (
                      <p className="text-zinc-650 italic text-center py-8">
                        No transactions recorded. Create files, update connections, or like creations.
                      </p>
                    ) : (
                      profile.history.map((log) => (
                        <div key={log.id} className="p-2.5 bg-zinc-950 border border-zinc-900 rounded space-y-1 hover:bg-zinc-950/80 transition">
                          <div className="text-zinc-300">
                            {log.action}
                          </div>
                          <div className="text-[8px] text-zinc-600 text-right">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer layout */}
      <footer className="border-t border-zinc-900 bg-zinc-950 text-[10px] font-mono text-zinc-600 px-5 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <div>
          <span>AI Strategic Intelligence Vault v1.0.0</span>
          <span className="mx-2">•</span>
          <span>Crafted in sandboxed secure full-stack layout</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-zinc-700" />
          <span>Active local persistence with fully offline database state</span>
        </div>
      </footer>
    </div>
  );
}
