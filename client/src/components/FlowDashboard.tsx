import React, { useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  Handle, 
  Position,
  Node,
  Edge,
  ConnectionLineType,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDocuments } from '../lib/store';
import { 
  Lightbulb, 
  FileText, 
  GitBranch, 
  MoreVertical, 
  Clock, 
  Copy, 
  Trash2, 
  ChevronRight 
} from 'lucide-react';
import { Button } from './ui/button';
import { useLocation } from 'wouter';
import dagre from 'dagre';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

// Custom Node Component
const CustomNode = ({ data }: { data: any }) => {
  const { 
    title, 
    type, 
    updatedAt, 
    onDelete, 
    onDuplicate, 
    onNavigate,
    docId
  } = data;

  const getIcon = () => {
    switch (type) {
      case 'idea': return <Lightbulb size={16} />;
      case 'spec': return <FileText size={16} />;
      case 'flow': return <GitBranch size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'idea': return 'bg-amber-100 border-amber-200 text-amber-800';
      case 'spec': return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'flow': return 'bg-emerald-100 border-emerald-200 text-emerald-800';
      default: return 'bg-slate-100 border-slate-200 text-slate-800';
    }
  };

  return (
    <div 
        className={`w-64 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow group overflow-hidden ${
            data.isRoot ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
        onClick={() => onNavigate(docId)}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-300" />
      
      <div className={`p-3 flex items-center justify-between border-b ${getColor()} bg-opacity-30`}>
        <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md bg-white/60 shadow-sm`}>
                {getIcon()}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">{type}</span>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-black/5" onClick={(e) => e.stopPropagation()}>
                <MoreVertical size={14} />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(docId); }}>
                    <Copy size={14} className="mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(docId); }} className="text-red-600">
                    <Trash2 size={14} className="mr-2" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 leading-tight">
            {title}
        </h3>
        <div className="flex items-center text-xs text-slate-500 mt-3">
            <Clock size={12} className="mr-1" />
            {formatDistanceToNow(updatedAt)} ago
        </div>
      </div>

      <div className="bg-slate-50 p-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs font-medium text-primary flex items-center">
              Open <ChevronRight size={12} className="ml-1" />
          </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-slate-300" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Layout Helper
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 280;
  const nodeHeight = 160;

  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function FlowDashboard() {
  const { documents, deleteDocument, duplicateDocument } = useDocuments();
  const [, setLocation] = useLocation();

  // Transform documents to nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    documents.forEach((doc) => {
        nodes.push({
            id: doc.id,
            type: 'custom',
            data: { 
                title: doc.title,
                type: doc.type,
                updatedAt: doc.updatedAt,
                docId: doc.id,
                isRoot: !doc.parentId,
                onDelete: (id: string) => {
                    if (confirm('Delete this document and its children?')) {
                        deleteDocument(id);
                    }
                },
                onDuplicate: (id: string) => duplicateDocument(id),
                onNavigate: (id: string) => setLocation(`/editor/${id}`)
            },
            position: { x: 0, y: 0 } // Layout will set this
        });

        if (doc.parentId) {
            edges.push({
                id: `e-${doc.parentId}-${doc.id}`,
                source: doc.parentId,
                target: doc.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#94a3b8', strokeWidth: 2 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#94a3b8',
                },
            });
        }
    });

    return getLayoutedElements(nodes, edges);
  }, [documents, deleteDocument, duplicateDocument, setLocation]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update layout when documents change
  React.useEffect(() => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-[600px] bg-slate-50 border rounded-xl overflow-hidden shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background color="#cbd5e1" gap={20} size={1} />
        <Controls />
        <MiniMap 
            nodeColor={(n) => {
                if (n.data.type === 'idea') return '#fcd34d';
                if (n.data.type === 'spec') return '#60a5fa';
                return '#34d399';
            }} 
        />
      </ReactFlow>
    </div>
  );
}