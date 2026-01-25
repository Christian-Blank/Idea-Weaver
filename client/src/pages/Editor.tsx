import React, { useState, useRef, useEffect } from 'react';
import { useDocuments, Section } from '../lib/store';
import { useRoute } from 'wouter';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { GraphVisualizer } from '../components/GraphVisualizer';
import { 
  Sparkles, 
  MoreVertical, 
  ArrowRight, 
  CornerDownRight, 
  RefreshCw,
  CheckCircle2,
  Plus,
  PanelRightClose,
  PanelRightOpen,
  GitBranch
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const SectionBlock = ({ 
  docId, 
  section, 
  onUpdate 
}: { 
  docId: string, 
  section: Section, 
  onUpdate: (id: string, updates: Partial<Section>) => void 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [section.content, isEditing]);

  const simulateAI = () => {
    onUpdate(section.id, { status: 'generating' });
    setTimeout(() => {
      onUpdate(section.id, { 
        status: 'review',
        aiSuggestions: [
          'Clarification: Specify the metrics for success here.',
          'Stylistic: Use more active voice in the second paragraph.'
        ]
      });
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative pl-4 md:pl-0"
    >
      {/* Thread Line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border md:-left-8" />
      <div className={cn(
        "absolute left-[-4px] top-6 w-2.5 h-2.5 rounded-full border-2 border-background md:-left-[35px] z-10 transition-colors",
        section.status === 'completed' ? "bg-primary border-primary" : "bg-muted-foreground/30 border-muted"
      )} />

      <div className={cn(
        "rounded-xl border transition-all duration-300 overflow-hidden",
        isEditing ? "border-primary/30 shadow-lg bg-card" : "border-transparent bg-transparent hover:bg-card/50 hover:border-border/50"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <input
            value={section.title}
            onChange={(e) => onUpdate(section.id, { title: e.target.value })}
            className="bg-transparent font-serif font-bold text-lg focus:outline-none placeholder:text-muted-foreground/50 w-full"
            placeholder="Section Title..."
          />
          <div className="flex items-center gap-1">
             {section.status === 'generating' && (
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
               >
                 <RefreshCw size={14} className="text-accent" />
               </motion.div>
             )}
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                   <MoreVertical size={16} />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuItem onClick={simulateAI}>
                   <Sparkles size={14} className="mr-2" />
                   AI Rewrite
                 </DropdownMenuItem>
                 <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <Textarea
            ref={textareaRef}
            value={section.content}
            onChange={(e) => onUpdate(section.id, { content: e.target.value })}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            className={cn(
              "min-h-[100px] resize-none border-0 focus-visible:ring-0 p-0 text-base leading-relaxed bg-transparent",
              !isEditing && "text-muted-foreground"
            )}
            placeholder="Write something amazing..."
          />
        </div>

        {/* AI Suggestions Footer */}
        <AnimatePresence>
          {section.aiSuggestions && section.aiSuggestions.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-accent/5 border-t border-accent/10 p-3"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-accent mb-2 uppercase tracking-wider">
                <Sparkles size={12} />
                AI Feedback
              </div>
              <div className="space-y-2">
                {section.aiSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="bg-background/95 p-3 rounded-lg border border-accent/10 text-sm shadow-sm flex gap-3 backdrop-blur-sm">
                    <div className="flex-1 text-foreground/90">{suggestion}</div>
                    <div className="flex flex-col gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                        onClick={() => {
                          const newSuggestions = section.aiSuggestions?.filter((_, i) => i !== idx);
                          onUpdate(section.id, { aiSuggestions: newSuggestions });
                        }}
                      >
                        <CheckCircle2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function Editor() {
  const [match, params] = useRoute('/editor/:id');
  const { getDocument, updateSection, addSection, generateChildDocument } = useDocuments();
  const [doc, setDoc] = useState<any>(null);
  const [showGraph, setShowGraph] = useState(true);

  // Effect to handle document changes/routing
  useEffect(() => {
    if (params?.id) {
      const found = getDocument(params.id);
      setDoc(found);
    }
  }, [params?.id, getDocument]); 

  // Helpers for navigation
  const parentDoc = doc?.parentId ? getDocument(doc.parentId) : null;
  const childDocs = doc?.childrenIds ? doc.childrenIds.map((id: string) => getDocument(id)).filter(Boolean) : [];

  const navigateTo = (id: string) => {
      // In a real app we might use setLocation from wouter, but since we are inside Layout which has its own router context or we can use window location or passed down navigation
      // Actually we have useDocuments context but wouter's setLocation is needed.
      // Let's grab setLocation from wouter hook at top level
      window.location.hash = `/editor/${id}`; // Hack since we can't easily grab setLocation inside this component without adding the hook call
  };
  // Wait, let's just add the hook
  const [_, setLocation] = useRoute('/editor/:id');
  const navigate = (path: string) => {
      // Wouter useRoute returns match and params, not navigate function. 
      // We need useLocation for navigation
  };

  if (!doc) return <Layout><div className="p-8 text-center text-muted-foreground">Document not found</div></Layout>;

  return (
    <Layout>
      <div className="h-full flex flex-col md:flex-row relative">
        {/* Toggle Graph Button (Mobile/Desktop) */}
        <div className="absolute right-4 top-4 z-20 xl:hidden">
          <Button variant="outline" size="icon" onClick={() => setShowGraph(!showGraph)}>
            {showGraph ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </Button>
        </div>

        {/* Main Editor Area */}
        <ScrollArea className="flex-1 h-full bg-background/50">
          <div className="max-w-3xl mx-auto py-12 px-6 md:px-12 min-h-screen">
            
            {/* Parent Navigation (If exists) */}
            {parentDoc && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <Button 
                        variant="ghost" 
                        className="text-muted-foreground hover:text-foreground pl-0 gap-2 group"
                        onClick={() => window.location.href = `/editor/${parentDoc.id}`} // Simple navigation for now
                    >
                        <div className="p-1 rounded bg-muted group-hover:bg-primary/10 transition-colors">
                            <CornerDownRight size={14} className="rotate-180" />
                        </div>
                        <div className="flex flex-col items-start text-xs">
                            <span className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground/70">Parent Document</span>
                            <span className="font-medium text-sm">{parentDoc.title}</span>
                        </div>
                    </Button>
                </motion.div>
            )}

            {/* Doc Header */}
            <div className="mb-12 group">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                 <span className="uppercase tracking-widest text-[10px] font-semibold border border-border px-2 py-0.5 rounded-full">
                   {doc.type}
                 </span>
              </div>
              
              <h1 
                className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight outline-none border-b border-transparent focus:border-muted transition-colors" 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => {
                   // In a real app we'd update title here
                }}
              >
                {doc.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-light">
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span>{doc.sections.length} sections</span>
              </div>
            </div>

            {/* Sections Flow */}
            <div className="space-y-8 relative border-l border-border/50 md:border-l-0 ml-4 md:ml-0 pb-12">
               {doc.sections.map((section: Section) => (
                 <SectionBlock 
                   key={section.id} 
                   docId={doc.id} 
                   section={section} 
                   onUpdate={(id, updates) => updateSection(doc.id, id, updates)} 
                 />
               ))}

               {/* Add Section Button */}
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="pl-4 md:pl-0 md:ml-[-35px] relative group"
               >
                 <div className="absolute left-[-4px] top-3 w-2.5 h-2.5 rounded-full bg-muted-foreground/20 md:left-0 z-10 transition-colors group-hover:bg-primary/50" />
                 <Button 
                   variant="ghost" 
                   className="text-muted-foreground hover:text-foreground gap-2 pl-8 md:pl-4"
                   onClick={() => addSection(doc.id, {
                     id: `sec-${Date.now()}`,
                     type: 'text',
                     content: '',
                     status: 'draft',
                     title: ''
                   })}
                 >
                   <Plus size={16} />
                   Add Section
                 </Button>
               </motion.div>
            </div>

            {/* Derived Documents (Children) Section */}
            <div className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <GitBranch size={14} />
                        Derived Documents
                    </h3>
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => generateChildDocument(doc.id, 'spec')}>
                        <Plus size={12} /> New Derivative
                    </Button>
                </div>

                {childDocs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {childDocs.map((child: any) => (
                            <div 
                                key={child.id}
                                className="group p-4 rounded-xl border bg-card/50 hover:bg-card hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                                onClick={() => window.location.href = `/editor/${child.id}`}
                            >
                                <div className={cn(
                                    "absolute top-0 left-0 w-1 h-full",
                                    child.type === 'idea' ? 'bg-amber-400' : 
                                    child.type === 'spec' ? 'bg-blue-400' : 'bg-emerald-400'
                                )} />
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase font-semibold text-muted-foreground border px-1.5 py-0.5 rounded">
                                        {child.type}
                                    </span>
                                    <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -rotate-45 group-hover:rotate-0" />
                                </div>
                                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{child.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                    {child.sections[0]?.content || "No content yet..."}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 border-2 border-dashed rounded-xl text-center">
                        <p className="text-sm text-muted-foreground mb-3">No derived documents yet.</p>
                        <Button variant="outline" size="sm" onClick={() => generateChildDocument(doc.id, 'spec')}>
                            Create first derivative
                        </Button>
                    </div>
                )}
            </div>

            {/* Bottom Spacer for Floating Bar */}
            <div className="h-24" />

            {/* Bottom Actions Floating Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 xl:right-[340px] z-30 bg-background/80 backdrop-blur-md border border-border/50 shadow-xl rounded-full p-2 flex gap-2">
               <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => generateChildDocument(doc.id, 'spec')}
                  className="rounded-full px-4"
                >
                 <GitBranch size={16} className="mr-2" />
                 Branch
               </Button>
               <div className="w-px h-6 bg-border my-auto" />
               <Button 
                  size="sm"
                  className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                 <Sparkles size={16} className="mr-2" />
                 Auto-Complete
               </Button>
            </div>
          </div>
        </ScrollArea>

        {/* Right Sidebar - Graph Visualizer */}
        <AnimatePresence>
          {showGraph && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden xl:block h-full border-l border-border bg-sidebar/30 backdrop-blur-sm overflow-hidden"
            >
              <div className="p-6 h-full flex flex-col w-80">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                  <GitBranch size={12} />
                  Context Graph
                </h3>
                
                <ScrollArea className="flex-1 -mx-4 px-4">
                  <GraphVisualizer activeDocId={doc.id} />
                </ScrollArea>

                <div className="mt-auto pt-6 border-t border-border">
                  <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                    <h4 className="text-sm font-semibold text-accent mb-1 flex items-center gap-2">
                      <Sparkles size={12} />
                      Flow Assistant
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      This document is 80% complete. Try branching a "Marketing Plan" from this idea.
                    </p>
                    <Button size="sm" variant="ghost" className="w-full mt-3 text-xs h-8 bg-background/50 hover:bg-background">
                      Generate Plan
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
