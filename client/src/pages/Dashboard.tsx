import React from 'react';
import { useDocuments } from '../lib/store';
import { useLocation } from 'wouter';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Plus, Clock, ArrowRight, Sparkles, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import { GraphVisualizer } from '../components/GraphVisualizer';
import { ScrollArea } from '../components/ui/scroll-area';

export default function Dashboard() {
  const { documents, createDocument, setCurrentDocId } = useDocuments();
  const [_, setLocation] = useLocation();

  const handleCreate = (type: 'idea' | 'spec' | 'flow') => {
    const id = createDocument(type);
    setCurrentDocId(id);
    setLocation(`/editor/${id}`);
  };

  // Filter for root documents (Projects)
  const rootDocuments = documents.filter(doc => !doc.parentId);

  const Legend = () => (
    <div className="flex gap-4 items-center text-xs text-muted-foreground border p-2 rounded-lg bg-card/50 backdrop-blur-sm">
      <span className="font-semibold mr-2">Legend:</span>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
        <span>Idea</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm" />
        <span>Spec</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
        <span>Flow</span>
      </div>
    </div>
  );

  return (
    <Layout>
      <ScrollArea className="h-full">
        <div className="p-6 md:p-12 max-w-7xl mx-auto pb-20">
          
          {/* Welcome Hero */}
          <div className="mb-12 text-center md:text-left">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
              Good Morning.
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Ready to capture your next big idea? Select a template to start your flow.
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { 
                type: 'idea', 
                label: 'New Idea', 
                desc: 'Capture raw thoughts and expand them with AI.', 
                icon: Sparkles,
                color: 'text-amber-500',
                bg: 'bg-amber-500/10'
              },
              { 
                type: 'spec', 
                label: 'Product Spec', 
                desc: 'Structured requirements and user stories.', 
                icon: Clock,
                color: 'text-blue-500',
                bg: 'bg-blue-500/10'
              },
              { 
                type: 'flow', 
                label: 'UX Flow', 
                desc: 'Define user journeys and interaction models.', 
                icon: ArrowRight,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10'
              }
            ].map((template) => (
              <motion.div
                key={template.type}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all border-transparent hover:border-primary/10 group h-full flex flex-col bg-card/50 backdrop-blur-sm"
                  onClick={() => handleCreate(template.type as any)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl ${template.bg} ${template.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <template.icon size={24} />
                    </div>
                    <CardTitle className="font-serif text-xl">{template.label}</CardTitle>
                    <CardDescription>{template.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4">
                    <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Start writing <ArrowRight size={14} className="ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Projects View */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
               <div>
                 <h2 className="text-2xl font-serif font-bold tracking-tight">Your Projects</h2>
                 <p className="text-muted-foreground text-sm mt-1">Overview of your document trees</p>
               </div>
               <Legend />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {rootDocuments.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
                  <p className="text-muted-foreground">No projects yet. Start a new idea above!</p>
                </div>
              ) : (
                rootDocuments.map((rootDoc) => (
                  <motion.div
                    key={rootDoc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-all border-border/60">
                      <div className="p-4 border-b bg-muted/20 flex items-start justify-between">
                        <div>
                          <h3 
                            className="font-serif font-bold text-lg hover:text-primary cursor-pointer transition-colors"
                            onClick={() => {
                              setCurrentDocId(rootDoc.id);
                              setLocation(`/editor/${rootDoc.id}`);
                            }}
                          >
                            {rootDoc.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                             <Clock size={12} />
                             Updated {new Date(rootDoc.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => {
                            setCurrentDocId(rootDoc.id);
                            setLocation(`/editor/${rootDoc.id}`);
                          }}
                        >
                          <ArrowRight size={16} />
                        </Button>
                      </div>
                      
                      <CardContent className="p-0 flex-1 min-h-[200px] bg-background relative group">
                        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
                        <div className="p-4">
                           <GraphVisualizer rootId={rootDoc.id} />
                        </div>
                        
                        {/* Overlay to indicate interactivity or clickability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-end justify-center pb-4">
                          <span className="text-xs font-medium bg-background/80 backdrop-blur px-3 py-1 rounded-full border shadow-sm">
                            Click nodes to edit
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </Layout>
  );
}
