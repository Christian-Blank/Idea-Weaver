import React from 'react';
import { useLocation } from "wouter";
import { useDocuments } from '../lib/store';
import { Button } from './ui/button';
import { 
  Plus, 
  GitBranch, 
  Settings, 
  Menu,
  Home,
  UserCircle,
  LogOut,
  Search
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { cn } from '../lib/utils';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from './ui/command';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { documents, createDocument, setCurrentDocId, currentUser, logout } = useDocuments();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      if (e.key === '/' && !isCommandOpen && (document.activeElement === document.body)) {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isCommandOpen]);

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64 p-4">
      <div 
        className="flex items-center gap-2 mb-8 px-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setLocation('/')}
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <GitBranch size={18} />
        </div>
        <h1 className="font-serif font-bold text-xl tracking-tight">FlowState</h1>
      </div>

      <div className="space-y-1 mb-6">
        <Button 
          variant={location === '/' ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-2 mb-2"
          onClick={() => {
            setLocation('/');
            setIsMobileMenuOpen(false);
          }}
        >
          <Home size={16} />
          Dashboard
        </Button>

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

      <div className="mt-auto pt-4 border-t border-sidebar-border space-y-1">
        <Button 
            variant={location === '/profile' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => setLocation('/profile')}
        >
          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
            {currentUser.avatar || <UserCircle size={16} />}
          </div>
          {currentUser.name}
        </Button>
        <Button 
            variant={location === '/settings' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => setLocation('/settings')}
        >
          <Settings size={16} />
          Settings
        </Button>
        <Button 
            variant="ghost"
            className="w-full justify-start gap-2 text-red-500/80 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
        >
          <LogOut size={16} />
          Sign Out
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
         <div className="flex items-center gap-2" onClick={() => setLocation('/')}>
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <GitBranch size={14} />
            </div>
            <span className="font-serif font-bold">FlowState</span>
         </div>
         <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden xs:flex gap-2 text-xs text-muted-foreground border-dashed"
              onClick={() => setIsCommandOpen(true)}
              data-testid="button-command-palette-mobile"
            >
              <Search size={14} />
              Quick Search
            </Button>
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
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden relative md:pt-0 pt-14">
        {children}
      </main>

      {/* Command Palette */}
      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput placeholder="Type / to see commands or search documents..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Commands">
            <CommandItem
              onSelect={() => {
                setIsCommandOpen(false);
                setLocation('/');
              }}
              data-testid="command-go-dashboard"
            >
              <Home className="mr-2" size={16} />
              <span>/home – Go to dashboard</span>
              <CommandShortcut>H</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setIsCommandOpen(false);
                const id = createDocument('idea');
                setCurrentDocId(id);
                setLocation(`/editor/${id}`);
              }}
              data-testid="command-new-idea"
            >
              <Plus className="mr-2" size={16} />
              <span>/new – New idea</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setIsCommandOpen(false);
                setLocation('/settings');
              }}
              data-testid="command-open-settings"
            >
              <Settings className="mr-2" size={16} />
              <span>/settings – Workspace settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Documents">
            {documents.map((doc) => (
              <CommandItem
                key={doc.id}
                onSelect={() => {
                  setIsCommandOpen(false);
                  setCurrentDocId(doc.id);
                  setLocation(`/editor/${doc.id}`);
                }}
                data-testid={`command-open-doc-${doc.id}`}
              >
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-sm border text-[10px] capitalize">
                  {doc.type}
                </span>
                <span className="truncate max-w-[260px]">{doc.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
