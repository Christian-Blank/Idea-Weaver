import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Types ---

export type SectionType = 'text' | 'list' | 'prompt' | 'code';

export interface Rule {
  id: string;
  name: string;
  instruction: string;
  category: 'Style' | 'Format' | 'Tone' | 'Safety' | 'Custom';
  history?: { instruction: string; timestamp: Date; user: string; }[];
}

export interface RuleGroup {
  id: string;
  name: string;
  description?: string;
  ruleIds: string[];
}

export interface Section {
  id: string;
  type: SectionType;
  title?: string;
  content: string;
  status: 'draft' | 'generating' | 'review' | 'completed';
  aiSuggestions?: string[];
  dependencies?: string[]; // IDs of other sections or docs this depends on
  rules?: string; // Custom instructions
  ruleIds?: string[]; // Active library rules
  groupIds?: string[]; // Active library rule groups
  executionMode?: 'manual' | 'auto' | 'disabled';
  history?: { content: string; timestamp: Date; user: string; causedBy?: string; }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  personalRules: string; // Global rules applied to everything this user touches
}

export interface DocumentHistoryItem {
  id: string;
  timestamp: Date;
  actor: 'User' | 'AI' | 'System';
  action: string;
  description?: string;
  userId?: string;
}

export interface DocumentType {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
  defaultRules: string;
  defaultRuleIds?: string[];
  defaultGroupIds?: string[];
  icon: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  typeId: string;
  rules: string;
  ruleIds?: string[];
  groupIds?: string[];
  initialSections: Omit<Section, 'id' | 'status'>[];
}

export interface Document {
  id: string;
  title: string;
  type: string; // logical type, e.g. "idea", "spec", "flow", "scratchpad"
  parentId?: string;
  childrenIds: string[];
  sections: Section[];
  history?: DocumentHistoryItem[];
  rules?: string; // Document-wide rules
  ruleIds?: string[];
  groupIds?: string[];
  createdAt: Date;
  updatedAt: Date;
  // Tagging & ownership metadata
  tags?: string[]; // free-form user tags ("ai", "v1", etc.)
  suggestedTags?: string[]; // mock AI suggestions
  projectName?: string; // for system tag project:<project>
  driUserId?: string | null; // explicit DRI assignment
  lastEditedByUserId?: string | null; // for defaults and history
}

interface DocumentContextType {
  documents: Document[];
  documentTypes: DocumentType[];
  templates: DocumentTemplate[];
  rules: Rule[];
  ruleGroups: RuleGroup[];
  currentDocId: string | null;
  currentUser: UserProfile;
  userProfiles: UserProfile[];
  isAuthenticated: boolean;
  setCurrentDocId: (id: string | null) => void;
  setCurrentUser: (user: UserProfile) => void;
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => void;
  login: (email: string) => boolean;
  logout: () => void;
  signup: (name: string, email: string) => void;
  createDocument: (type: string, parentId?: string, templateId?: string) => string;
  updateSection: (docId: string, sectionId: string, updates: Partial<Section>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  addSection: (docId: string, section: Section) => void;
  generateChildDocument: (parentId: string, type: string) => void;
  getDocument: (id: string) => Document | undefined;
  getObjectType: (typeCode: string) => DocumentType | undefined;
  projectRules: string;
  setProjectRules: (rules: string) => void;
  addDocumentType: (dt: DocumentType) => void;
  updateDocumentType: (id: string, updates: Partial<DocumentType>) => void;
  deleteDocumentType: (id: string) => void;
  addTemplate: (t: DocumentTemplate) => void;
  updateTemplate: (id: string, updates: Partial<DocumentTemplate>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;
  deleteDocument: (id: string) => void;
  duplicateDocument: (id: string) => void;
  addRule: (r: Rule) => void;
  updateRule: (id: string, updates: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
  addRuleGroup: (rg: RuleGroup) => void;
  updateRuleGroup: (id: string, updates: Partial<RuleGroup>) => void;
  deleteRuleGroup: (id: string) => void;
  resolveRules: (custom?: string, ruleIds?: string[], groupIds?: string[]) => string;
}

// --- Mock Data ---

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'u-1',
    name: 'Alex Chen',
    email: 'alex@flowstate.ai',
    role: 'Product Manager',
    avatar: 'AC',
    personalRules: 'Always clarify the "Why" before the "What". Prefer concise, bulleted lists over long paragraphs.'
  },
  {
    id: 'u-2',
    name: 'Sarah Jones',
    email: 'sarah@flowstate.ai',
    role: 'Lead Engineer',
    avatar: 'SJ',
    personalRules: 'Include technical feasibility notes. Use precise technical terminology. Default to TypeScript examples.'
  },
  {
    id: 'u-3',
    name: 'Mike Ross',
    email: 'mike@flowstate.ai',
    role: 'Product Designer',
    avatar: 'MR',
    personalRules: 'Focus on user emotional state and cognitive load. Describe interactions spatially.'
  }
];

const INITIAL_RULES: Rule[] = [
  { id: 'r-concise', name: 'Concise', category: 'Style', instruction: 'Be concise and direct. Avoid fluff and filler words.' },
  { id: 'r-active', name: 'Active Voice', category: 'Style', instruction: 'Use active voice. Subject performs the action.' },
  { id: 'r-no-jargon', name: 'No Jargon', category: 'Tone', instruction: 'Use plain language. Explain technical terms if necessary.' },
  { id: 'r-technical', name: 'Technical Depth', category: 'Tone', instruction: 'Use precise technical terminology. Assume a knowledgeable audience.' },
  { id: 'r-bullets', name: 'Bullet Points', category: 'Format', instruction: 'Use bullet points for lists and steps.' },
  { id: 'r-markdown', name: 'Markdown', category: 'Format', instruction: 'Use proper Markdown formatting for headers, links, and code blocks.' },
];

const INITIAL_RULE_GROUPS: RuleGroup[] = [
  { id: 'rg-professional', name: 'Professional Standard', description: 'Clean, direct business communication', ruleIds: ['r-concise', 'r-active', 'r-no-jargon'] },
  { id: 'rg-engineering', name: 'Engineering Spec', description: 'Detailed technical writing', ruleIds: ['r-technical', 'r-markdown', 'r-active'] },
];

const INITIAL_PROJECT_RULES = `Always maintain a professional but creative tone.
Prioritize user experience and accessibility.
Use "Cognitive Flow" terminology where appropriate.`;

const INITIAL_TYPES: DocumentType[] = [
  {
    id: 'dt-idea',
    name: 'Idea',
    code: 'idea',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Initial concepts and north stars',
    defaultRules: 'Focus on high-level vision, emotional resonance, and "the why". Avoid implementation details.',
    icon: 'Lightbulb'
  },
  {
    id: 'dt-spec',
    name: 'Specification',
    code: 'spec',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Detailed product requirements',
    defaultRules: 'Be precise, unambiguous, and exhaustive. Focus on "the what" and "the how". Use technical terminology.',
    icon: 'FileText'
  },
  {
    id: 'dt-flow',
    name: 'User Flow',
    code: 'flow',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'User journeys and interactions',
    defaultRules: 'Focus on the user experience, steps, and transitions. Identify edge cases and error states.',
    icon: 'GitBranch'
  }
];

const INITIAL_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tpl-idea-basic',
    name: 'New Idea',
    description: 'Blank canvas for a new concept',
    typeId: 'dt-idea',
    rules: '',
    initialSections: [
      { type: 'text', title: 'Vision', content: '' },
      { type: 'list', title: 'Key Objectives', content: '' }
    ]
  },
  {
    id: 'tpl-spec-tech',
    name: 'Technical Spec',
    description: 'Engineering-focused specification',
    typeId: 'dt-spec',
    rules: 'Include database schemas, API endpoints, and security considerations.',
    initialSections: [
      { type: 'text', title: 'Architecture Overview', content: '' },
      { type: 'code', title: 'Data Models', content: '' }
    ]
  },
  {
    id: 'tpl-flow-user',
    name: 'User Journey',
    description: 'Standard user path mapping',
    typeId: 'dt-flow',
    rules: '',
    initialSections: [
      { type: 'text', title: 'Persona', content: '' },
      { type: 'list', title: 'Steps', content: '' }
    ]
  }
];

const INITIAL_DOCS: Document[] = [
  // 1. Idea Document (North Star)
  {
    id: 'idea-1',
    title: 'FlowState - The AI Creative Suite',
    type: 'idea',
    rules: 'Focus on high-level vision and emotional resonance. Avoid technical implementation details.',
    childrenIds: ['spec-1'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    projectName: 'FlowState Suite',
    driUserId: 'u-1',
    lastEditedByUserId: 'u-1',
    tags: ['ai-native', 'vision'],
    suggestedTags: ['north-star', 'strategy', 'product-vision'],
    sections: [
      {
        id: 'sec-1',
        type: 'text',
        title: 'Vision',
        content: 'FlowState is an AI-native document studio designed to help product teams move from raw ideas to fully specified features without friction. It treats documents as a living graph, where changes in an idea propagate to specs and designs.',
        status: 'completed',
      },
      {
        id: 'sec-2',
        type: 'list',
        title: 'Core Values',
        content: '- Flow over Form\n- Connected Intelligence\n- Living Documents\n- AI as a Partner, not a Tool',
        status: 'completed',
      }
    ]
  },

  // 2. Product Spec (Derived from Idea)
  {
    id: 'spec-1',
    title: 'FlowState MVP Specification',
    type: 'spec',
    parentId: 'idea-1',
    childrenIds: ['spec-2', 'spec-3'],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-05'),
    projectName: 'FlowState Suite',
    driUserId: 'u-2',
    lastEditedByUserId: 'u-2',
    tags: ['mvp', 'spec'],
    suggestedTags: ['requirements', 'v1-scope', 'engineering'],
    sections: [
      {
        id: 'sec-3',
        type: 'text',
        title: 'Executive Summary',
        content: 'The MVP will focus on the core document editor and the "context graph" visualization. Users must be able to branch documents and see the relationships between them.',
        status: 'completed',
        dependencies: ['idea-1'],
        history: [
          {
            content: 'The MVP will focus on the core document editor.',
            timestamp: new Date('2024-01-03T09:00:00'),
            user: 'Alex Chen'
          },
          {
            content: 'The MVP will focus on the core document editor and visualization.',
            timestamp: new Date('2024-01-03T14:30:00'),
            user: 'Alex Chen'
          }
        ]
      },
      {
        id: 'sec-4',
        type: 'text',
        title: 'Target Audience',
        content: 'Product Managers, Founders, and Design Engineers who value speed and structure.',
        status: 'completed',
        history: [] // Added empty history to avoid missing property if accessed
      }
    ]
  },

  // 3. Feature Spec 1 (Authentication)
  {
    id: 'spec-2',
    title: 'Feature: Authentication & Profiles',
    type: 'spec',
    parentId: 'spec-1',
    childrenIds: [],
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
    projectName: 'Auth & Profiles',
    driUserId: 'u-2',
    lastEditedByUserId: 'u-2',
    tags: ['auth', 'profiles'],
    suggestedTags: ['login-flow', 'onboarding', 'security'],
    sections: [
      {
        id: 'sec-5',
        type: 'text',
        title: 'Requirements',
        content: 'Simple email/password login + Google Auth. User profiles should store "Creative Style" preferences for AI tuning.',
        status: 'review',
        aiSuggestions: ['Suggestion: Add GitHub auth for engineering-focused users.'],
        history: [
          {
            content: 'Simple email/password login.',
            timestamp: new Date('2024-01-06T10:00:00'),
            user: 'Sarah Jones'
          },
          {
            content: 'Simple email/password login + Google Auth.',
            timestamp: new Date('2024-01-06T11:30:00'),
            user: 'Sarah Jones'
          }
        ]
      }
    ]
  },

  // 4. Feature Spec 2 (Dashboard) - The complex one
  {
    id: 'spec-3',
    title: 'Feature: Infinite Canvas Dashboard',
    type: 'spec',
    parentId: 'spec-1',
    childrenIds: ['flow-1', 'spec-4', 'spec-5'],
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-08'),
    projectName: 'Infinite Canvas',
    driUserId: 'u-3',
    lastEditedByUserId: 'u-3',
    tags: ['dashboard', 'canvas'],
    suggestedTags: ['infinite-scroll', 'graph-view', 'spatial'],
    history: [
      {
        id: 'h1',
        timestamp: new Date('2024-01-07T09:00:00'),
        actor: 'User',
        action: 'Created document',
        description: 'Initial draft started from "FlowState MVP Specification"'
      },
      {
        id: 'h2',
        timestamp: new Date('2024-01-07T10:15:00'),
        actor: 'User',
        action: 'Updated section "Overview"',
        description: 'Defined initial list-based concept'
      },
      {
        id: 'h3',
        timestamp: new Date('2024-01-07T11:45:00'),
        actor: 'AI',
        action: 'Refined section "Overview"',
        description: 'Suggestion applied: Switch to spatial view'
      },
      {
        id: 'h4',
        timestamp: new Date('2024-01-07T14:20:00'),
        actor: 'User',
        action: 'Added section "Interactions"',
        description: 'Added pan, zoom, and reorganize capabilities'
      },
      {
        id: 'h5',
        timestamp: new Date('2024-01-08T09:30:00'),
        actor: 'User',
        action: 'Finalized "Overview"',
        description: 'Polished text and marked as completed'
      }
    ],
    sections: [
      {
        id: 'sec-6',
        type: 'text',
        title: 'Overview',
        content: 'The dashboard is not a list, but a spatial view of all projects. It should feel like an infinite canvas where project trees grow organically.',
        status: 'completed',
        history: [
          {
            content: 'The dashboard is a list of projects.',
            timestamp: new Date('2024-01-07T10:15:00'),
            user: 'Mike Ross'
          },
          {
            content: 'The dashboard should be a spatial view, not a list.',
            timestamp: new Date('2024-01-07T11:45:00'),
            user: 'AI'
          },
          {
            content: 'The dashboard is not a list, but a spatial view of all projects.',
            timestamp: new Date('2024-01-08T09:30:00'),
            user: 'Mike Ross'
          }
        ]
      },
      {
        id: 'sec-7',
        type: 'list',
        title: 'Interactions',
        content: '- Pan and Zoom\n- Click to Enter Document\n- Drag to Reorganize Trees',
        status: 'completed',
        history: [] // Added empty history
      }
    ]
  },

  // 5. UX Flow (Derived from Dashboard Spec)
  {
    id: 'flow-1',
    title: 'Dashboard Interaction Flow',
    type: 'flow',
    parentId: 'spec-3',
    childrenIds: [],
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09'),
    sections: [
      {
        id: 'sec-8',
        type: 'text',
        title: 'User Journey',
        content: 'User lands on dashboard -> Sees high-level project nodes -> Zooms in to see spec details -> Clicks node to edit.',
        status: 'completed',
        history: [
          {
            content: 'User lands on dashboard -> Clicks project.',
            timestamp: new Date('2024-01-09T13:00:00'),
            user: 'Mike Ross'
          }
        ]
      },
      {
        id: 'sec-9',
        type: 'text',
        title: 'Edge Cases',
        content: 'Empty state: Show a pulsing "New Idea" seed in the center of the screen.',
        status: 'draft',
      }
    ]
  },

  // 6. Design Spec (Derived from Dashboard Spec)
  {
    id: 'spec-4',
    title: 'Dashboard UI/Visual Spec',
    type: 'spec',
    parentId: 'spec-3',
    childrenIds: [],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    sections: [
      {
        id: 'sec-10',
        type: 'text',
        title: 'Visual Language',
        content: 'Use the "Cognitive Flow" theme. Connecting lines should be bezier curves with animated pulses to show data flow.',
        status: 'completed',
      }
    ]
  },

  // 7. Eng Spec (Derived from Dashboard Spec)
  {
    id: 'spec-5',
    title: 'Dashboard Technical Implementation',
    type: 'spec',
    parentId: 'spec-3',
    childrenIds: [],
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
    sections: [
      {
        id: 'sec-11',
        type: 'code',
        title: 'Data Structure',
        content: 'interface Node {\n  id: string;\n  position: { x: number, y: number };\n  children: Node[];\n}',
        status: 'completed',
      },
      {
        id: 'sec-12',
        type: 'text',
        title: 'Performance',
        content: 'Use HTML Canvas for the graph if node count > 100. Otherwise SVG is fine.',
        status: 'review',
      }
    ]
  }
];

// --- Context ---

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCS);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(INITIAL_TYPES);
  const [templates, setTemplates] = useState<DocumentTemplate[]>(INITIAL_TEMPLATES);
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>(INITIAL_RULE_GROUPS);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [projectRules, setProjectRules] = useState<string>(INITIAL_PROJECT_RULES);

  // User Management State
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_PROFILES[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start unauthenticated for demo

  const login = (email: string) => {
    const user = userProfiles.find(u => u.email === email);
    if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const signup = (name: string, email: string) => {
      const newUser: UserProfile = {
          id: `u-${Date.now()}`,
          name,
          email,
          role: 'New User',
          avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
          personalRules: ''
      };
      setUserProfiles(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
  };

  const resolveRules = (custom?: string, ruleIds?: string[], groupIds?: string[]) => {
      let resolved = '';
      
      // 1. Personal Rules (Always applied for this user)
      if (currentUser.personalRules) {
        resolved += `PERSONAL PREFERENCES (${currentUser.name}):\n${currentUser.personalRules}\n\n`;
      }

      // 2. Add active groups
      if (groupIds) {
          groupIds.forEach(gid => {
              const group = ruleGroups.find(g => g.id === gid);
              if (group) {
                  group.ruleIds.forEach(rid => {
                      const rule = rules.find(r => r.id === rid);
                      if (rule) resolved += `${rule.instruction}\n`;
                  });
              }
          });
      }

      // 3. Add active individual rules
      if (ruleIds) {
          ruleIds.forEach(rid => {
              const rule = rules.find(r => r.id === rid);
              if (rule) resolved += `${rule.instruction}\n`;
          });
      }

      // 4. Add custom rules override
      if (custom) resolved += `${custom}\n`;
      
      return resolved.trim();
  };

  const updateUserProfile = (id: string, updates: Partial<UserProfile>) => {
    setUserProfiles(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser.id === id) {
        setCurrentUser(prev => ({ ...prev, ...updates }));
    }
  };
  
  const addRule = (r: Rule) => setRules(prev => [...prev, r]);
  const updateRule = (id: string, updates: Partial<Rule>) => setRules(prev => prev.map(r => {
    if (r.id !== id) return r;
    
    // If instruction is changing, save to history
    if (updates.instruction && updates.instruction !== r.instruction) {
        const newHistory = [
            { instruction: r.instruction, timestamp: new Date(), user: currentUser.name }, // Use real user name
            ...(r.history || [])
        ];
        return { ...r, ...updates, history: newHistory };
    }
    
    return { ...r, ...updates };
  }));
  const deleteRule = (id: string) => setRules(prev => prev.filter(r => r.id !== id));
  
  const addRuleGroup = (rg: RuleGroup) => setRuleGroups(prev => [...prev, rg]);
  const updateRuleGroup = (id: string, updates: Partial<RuleGroup>) => setRuleGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  const deleteRuleGroup = (id: string) => setRuleGroups(prev => prev.filter(g => g.id !== id));

  const createDocument = (type: string, parentId?: string, templateId?: string) => {
    let initialSections: Section[] = [
      {
        id: `sec-${Date.now()}`,
        type: 'text',
        title: 'Introduction',
        content: '',
        status: 'draft'
      }
    ];

    let docRules = '';

    // Apply template if provided
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        docRules = template.rules;
        initialSections = template.initialSections.map((s, idx) => ({
          ...s,
          id: `sec-${Date.now()}-${idx}`,
          status: 'draft'
        }));
      }
    }

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: parentId ? `Derived ${type} from ${documents.find(d => d.id === parentId)?.title}` : 'Untitled Document',
      type,
      parentId,
      childrenIds: [],
      sections: initialSections,
      rules: docRules,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setDocuments(prev => {
      const newDocs = [...prev, newDoc];
      if (parentId) {
        return newDocs.map(d => 
          d.id === parentId 
            ? { ...d, childrenIds: [...d.childrenIds, newDoc.id] } 
            : d
        );
      }
      return newDocs;
    });

    return newDoc.id;
  };

  const updateSection = (docId: string, sectionId: string, updates: Partial<Section>) => {
    setDocuments(prev => {
        // Find the section before update to check changes if needed
        const doc = prev.find(d => d.id === docId);
        const oldSection = doc?.sections.find(s => s.id === sectionId);
        const newContent = updates.content;
        
        // 1. Perform the Update
        const updatedDocs = prev.map(d => {
          if (d.id !== docId) return d;
          return {
            ...d,
            sections: d.sections.map(sec => 
              sec.id === sectionId ? { ...sec, ...updates } : sec
            )
          };
        });

        // 2. Check for Auto-Run Triggers (Simulated cascading)
        // If content changed, find dependent sections in the SAME document
        if (oldSection && newContent && newContent !== oldSection.content) {
            // Find dependent sections in this doc
            const dependents = doc?.sections.filter(s => s.dependencies?.includes(sectionId) && s.executionMode === 'auto');
            
            if (dependents && dependents.length > 0) {
                // In a real app, this would queue an AI job.
                // In mockup, we'll simulate an update after a delay
                // We can't easily update state again inside setState, so we'll use a timeout
                setTimeout(() => {
                    dependents.forEach(dep => {
                        // Trigger a mock update on dependent
                        // We need access to the latest state, so we use the store setter again via a helper or assume context
                        // Since we are inside the store logic, we can't call setDocuments directly easily without loop
                        // But we can dispatch an event or just let the component handle it?
                        // Actually, the Component (SectionBlock) handles simulation.
                        // But 'Auto' mode means it should happen without user interaction.
                        // Let's implement a simple "Chain Reaction" here by modifying state directly for the mockup
                        
                        setDocuments(currentDocs => currentDocs.map(cd => {
                            if (cd.id !== docId) return cd;
                            return {
                                ...cd,
                                sections: cd.sections.map(s => {
                                    if (s.id === dep.id) {
                                        // Simulate AI update
                                        const newHistory = [
                                            { 
                                                content: s.content, 
                                                timestamp: new Date(), 
                                                user: 'AI (Auto-Run)',
                                                causedBy: sectionId
                                            },
                                            ...(s.history || [])
                                        ];
                                        return {
                                            ...s,
                                            status: 'review',
                                            content: s.content + `\n\n[Auto-Updated due to changes in "${oldSection.title || 'Parent'}"]`,
                                            history: newHistory
                                        };
                                    }
                                    return s;
                                })
                            };
                        }));
                    });
                }, 1500);
            }
        }

        return updatedDocs;
    });
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    ));
  };

  const addSection = (docId: string, section: Section) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        sections: [...doc.sections, section]
      };
    }));
  };

  const generateChildDocument = (parentId: string, type: string) => {
    const newId = createDocument(type, parentId);
    // In a real app, this would trigger AI generation based on parent content
    // Here we just navigate to it
    setCurrentDocId(newId);
  };
  
  const getDocument = (id: string) => documents.find(d => d.id === id);
  
  const getObjectType = (typeCode: string) => documentTypes.find(dt => dt.code === typeCode);

  const addDocumentType = (dt: DocumentType) => setDocumentTypes(prev => [...prev, dt]);
  const updateDocumentType = (id: string, updates: Partial<DocumentType>) => {
    setDocumentTypes(prev => prev.map(dt => dt.id === id ? { ...dt, ...updates } : dt));
  };

  const addTemplate = (t: DocumentTemplate) => setTemplates(prev => [...prev, t]);
  const updateTemplate = (id: string, updates: Partial<DocumentTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const duplicateTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;
    
    addTemplate({
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
    });
  };

  const deleteDocument = (id: string) => {
    // Recursive delete helper could be added here to remove children,
    // but for now we'll just remove the document itself and let children become orphans or handle UI-side
    // A better approach for a tree is to delete all descendants.
    
    const getAllDescendantIds = (docId: string, allDocs: Document[]): string[] => {
        const doc = allDocs.find(d => d.id === docId);
        if (!doc) return [];
        let descendants: string[] = [];
        for (const childId of doc.childrenIds) {
            descendants.push(childId);
            descendants = [...descendants, ...getAllDescendantIds(childId, allDocs)];
        }
        return descendants;
    };

    setDocuments(prev => {
        const descendants = getAllDescendantIds(id, prev);
        const idsToDelete = [id, ...descendants];
        
        // Remove from parent's children list
        const docToDelete = prev.find(d => d.id === id);
        let newDocs = prev.filter(d => !idsToDelete.includes(d.id));
        
        if (docToDelete?.parentId) {
            newDocs = newDocs.map(d => 
                d.id === docToDelete.parentId 
                    ? { ...d, childrenIds: d.childrenIds.filter(cid => cid !== id) }
                    : d
            );
        }
        
        return newDocs;
    });

    if (currentDocId === id) setCurrentDocId(null);
  };

  const duplicateDocument = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;

    // Deep copy of the single document (not children for now, to keep it simple)
    const newDoc: Document = {
      ...doc,
      id: `doc-${Date.now()}`,
      title: `${doc.title} (Copy)`,
      childrenIds: [], // Don't copy children references, it's a new branch
      createdAt: new Date(),
      updatedAt: new Date(),
      sections: doc.sections.map((s, idx) => ({
        ...s,
        id: `sec-${Date.now()}-${idx}`, // New IDs for sections
        history: [] // Reset history for copy
      }))
    };

    setDocuments(prev => {
        // If it has a parent, add to parent's children
        let newDocs = [...prev, newDoc];
        if (newDoc.parentId) {
            newDocs = newDocs.map(d => 
                d.id === newDoc.parentId 
                    ? { ...d, childrenIds: [...d.childrenIds, newDoc.id] }
                    : d
            );
        }
        return newDocs;
    });
  };

  const deleteDocumentType = (id: string) => {
      setDocumentTypes(prev => prev.filter(dt => dt.id !== id));
  };

  const value = {
    documents,
    documentTypes,
    templates,
    rules,
    ruleGroups,
    currentDocId,
    currentUser,
    userProfiles,
    isAuthenticated,
    setCurrentDocId,
    setCurrentUser,
    updateUserProfile,
    login,
    logout,
    signup,
    createDocument,
    updateSection,
    updateDocument,
    addSection,
    generateChildDocument,
    getDocument,
    getObjectType,
    projectRules,
    setProjectRules,
    addDocumentType,
    updateDocumentType,
    deleteDocumentType,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    deleteDocument,
    duplicateDocument,
    addRule,
    updateRule,
    deleteRule,
    addRuleGroup,
    updateRuleGroup,
    deleteRuleGroup,
    resolveRules
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) throw new Error('useDocuments must be used within a DocumentProvider');
  return context;
}
