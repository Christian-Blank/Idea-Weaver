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
  GitBranch,
  Settings2,
  Play,
  History,
  AlertCircle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
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
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Default values if not present
  const executionMode = section.executionMode || 'disabled';
  const rules = section.rules || '';
  const history = section.history || [];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [section.content, previewContent, isEditing]);

  const simulateAI = () => {
    onUpdate(section.id, { status: 'generating' });
    
    // Simulate processing based on rules
    setTimeout(() => {
      let suggestions = [
        'Clarification: Specify the metrics for success here.',
        'Stylistic: Use more active voice in the second paragraph.'
      ];
      
      if (rules.toLowerCase().includes('concise')) {
        suggestions.push('Rule Check: Text could be 20% shorter to meet "Concise" rule.');
      }
      
      onUpdate(section.id, { 
        status: 'review',
        aiSuggestions: suggestions
      });
    }, 2000);
  };

  const handleModeChange = (mode: 'manual' | 'auto' | 'disabled') => {
    onUpdate(section.id, { executionMode: mode });
  };

  const handlePreview = (version: { content: string, timestamp: Date }) => {
    setPreviewContent(version.content);
  };

  const applyRestoration = () => {
    if (!previewContent) return;

    // Push current state to history before restoring
    const newHistory = [
      { content: section.content, timestamp: new Date() },
      ...(section.history || [])
    ];
    
    onUpdate(section.id, { 
      content: previewContent,
      history: newHistory
    });
    setPreviewContent(null);
    setShowHistory(false);
  };

  const cancelPreview = () => {
    setPreviewContent(null);
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
             {/* Rules Toggle */}
             <Tooltip>
               <TooltipTrigger asChild>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className={cn("h-8 w-8 transition-colors", showRules ? "text-primary bg-accent/10" : "text-muted-foreground hover:text-foreground")}
                   onClick={() => { setShowRules(!showRules); setShowHistory(false); }}
                 >
                   <Settings2 size={16} />
                 </Button>
               </TooltipTrigger>
               <TooltipContent>AI Rules & Settings</TooltipContent>
             </Tooltip>

             {/* History Toggle */}
             <Tooltip>
               <TooltipTrigger asChild>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className={cn("h-8 w-8 transition-colors", showHistory ? "text-primary bg-accent/10" : "text-muted-foreground hover:text-foreground")}
                   onClick={() => { setShowHistory(!showHistory); setShowRules(false); setPreviewContent(null); }}
                 >
                   <History size={16} />
                 </Button>
               </TooltipTrigger>
               <TooltipContent>Version History</TooltipContent>
             </Tooltip>

             {/* Status Indicator / AI Spinner */}
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

        {/* Rules Panel */}
        <AnimatePresence>
          {showRules && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4 overflow-hidden"
            >
              <div className="bg-muted/30 rounded-lg p-3 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    AI Instructions
                  </div>
                  
                  {/* Execution Mode Selector */}
                  <div className="flex items-center bg-background rounded-md border p-0.5 shadow-sm">
                    <Tooltip>
                       <TooltipTrigger asChild>
                         <button 
                           onClick={() => handleModeChange('disabled')}
                           className={cn(
                             "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                             executionMode === 'disabled' ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                           )}
                         >
                           Manual
                         </button>
                       </TooltipTrigger>
                       <TooltipContent>Only run when I click</TooltipContent>
                    </Tooltip>
                    
                    <div className="w-px h-3 bg-border mx-0.5" />
                    
                    <Tooltip>
                       <TooltipTrigger asChild>
                         <button 
                           onClick={() => handleModeChange('manual')}
                           className={cn(
                             "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                             executionMode === 'manual' ? "bg-amber-100 text-amber-700" : "text-muted-foreground hover:text-foreground"
                           )}
                         >
                           Assisted
                         </button>
                       </TooltipTrigger>
                       <TooltipContent>Suggest changes on request</TooltipContent>
                    </Tooltip>

                    <div className="w-px h-3 bg-border mx-0.5" />

                    <Tooltip>
                       <TooltipTrigger asChild>
                         <button 
                           onClick={() => handleModeChange('auto')}
                           className={cn(
                             "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                             executionMode === 'auto' ? "bg-emerald-100 text-emerald-700" : "text-muted-foreground hover:text-foreground"
                           )}
                         >
                           Auto-Run
                         </button>
                       </TooltipTrigger>
                       <TooltipContent>Run automatically on changes</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div className="relative">
                  <Textarea
                    value={rules}
                    onChange={(e) => onUpdate(section.id, { rules: e.target.value })}
                    className="min-h-[60px] text-xs bg-background resize-none"
                    placeholder="e.g. Keep it concise, prioritize accessibility, use technical jargon..."
                  />
                  {/* Action Buttons */}
                  <div className="absolute bottom-2 right-2 flex gap-1">
                     {executionMode !== 'disabled' && (
                       <Button 
                         size="sm" 
                         variant="default" 
                         className="h-6 px-2 text-[10px]"
                         onClick={simulateAI}
                       >
                         <Play size={10} className="mr-1" /> Run Now
                       </Button>
                     )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4 overflow-hidden"
            >
              <div className="bg-muted/30 rounded-lg p-3 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Version History
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {history.length} versions
                  </div>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic py-2 text-center">
                      No previous versions yet.
                    </div>
                  ) : (
                    history.map((item, idx) => (
                      <div key={idx} className="bg-background rounded-md border p-2 text-xs flex flex-col gap-2 group hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                          <span>{new Date(item.timestamp).toLocaleTimeString()} · {new Date(item.timestamp).toLocaleDateString()}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className={cn(
                              "h-5 px-2 text-[10px] transition-all",
                              previewContent === item.content 
                                ? "bg-primary/20 text-primary hover:bg-primary/30 opacity-100" 
                                : "hover:bg-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100"
                            )}
                            onClick={() => handlePreview(item)}
                          >
                            {previewContent === item.content ? 'Previewing' : 'Preview'}
                          </Button>
                        </div>
                        <div className="line-clamp-2 text-muted-foreground/80 font-serif">
                          {item.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="px-4 pb-4">
          <Textarea
            ref={textareaRef}
            value={previewContent !== null ? previewContent : section.content}
            onChange={(e) => !previewContent && onUpdate(section.id, { content: e.target.value })}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            readOnly={previewContent !== null}
            className={cn(
              "min-h-[100px] resize-none border-0 focus-visible:ring-0 p-0 text-base leading-relaxed bg-transparent transition-opacity",
              !isEditing && "text-muted-foreground",
              previewContent !== null && "opacity-70"
            )}
            placeholder="Write something amazing..."
          />
        </div>

        {/* Preview Banner */}
        <AnimatePresence>
          {previewContent !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 right-4 bg-primary text-primary-foreground p-3 rounded-lg shadow-lg z-20 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <History size={16} />
                <span>Previewing historical version</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={cancelPreview} className="h-7 text-xs">
                  Cancel
                </Button>
                <Button size="sm" variant="default" onClick={applyRestoration} className="h-7 text-xs border border-primary-foreground/20 hover:bg-primary-foreground/10">
                  Apply Restore
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

  // Calculate breadcrumbs
  const breadcrumbs = [];
  let current = doc;
  // Safety break counter to prevent infinite loops in cyclic data
  let safety = 0;
  while (current && safety < 100) {
    breadcrumbs.unshift(current);
    if (current.parentId) {
      current = getDocument(current.parentId);
    } else {
      current = null;
    }
    safety++;
  }

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
            
            {/* Breadcrumbs Navigation */}
            <div className="mb-8 flex items-center flex-wrap gap-2 text-sm text-muted-foreground/80 font-medium">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="h-6 px-2 text-muted-foreground hover:text-primary"
                 onClick={() => window.location.href = '/'}
               >
                 All Projects
               </Button>
               <span className="opacity-30">/</span>
               
               {breadcrumbs.map((crumb: any, index) => (
                 <React.Fragment key={crumb.id}>
                   <Button
                     variant="ghost"
                     size="sm"
                     className={cn(
                       "h-6 px-2 max-w-[150px] truncate",
                       index === breadcrumbs.length - 1 
                         ? "text-foreground font-semibold pointer-events-none" 
                         : "text-muted-foreground hover:text-primary"
                     )}
                     onClick={() => window.location.href = `/editor/${crumb.id}`}
                   >
                     {crumb.title}
                   </Button>
                   {index < breadcrumbs.length - 1 && (
                     <span className="opacity-30">/</span>
                   )}
                 </React.Fragment>
               ))}
            </div>

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
