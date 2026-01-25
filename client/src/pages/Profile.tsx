import React, { useState } from 'react';
import { useDocuments, UserProfile } from '../lib/store';
import { useLocation } from 'wouter';
import { 
  User, 
  Mail, 
  Briefcase, 
  Settings2, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  ChevronDown,
  BrainCircuit,
  Lightbulb,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function Profile() {
  const [location, setLocation] = useLocation();
  const { 
    currentUser, 
    setCurrentUser, 
    userProfiles, 
    updateUserProfile 
  } = useDocuments();

  const [personalRules, setPersonalRules] = useState(currentUser.personalRules);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateUserProfile(currentUser.id, { personalRules });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleUserSwitch = (user: UserProfile) => {
    setCurrentUser(user);
    setPersonalRules(user.personalRules);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-slate-900 font-sans selection:bg-blue-100/50">
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
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
                My Profile
              </h1>
              <p className="text-slate-500 mt-1">
                Manage your identity and personal AI calibration
              </p>
            </div>
          </div>

          {/* User Switcher (Mockup Utility) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-dashed border-slate-300 text-slate-500 hover:text-slate-900">
                    <User size={16} />
                    Switch User (Mockup)
                    <ChevronDown size={14} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {userProfiles.map(u => (
                    <DropdownMenuItem key={u.id} onClick={() => handleUserSwitch(u)} className="gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                            {u.avatar}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-xs">{u.name}</span>
                            <span className="text-[10px] text-muted-foreground">{u.role}</span>
                        </div>
                        {currentUser.id === u.id && <CheckCircle2 size={14} className="ml-auto text-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Identity Card */}
            <div className="md:col-span-1 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl font-serif font-bold text-blue-700 mb-4 border-4 border-white shadow-lg">
                        {currentUser.avatar}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
                    <p className="text-sm text-slate-500 font-medium">{currentUser.role}</p>
                    
                    <div className="w-full mt-6 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <Mail size={16} className="text-slate-400" />
                            <span className="truncate">{currentUser.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <Briefcase size={16} className="text-slate-400" />
                            <span>{currentUser.role}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <BrainCircuit size={16} /> Cognitive Calibration
                    </h3>
                    <p className="text-xs text-blue-700/80 leading-relaxed">
                        Your personal AI rules are automatically injected into every interaction. This ensures the system adapts to <strong>your</strong> specific working style, not the other way around.
                    </p>
                </div>
            </div>

            {/* AI Settings */}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Sparkles size={18} className="text-indigo-500" />
                                Personal AI Alignment
                            </h2>
                            <p className="text-sm text-slate-500">
                                How should the AI behave specifically for you?
                            </p>
                        </div>
                        {isSaved && (
                            <motion.span 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-xs font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full"
                            >
                                <CheckCircle2 size={12} /> Saved
                            </motion.span>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                            <div className="flex gap-3">
                                <Lightbulb className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-indigo-900">Why this matters</h4>
                                    <p className="text-xs text-indigo-800/80 leading-relaxed">
                                        Collaboration works best when everyone can be their authentic selves. 
                                        Instead of forcing a standardized style on everyone, FlowState lets you 
                                        define your preferred communication mode, and the AI handles the translation 
                                        if needed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase text-slate-500 mb-2 block flex items-center gap-2">
                                <Zap size={14} className="text-amber-500" /> 
                                Your "Always-On" Instructions
                            </label>
                            <Textarea 
                                value={personalRules}
                                onChange={(e) => setPersonalRules(e.target.value)}
                                className="min-h-[200px] font-mono text-sm bg-slate-50 focus:bg-white transition-colors resize-none p-4 leading-relaxed"
                                placeholder="e.g. I prefer bullet points over paragraphs. Always define acronyms. Use a friendly but professional tone..."
                            />
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-[10px] text-slate-400">
                                    These rules are private to you and applied on top of project rules.
                                </p>
                                <Button onClick={handleSave} disabled={personalRules === currentUser.personalRules}>
                                    Save Preferences
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Example Scenarios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Drafting</h4>
                        <p className="text-xs text-slate-500 italic">
                            "When I ask for a draft, the AI will apply your style automatically."
                        </p>
                     </div>
                     <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Reviewing</h4>
                        <p className="text-xs text-slate-500 italic">
                            "When summarizing others' work for you, it will highlight what YOU care about."
                        </p>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}