import React from 'react';
import { useLocation } from "wouter";
import { useDocuments } from '../lib/store';
import { Button } from './ui/button';
import { 
  Book, 
  Plus, 
  GitBranch, 
  Settings, 
  FileText, 
  ChevronRight,
  Menu
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { cn } from '../lib/utils';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { documents, createDocument, setCurrentDocId } = useDocuments();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64 p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <GitBranch size={18} />
        </div>
        <h1 className="font-serif font-bold text-xl tracking-tight">FlowState</h1>
      </div>

      <div className="space-y-1 mb-6">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 border-dashed border-primary/20 hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all"
          onClick={() => {
            const id = createDocument('idea');
            setCurrentDocId(id);
            setLocation(`/editor/${id}`);
            setIsMobileMenuOpen(false);
          }}
        >
          <Plus size={16} />
          New Idea
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-6">
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">Your Flow</h2>
          <div className="space-y-1">
            {documents.map(doc => (
              <Button
                key={doc.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 h-auto py-2 px-2 font-normal text-left",
                  location === `/editor/${doc.id}` && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                )}
                onClick={() => {
                  setCurrentDocId(doc.id);
                  setLocation(`/editor/${doc.id}`);
                  setIsMobileMenuOpen(false);
                }}
              >
                <div className={cn(
                  "w-1 h-full min-h-[1.5rem] rounded-full mr-1", 
                  doc.type === 'idea' ? 'bg-amber-400' : 
                  doc.type === 'spec' ? 'bg-blue-400' : 
                  'bg-emerald-400'
                )} />
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <span className="truncate text-sm">{doc.title}</span>
                  <span className="text-[10px] text-muted-foreground capitalize flex items-center gap-1">
                    {doc.parentId && <GitBranch size={8} className="inline" />}
                    {doc.type}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
          <Settings size={16} />
          Settings
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        <NavContent />
      </div>

      {/* Mobile Header & Sheet */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-md border-b z-50 flex items-center px-4 justify-between">
         <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <GitBranch size={14} />
            </div>
            <span className="font-serif font-bold">FlowState</span>
         </div>
         <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
           <SheetTrigger asChild>
             <Button variant="ghost" size="icon">
               <Menu size={20} />
             </Button>
           </SheetTrigger>
           <SheetContent side="left" className="p-0 w-64 border-r-0">
             <NavContent />
           </SheetContent>
         </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden relative md:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
}
