import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Types ---

export type SectionType = 'text' | 'list' | 'prompt' | 'code';

export interface Section {
  id: string;
  type: SectionType;
  title?: string;
  content: string;
  status: 'draft' | 'generating' | 'review' | 'completed';
  aiSuggestions?: string[];
  dependencies?: string[]; // IDs of other sections or docs this depends on
  rules?: string; // Instructions for AI on how to process changes
  executionMode?: 'manual' | 'auto' | 'disabled';
  history?: { content: string; timestamp: Date; }[];
}

export interface DocumentHistoryItem {
  id: string;
  timestamp: Date;
  actor: 'User' | 'AI' | 'System';
  action: string;
  description?: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'idea' | 'spec' | 'flow' | 'custom';
  parentId?: string;
  childrenIds: string[];
  sections: Section[];
  history?: DocumentHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentContextType {
  documents: Document[];
  currentDocId: string | null;
  setCurrentDocId: (id: string | null) => void;
  createDocument: (type: Document['type'], parentId?: string) => string;
  updateSection: (docId: string, sectionId: string, updates: Partial<Section>) => void;
  addSection: (docId: string, section: Section) => void;
  generateChildDocument: (parentId: string, type: Document['type']) => void;
  getDocument: (id: string) => Document | undefined;
}

// --- Mock Data ---

const INITIAL_DOCS: Document[] = [
  // 1. Idea Document (North Star)
  {
    id: 'idea-1',
    title: 'FlowState - The AI Creative Suite',
    type: 'idea',
    childrenIds: ['spec-1'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
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
            timestamp: new Date('2024-01-03T09:00:00')
          },
          {
            content: 'The MVP will focus on the core document editor and visualization.',
            timestamp: new Date('2024-01-03T14:30:00')
          }
        ]
      },
      {
        id: 'sec-4',
        type: 'text',
        title: 'Target Audience',
        content: 'Product Managers, Founders, and Design Engineers who value speed and structure.',
        status: 'completed',
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
            timestamp: new Date('2024-01-06T10:00:00')
          },
          {
            content: 'Simple email/password login + Google Auth.',
            timestamp: new Date('2024-01-06T11:30:00')
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
            timestamp: new Date('2024-01-07T10:15:00')
          },
          {
            content: 'The dashboard should be a spatial view, not a list.',
            timestamp: new Date('2024-01-07T11:45:00')
          },
          {
            content: 'The dashboard is not a list, but a spatial view of all projects.',
            timestamp: new Date('2024-01-08T09:30:00')
          }
        ]
      },
      {
        id: 'sec-7',
        type: 'list',
        title: 'Interactions',
        content: '- Pan and Zoom\n- Click to Enter Document\n- Drag to Reorganize Trees',
        status: 'completed',
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
            timestamp: new Date('2024-01-09T13:00:00')
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
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

  const createDocument = (type: Document['type'], parentId?: string) => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: parentId ? `Derived ${type} from ${documents.find(d => d.id === parentId)?.title}` : 'Untitled Document',
      type,
      parentId,
      childrenIds: [],
      sections: [
        {
          id: `sec-${Date.now()}`,
          type: 'text',
          title: 'Introduction',
          content: '',
          status: 'draft'
        }
      ],
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
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        sections: doc.sections.map(sec => 
          sec.id === sectionId ? { ...sec, ...updates } : sec
        )
      };
    }));
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

  const generateChildDocument = (parentId: string, type: Document['type']) => {
    const newId = createDocument(type, parentId);
    // In a real app, this would trigger AI generation based on parent content
    // Here we just navigate to it
    setCurrentDocId(newId);
  };
  
  const getDocument = (id: string) => documents.find(d => d.id === id);

  return (
    <DocumentContext.Provider value={{
      documents,
      currentDocId,
      setCurrentDocId,
      createDocument,
      updateSection,
      addSection,
      generateChildDocument,
      getDocument
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) throw new Error('useDocuments must be used within a DocumentProvider');
  return context;
}
