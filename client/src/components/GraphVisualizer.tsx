import React from 'react';
import { useDocuments } from '../lib/store';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useLocation } from 'wouter';

export function GraphVisualizer({ 
  activeDocId, 
  rootId,
  className,
  onNodeClick
}: { 
  activeDocId?: string, 
  rootId?: string,
  className?: string,
  onNodeClick?: (docId: string) => void
}) {
  const { documents, getDocument, setCurrentDocId } = useDocuments();
  const [_, setLocation] = useLocation();

  // If rootId is provided, just render that tree.
  // Otherwise, render all root docs (docs with no parent).
  const rootDocs = rootId 
    ? [getDocument(rootId)].filter(Boolean) 
    : documents.filter(d => !d.parentId);

  const handleNodeClick = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNodeClick) {
      onNodeClick(docId);
    } else {
      setCurrentDocId(docId);
      setLocation(`/editor/${docId}`);
    }
  };

  const renderNode = (docId: string, depth: number = 0) => {
    const doc = getDocument(docId);
    if (!doc) return null;

    const isActive = doc.id === activeDocId;
    const hasChildren = doc.childrenIds.length > 0;

    return (
      <div key={doc.id} className="relative">
        <div className={cn(
          "flex items-center gap-2 mb-2 group cursor-pointer transition-opacity",
          isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
        )}
        onClick={(e) => handleNodeClick(doc.id, e)}
        >
          {/* Node Point */}
          <motion.div 
            initial={false}
            animate={{ 
              scale: isActive ? 1.2 : 1,
              backgroundColor: isActive ? 'var(--primary)' : 'var(--muted-foreground)'
            }}
            className={cn(
              "w-3 h-3 rounded-full border-2 border-background shadow-sm z-10 flex-shrink-0",
               doc.type === 'idea' ? 'bg-amber-400' : 
               doc.type === 'spec' ? 'bg-blue-400' : 'bg-emerald-400'
            )}
          />
          
          {/* Label */}
          <div className={cn(
            "text-sm px-2 py-1 rounded transition-colors truncate max-w-[200px]",
            isActive ? "font-medium bg-card shadow-sm border" : "text-muted-foreground hover:bg-muted/50"
          )}>
            {doc.title}
          </div>
        </div>

        {/* Connection Line */}
        {hasChildren && (
           <div className="absolute left-[5px] top-[14px] bottom-0 w-px bg-border group-last:hidden" />
        )}

        {/* Children */}
        {hasChildren && (
          <div className="pl-6 pt-1 relative">
             {/* Curve connector for children */}
             <div className="absolute left-[5px] top-[-10px] bottom-4 w-px bg-border" />
             
             {doc.childrenIds.map(childId => (
               <div key={childId} className="relative">
                 {/* Horizontal connector */}
                 <div className="absolute left-[-19px] top-[10px] w-4 h-px bg-border" />
                 {renderNode(childId, depth + 1)}
               </div>
             ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("p-4", className)}>
      {rootDocs.map(doc => doc && renderNode(doc.id))}
    </div>
  );
}
