import React, { useState } from 'react';
import { useLocation } from "wouter";
import { useDocuments, DocumentType, DocumentTemplate, Rule, RuleGroup } from '../lib/store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  Settings2, 
  ArrowLeft, 
  Globe, 
  FileText, 
  GitBranch, 
  Plus, 
  Trash2, 
  Save, 
  Lightbulb, 
  Palette,
  LayoutTemplate,
  Copy,
  Library,
  Check,
  X,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Settings() {
  const [location, setLocation] = useLocation();
  const { 
    projectRules, 
    setProjectRules, 
    documentTypes, 
    addDocumentType, 
    updateDocumentType,
    deleteDocumentType,
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    rules,
    ruleGroups,
    addRule,
    updateRule,
    deleteRule,
    addRuleGroup,
    updateRuleGroup,
    deleteRuleGroup
  } = useDocuments();

  const [activeTab, setActiveTab] = useState<'general' | 'types' | 'templates' | 'library'>('general');
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // Form states
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCode, setNewTypeCode] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('bg-slate-100 text-slate-800 border-slate-200');
  const [newTypeRules, setNewTypeRules] = useState('');
  
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateTypeId, setNewTemplateTypeId] = useState('');
  const [newTemplateRules, setNewTemplateRules] = useState('');

  // Rules Form State
  const [ruleForm, setRuleForm] = useState<Partial<Rule>>({ category: 'Style' });
  const [groupForm, setGroupForm] = useState<Partial<RuleGroup>>({ ruleIds: [] });

  const handleAddType = () => {
    if (!newTypeName || !newTypeCode) return;
    addDocumentType({
      id: `dt-${Date.now()}`,
      name: newTypeName,
      code: newTypeCode.toLowerCase().replace(/\s+/g, '-'),
      color: newTypeColor,
      description: 'Custom document type',
      defaultRules: newTypeRules,
      icon: 'FileText'
    });
    setNewTypeName('');
    setNewTypeCode('');
    setNewTypeRules('');
    setEditingTypeId(null);
  };

  const handleAddTemplate = () => {
    if (!newTemplateName || !newTemplateTypeId) return;
    addTemplate({
      id: `tpl-${Date.now()}`,
      name: newTemplateName,
      description: newTemplateDesc,
      typeId: newTemplateTypeId,
      rules: newTemplateRules,
      initialSections: [
        { type: 'text', title: 'Overview', content: '' }
      ]
    });
    setNewTemplateName('');
    setNewTemplateDesc('');
    setNewTemplateTypeId('');
    setNewTemplateRules('');
    setEditingTemplateId(null);
  };

  const handleSaveRule = () => {
    if (!ruleForm.name || !ruleForm.instruction) return;
    
    if (editingRuleId === 'new') {
        addRule({
            id: `r-${Date.now()}`,
            name: ruleForm.name,
            instruction: ruleForm.instruction,
            category: ruleForm.category as any || 'Custom'
        });
    } else if (editingRuleId) {
        updateRule(editingRuleId, ruleForm);
    }
    setEditingRuleId(null);
    setRuleForm({ category: 'Style' });
  };

  const handleSaveGroup = () => {
    if (!groupForm.name) return;

    if (editingGroupId === 'new') {
        addRuleGroup({
            id: `rg-${Date.now()}`,
            name: groupForm.name,
            description: groupForm.description,
            ruleIds: groupForm.ruleIds || []
        });
    } else if (editingGroupId) {
        updateRuleGroup(editingGroupId, groupForm);
    }
    setEditingGroupId(null);
    setGroupForm({ ruleIds: [] });
  };

  const toggleRuleInGroup = (ruleId: string) => {
    const currentIds = groupForm.ruleIds || [];
    if (currentIds.includes(ruleId)) {
        setGroupForm({ ...groupForm, ruleIds: currentIds.filter(id => id !== ruleId) });
    } else {
        setGroupForm({ ...groupForm, ruleIds: [...currentIds, ruleId] });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-slate-900 font-sans selection:bg-blue-100/50">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation('/')}
              className="rounded-full hover:bg-slate-200/50"
            >
              <ArrowLeft size={20} className="text-slate-500" />
            </Button>
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Workspace Settings
              </h1>
              <p className="text-slate-500 mt-1">
                Configure global rules, document types, and templates
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-full md:w-64 flex-shrink-0 space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === 'general' 
                  ? 'bg-white shadow-sm ring-1 ring-slate-200 font-medium text-blue-600' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Globe size={18} />
              Global Rules
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === 'library' 
                  ? 'bg-white shadow-sm ring-1 ring-slate-200 font-medium text-blue-600' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Library size={18} />
              Rules Library
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === 'types' 
                  ? 'bg-white shadow-sm ring-1 ring-slate-200 font-medium text-blue-600' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Palette size={18} />
              Document Types
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === 'templates' 
                  ? 'bg-white shadow-sm ring-1 ring-slate-200 font-medium text-blue-600' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutTemplate size={18} />
              Templates
            </button>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'general' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Globe size={18} className="text-blue-500" />
                      Project-Wide AI Rules
                    </h2>
                    <p className="text-sm text-slate-500 mb-4">
                      These instructions are applied to every AI interaction across all documents in this workspace. 
                      Use this for brand voice, tone guidelines, and critical constraints.
                    </p>
                    <Textarea 
                      value={projectRules}
                      onChange={(e) => setProjectRules(e.target.value)}
                      className="min-h-[200px] font-mono text-sm bg-slate-50/50"
                      placeholder="e.g. Always be professional..."
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'library' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {/* Rule Groups Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Library size={18} className="text-indigo-500" />
                                    Rule Themes (Groups)
                                </h2>
                                <p className="text-sm text-slate-500">Combine rules into reusable themes for different contexts</p>
                            </div>
                            <Button onClick={() => { setEditingGroupId('new'); setGroupForm({ ruleIds: [] }); }} size="sm" className="gap-2">
                                <Plus size={16} /> New Theme
                            </Button>
                        </div>

                        {editingGroupId && (
                            <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
                                <h3 className="font-medium mb-4 text-indigo-900">
                                    {editingGroupId === 'new' ? 'New Theme' : 'Edit Theme'}
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Theme Name</label>
                                            <Input 
                                                value={groupForm.name || ''} 
                                                onChange={e => setGroupForm({...groupForm, name: e.target.value})}
                                                placeholder="e.g. Engineering Standard"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Description</label>
                                            <Input 
                                                value={groupForm.description || ''} 
                                                onChange={e => setGroupForm({...groupForm, description: e.target.value})}
                                                placeholder="Brief description..."
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs font-semibold uppercase text-slate-500 mb-2 block">Included Rules</label>
                                        <div className="bg-white rounded-lg border border-slate-200 p-3 max-h-[200px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {rules.map(rule => (
                                                <div 
                                                    key={rule.id} 
                                                    onClick={() => toggleRuleInGroup(rule.id)}
                                                    className={`cursor-pointer p-2 rounded border flex items-center justify-between transition-all ${
                                                        groupForm.ruleIds?.includes(rule.id)
                                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                            : 'hover:bg-slate-50 border-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Tag size={12} />
                                                        <span className="text-sm font-medium">{rule.name}</span>
                                                    </div>
                                                    {groupForm.ruleIds?.includes(rule.id) && <Check size={14} />}
                                                </div>
                                            ))}
                                            {rules.length === 0 && <div className="text-sm text-slate-400 p-2">No rules created yet.</div>}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button variant="ghost" onClick={() => setEditingGroupId(null)}>Cancel</Button>
                                        <Button onClick={handleSaveGroup}>Save Theme</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ruleGroups.map(group => (
                                <div key={group.id} className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition-colors shadow-sm relative">
                                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-indigo-600"
                                            onClick={() => { setEditingGroupId(group.id); setGroupForm(group); }}
                                        >
                                            <Settings2 size={14} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-600"
                                            onClick={() => confirm('Delete this theme?') && deleteRuleGroup(group.id)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                    <h3 className="font-semibold text-slate-900">{group.name}</h3>
                                    <p className="text-xs text-slate-500 mb-3">{group.description || 'No description'}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {group.ruleIds.map(rid => {
                                            const r = rules.find(rule => rule.id === rid);
                                            if (!r) return null;
                                            return (
                                                <span key={rid} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                    {r.name}
                                                </span>
                                            );
                                        })}
                                        {group.ruleIds.length === 0 && <span className="text-[10px] text-slate-400 italic">No rules linked</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-slate-200" />

                    {/* Individual Rules Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Tag size={18} className="text-slate-500" />
                                    Individual Rules
                                </h2>
                                <p className="text-sm text-slate-500">Atomic instructions that can be used in themes or directly</p>
                            </div>
                            <Button onClick={() => { setEditingRuleId('new'); setRuleForm({ category: 'Style' }); }} size="sm" variant="outline" className="gap-2">
                                <Plus size={16} /> New Rule
                            </Button>
                        </div>

                        {editingRuleId && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
                                <h3 className="font-medium mb-4 text-slate-900">
                                    {editingRuleId === 'new' ? 'New Rule' : 'Edit Rule'}
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Rule Name</label>
                                            <Input 
                                                value={ruleForm.name || ''} 
                                                onChange={e => setRuleForm({...ruleForm, name: e.target.value})}
                                                placeholder="e.g. Active Voice"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Category</label>
                                            <select 
                                                value={ruleForm.category}
                                                onChange={e => setRuleForm({...ruleForm, category: e.target.value as any})}
                                                className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            >
                                                <option value="Style">Style</option>
                                                <option value="Format">Format</option>
                                                <option value="Tone">Tone</option>
                                                <option value="Safety">Safety</option>
                                                <option value="Custom">Custom</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Instruction Prompt</label>
                                        <Textarea 
                                            value={ruleForm.instruction || ''} 
                                            onChange={e => setRuleForm({...ruleForm, instruction: e.target.value})}
                                            placeholder="The actual instruction passed to the AI..."
                                            className="bg-white min-h-[80px]"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button variant="ghost" onClick={() => setEditingRuleId(null)}>Cancel</Button>
                                        <Button onClick={handleSaveRule}>Save Rule</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {rules.map(rule => (
                                <div key={rule.id} className="group bg-white rounded-lg border border-slate-200 p-3 hover:border-slate-300 transition-colors shadow-sm flex flex-col justify-between">
                                    <div className="mb-2">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500">
                                                {rule.category}
                                            </span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingRuleId(rule.id); setRuleForm(rule); }} className="text-slate-400 hover:text-blue-600">
                                                    <Settings2 size={12} />
                                                </button>
                                                <button onClick={() => confirm('Delete rule?') && deleteRule(rule.id)} className="text-slate-400 hover:text-red-600">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="font-medium text-slate-900 text-sm">{rule.name}</h4>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                                        "{rule.instruction}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                  </motion.div>
              )}

              {activeTab === 'types' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">Defined Types</h2>
                    <Button onClick={() => setEditingTypeId('new')} size="sm" className="gap-2">
                      <Plus size={16} /> Add Type
                    </Button>
                  </div>

                  {editingTypeId === 'new' && (
                    <div className="bg-slate-50 border border-blue-200 rounded-xl p-6 mb-6 animate-in fade-in slide-in-from-top-4">
                       <h3 className="font-medium mb-4 text-blue-800">New Document Type</h3>
                       <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Name</label>
                             <Input 
                               value={newTypeName} 
                               onChange={(e) => setNewTypeName(e.target.value)} 
                               placeholder="e.g. Technical Memo" 
                               className="bg-white"
                             />
                           </div>
                           <div>
                             <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Code</label>
                             <Input 
                               value={newTypeCode} 
                               onChange={(e) => setNewTypeCode(e.target.value)} 
                               placeholder="e.g. tech-memo" 
                               className="bg-white"
                             />
                           </div>
                         </div>
                         <div>
                            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Behavioral Rules (Default)</label>
                            <Textarea 
                              value={newTypeRules}
                              onChange={(e) => setNewTypeRules(e.target.value)}
                              placeholder="Default AI behavior for this document type..."
                              className="bg-white"
                            />
                         </div>
                         <div className="flex justify-end gap-2 mt-4">
                           <Button variant="ghost" onClick={() => setEditingTypeId(null)}>Cancel</Button>
                           <Button onClick={handleAddType}>Create Type</Button>
                         </div>
                       </div>
                    </div>
                  )}

                  <div className="grid gap-4">
                    {documentTypes.map(type => (
                      <div key={type.id} className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 transition-colors shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.color}`}>
                              <FileText size={20} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{type.name}</h3>
                              <p className="text-xs text-slate-500 font-mono">{type.code}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                                if (confirm('Delete this document type?')) {
                                    deleteDocumentType(type.id);
                                }
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        {type.defaultRules && (
                          <div className="mt-4 bg-slate-50 rounded-lg p-3 text-sm text-slate-600 border border-slate-100">
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Default Behavior</div>
                            {type.defaultRules}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'templates' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">Templates</h2>
                    <Button onClick={() => setEditingTemplateId('new')} size="sm" className="gap-2">
                      <Plus size={16} /> Add Template
                    </Button>
                  </div>

                  {editingTemplateId === 'new' && (
                    <div className="bg-slate-50 border border-blue-200 rounded-xl p-6 mb-6 animate-in fade-in slide-in-from-top-4">
                       <h3 className="font-medium mb-4 text-blue-800">New Template</h3>
                       <div className="space-y-4">
                         <div>
                           <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Template Name</label>
                           <Input 
                             value={newTemplateName} 
                             onChange={(e) => setNewTemplateName(e.target.value)} 
                             placeholder="e.g. YC Pitch Deck" 
                             className="bg-white"
                           />
                         </div>
                         <div>
                            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Description</label>
                            <Input 
                              value={newTemplateDesc} 
                              onChange={(e) => setNewTemplateDesc(e.target.value)} 
                              placeholder="Brief description..." 
                              className="bg-white"
                            />
                         </div>
                         <div>
                            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Base Document Type</label>
                            <div className="grid grid-cols-3 gap-2">
                              {documentTypes.map(dt => (
                                <button
                                  key={dt.id}
                                  onClick={() => setNewTemplateTypeId(dt.id)}
                                  className={`p-2 rounded border text-sm text-left transition-all ${
                                    newTemplateTypeId === dt.id 
                                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                      : 'border-slate-200 bg-white hover:border-slate-300'
                                  }`}
                                >
                                  <div className="font-medium">{dt.name}</div>
                                </button>
                              ))}
                            </div>
                         </div>
                         <div>
                            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Template Specific Rules</label>
                            <Textarea 
                              value={newTemplateRules}
                              onChange={(e) => setNewTemplateRules(e.target.value)}
                              placeholder="Rules specific to this template (stacks on top of Type rules)..."
                              className="bg-white"
                            />
                         </div>
                         <div className="flex justify-end gap-2 mt-4">
                           <Button variant="ghost" onClick={() => setEditingTemplateId(null)}>Cancel</Button>
                           <Button onClick={handleAddTemplate}>Create Template</Button>
                         </div>
                       </div>
                    </div>
                  )}

                  <div className="grid gap-4">
                    {templates.map(tpl => {
                      const type = documentTypes.find(dt => dt.id === tpl.typeId);
                      return (
                        <div key={tpl.id} className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 transition-colors shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500`}>
                                <LayoutTemplate size={20} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900">{tpl.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>{tpl.description}</span>
                                  {type && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${type.color.replace('text-', 'bg-').replace('border-', '')} bg-opacity-20`}>
                                      {type.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-slate-400 hover:text-blue-500"
                                  onClick={() => duplicateTemplate(tpl.id)}
                                >
                                  <Copy size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-slate-400 hover:text-red-500"
                                  onClick={() => {
                                      if (confirm('Delete this template?')) {
                                          deleteTemplate(tpl.id);
                                      }
                                  }}
                                >
                                  <Trash2 size={16} />
                                </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}