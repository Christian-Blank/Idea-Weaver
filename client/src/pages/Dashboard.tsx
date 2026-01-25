import React from 'react';
import { useDocuments } from '../lib/store';
import { useLocation } from 'wouter';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Plus, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { documents, createDocument, setCurrentDocId } = useDocuments();
  const [_, setLocation] = useLocation();

  const handleCreate = (type: 'idea' | 'spec' | 'flow') => {
    const id = createDocument(type);
    setCurrentDocId(id);
    setLocation(`/editor/${id}`);
  };

  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-5xl mx-auto">
        
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
                className="cursor-pointer hover:shadow-lg transition-all border-transparent hover:border-primary/10 group h-full flex flex-col"
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

        {/* Recent Work */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
             <h2 className="text-xl font-semibold tracking-tight">Recent Documents</h2>
             <Button variant="ghost" size="sm">View All</Button>
          </div>
          
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                onClick={() => {
                  setCurrentDocId(doc.id);
                  setLocation(`/editor/${doc.id}`);
                }}
                className="group flex items-center p-4 rounded-xl border bg-card hover:bg-accent/5 hover:border-accent/20 transition-all cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 
                  ${doc.type === 'idea' ? 'bg-amber-100 text-amber-700' : 
                    doc.type === 'spec' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}
                >
                  {doc.type[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate group-hover:text-primary transition-colors">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground truncate flex items-center gap-2">
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                    {doc.parentId && <span className="text-xs px-1.5 py-0.5 rounded bg-muted">Derived</span>}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                  <ArrowRight size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
