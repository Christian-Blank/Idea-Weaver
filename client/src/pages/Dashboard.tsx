import React from 'react';
import { useLocation } from "wouter";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  GitBranch, 
  FileText, 
  Lightbulb, 
  ChevronRight,
  Settings,
  LayoutTemplate
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useDocuments, DocumentTemplate } from '../lib/store';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const { documents, createDocument, templates, documentTypes } = useDocuments();

  const handleCreate = (template: DocumentTemplate) => {
    // We pass the document type ID from the template, but in a real app createDocument 
    // would look up the type code. For now we just pass the type code directly if we can find it
    const typeObj = documentTypes.find(dt => dt.id === template.typeId);
    if (!typeObj) return;

    const newId = createDocument(typeObj.code, undefined, template.id);
    setLocation(`/editor/${newId}`);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-slate-900 font-sans selection:bg-blue-100/50">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight mb-2">
              FlowState
            </h1>
            <p className="text-slate-500 font-medium">
              Where ideas become structured reality.
            </p>
          </div>
          <div className="flex gap-3">
             <Button 
              variant="outline" 
              className="gap-2 bg-white/50"
              onClick={() => setLocation('/settings')}
            >
              <Settings size={18} />
              Workspace Settings
            </Button>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search documents..." 
                className="pl-10 pr-4 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 w-64 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Quick Actions / Templates */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
               Start from Template
             </h2>
             <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700" onClick={() => setLocation('/settings')}>
               Manage Templates <ChevronRight size={12} className="ml-1" />
             </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.slice(0, 3).map((template) => {
               const type = documentTypes.find(dt => dt.id === template.typeId);
               return (
                <button 
                  key={template.id}
                  onClick={() => handleCreate(template)}
                  className="group relative flex flex-col items-start p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left"
                >
                  <div className={`p-3 rounded-lg ${type?.color.replace('text-', 'bg-').replace('border-', '') || 'bg-slate-100'} bg-opacity-20 mb-4 group-hover:scale-110 transition-transform`}>
                    <div className={type?.color.split(' ')[1] || 'text-slate-600'}>
                      <LayoutTemplate size={24} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="mt-auto flex items-center text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Create Document <ChevronRight size={12} className="ml-1" />
                  </div>
                </button>
               );
            })}
          </div>
        </section>

        {/* Recent Documents */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Recent Documents
            </h2>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
              <Filter size={16} className="mr-2" /> Filter
            </Button>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => {
              const type = documentTypes.find(dt => dt.code === doc.type);
              
              return (
                <div 
                  key={doc.id}
                  onClick={() => setLocation(`/editor/${doc.id}`)}
                  className="group flex items-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${type?.color || 'bg-slate-100 text-slate-500'}`}>
                    {type?.icon === 'Lightbulb' && <Lightbulb size={20} />}
                    {type?.icon === 'FileText' && <FileText size={20} />}
                    {type?.icon === 'GitBranch' && <GitBranch size={20} />}
                    {!type && <FileText size={20} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {doc.title}
                    </h3>
                    <div className="flex items-center text-xs text-slate-500 mt-1">
                      <span className="flex items-center font-medium">
                        {type?.name || doc.type}
                      </span>
                      <span className="mx-2 text-slate-300">•</span>
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        Edited {formatDistanceToNow(doc.updatedAt)} ago
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex -space-x-2 mr-4">
                      <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-700">AI</div>
                      <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">You</div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
