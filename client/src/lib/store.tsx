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
}

export interface Document {
  id: string;
  title: string;
  type: 'idea' | 'spec' | 'flow' | 'custom';
  parentId?: string;
  childrenIds: string[];
  sections: Section[];
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
  {
    id: 'doc-1',
    title: 'New Social App Idea',
    type: 'idea',
    childrenIds: ['doc-2'],
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 'sec-1',
        type: 'text',
        title: 'Core Concept',
        content: 'A social network focused on deep work and flow state sharing. Users broadcast when they are entering "flow" and share their output afterwards.',
        status: 'completed',
      },
      {
        id: 'sec-2',
        type: 'list',
        title: 'Key Features',
        content: '- Live Flow Status\n- Pomodoro Integration\n- "Deep Work" Leaderboards\n- No Distraction Mode',
        status: 'completed',
      }
    ]
  },
  {
    id: 'doc-2',
    title: 'Flow App - Product Spec',
    type: 'spec',
    parentId: 'doc-1',
    childrenIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 'sec-3',
        type: 'text',
        title: 'Overview',
        content: 'Based on the "New Social App Idea", this specification details the MVP features for the flow state sharing application.',
        status: 'draft',
        dependencies: ['doc-1'],
        aiSuggestions: [
          'Alternative: Focus heavily on the "No Distraction Mode" as the USP.',
          'Suggestion: Add a social accountability feature where friends can "nudge" you if you break flow.'
        ]
      },
      {
        id: 'sec-4',
        type: 'text',
        title: 'User Stories',
        content: '',
        status: 'generating', 
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
