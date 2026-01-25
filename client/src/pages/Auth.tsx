import React, { useState } from 'react';
import { useLocation } from "wouter";
import { useDocuments } from '../lib/store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  GitBranch, 
  ArrowRight,
  Github,
  Mail,
  Lock,
  User,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('alex@flowstate.ai'); // Default to Alex for quick demo
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login, signup } = useDocuments();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
        if (isLogin) {
            // For mockup: if password is blank, we just allow it for the demo flow
            const success = login(email);
            if (success) {
                setLocation('/');
            } else {
                // If the user doesn't exist, create a temporary one for this session to unblock the user
                if (email) {
                    signup(email.split('@')[0], email);
                    setLocation('/');
                } else {
                    setError('Invalid credentials. Try "alex@flowstate.ai"');
                    setIsLoading(false);
                }
            }
        } else {
            if (!name || !email) {
                setError('Please fill in all fields');
                setIsLoading(false);
                return;
            }
            signup(name, email);
            setLocation('/');
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground mx-auto mb-4 shadow-lg shadow-primary/20">
          <GitBranch size={24} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">FlowState</h1>
        <p className="text-slate-500 mt-2 text-sm">Where ideas become specifications</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Toggle Header */}
          <div className="flex border-b border-slate-100">
            <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${isLogin ? 'text-primary bg-slate-50 border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Sign In
            </button>
            <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${!isLogin ? 'text-primary bg-slate-50 border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Create Account
            </button>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2 mb-4"
                    >
                        <AlertCircle size={14} />
                        {error}
                    </motion.div>
                )}
              </AnimatePresence>

              {!isLogin && (
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <Input 
                            id="name" 
                            placeholder="Jane Doe" 
                            className="pl-10" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@company.com" 
                        className="pl-10" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    {isLogin && (
                        <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
                    )}
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? (
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                    />
                ) : (
                    <span className="flex items-center gap-2">
                        {isLogin ? 'Sign In' : 'Create Account'} 
                        <ArrowRight size={16} />
                    </span>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs text-center text-slate-500 mb-4">Or continue with</p>
                <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="outline" className="w-full" onClick={() => {
                        // Demo shortcut
                        login('alex@flowstate.ai');
                        setLocation('/');
                    }}>
                        <Github size={16} className="mr-2" /> GitHub
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => {
                         // Demo shortcut
                         login('sarah@flowstate.ai');
                         setLocation('/');
                    }}>
                        <span className="font-bold text-lg mr-2 leading-none text-blue-500">G</span> Google
                    </Button>
                </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
            By clicking continue, you agree to our <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}