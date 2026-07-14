import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { polishReferral } from '../../services/groq';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { Drawer } from '../ui/Drawer';
import {
  Briefcase, Search, Plus, X, ExternalLink, Sparkles,
  Building2, MapPin, Clock, Copy, Check, Send, Mail
} from 'lucide-react';

const JOB_TYPES = ['Full-Time', 'Part-Time', 'Internship', 'Co-op', 'Referral', 'Research'];

function CreateJobForm({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', company: '', location: '', type: 'Full-Time',
    description: '', apply_link: '', referral_contact: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('career_board').insert({
      user_id: user.id,
      title: form.title,
      company: form.company,
      location: form.location,
      type: form.type,
      description: form.description,
      apply_link: form.apply_link,
      referral_contact: form.referral_contact,
      is_active: true,
    });
    setLoading(false);
    if (!error) {
      onCreated();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg border border-slate-800 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-violet-400" />
              Post Opportunity
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Share job roles, internships, research openings, or referral requests</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Opportunity Title</label>
            <Input
              id="career-title"
              placeholder="e.g., Software Engineering Intern - Fall 2026"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="bg-slate-950/50 border-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Company / Organization</label>
              <Input
                id="career-company"
                placeholder="e.g., Google, Stripe, University Lab"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                required
                className="bg-slate-950/50 border-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Location / Remote</label>
              <Input
                id="career-location"
                placeholder="e.g., New York, NY or Remote"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                className="bg-slate-950/50 border-slate-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Position Type</label>
            <div className="flex flex-wrap gap-1.5">
              {JOB_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`h-9 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    form.type === t
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40'
                      : 'bg-slate-950/50 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Job Description & Qualifications</label>
            <Textarea
              id="career-desc"
              placeholder="Outline job responsibilities, critical tech stack requirements, and application timeline..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              className="bg-slate-950/50 border-slate-800 min-h-[100px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Application Link (optional)</label>
            <Input
              id="career-link"
              placeholder="e.g., https://careers.company.com/job/102"
              value={form.apply_link}
              onChange={(e) => setForm({ ...form, apply_link: e.target.value })}
              className="bg-slate-950/50 border-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Referral Contact Email (optional)</label>
            <Input
              id="career-referral"
              placeholder="e.g., employee@company.com"
              value={form.referral_contact}
              onChange={(e) => setForm({ ...form, referral_contact: e.target.value })}
              className="bg-slate-950/50 border-slate-800"
            />
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-11 font-bold rounded-xl mt-4"
            disabled={loading}
          >
            {loading ? 'Posting opportunity...' : 'Post Opportunity'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function CareerBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // AI Referral Polish state
  const [showPolish, setShowPolish] = useState(false);
  const [rawReferral, setRawReferral] = useState('');
  const [polishedResult, setPolishedResult] = useState('');
  const [polishing, setPolishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedReferralId, setCopiedReferralId] = useState(null);

  async function fetchJobs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('career_board')
      .select('*, profiles(full_name, college)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (!error) setJobs(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchJobs(); }, []);

  const filtered = jobs.filter((job) => {
    if (search && !job.title.toLowerCase().includes(search.toLowerCase()) && !job.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && job.type !== typeFilter) return false;
    return true;
  });

  async function handlePolish() {
    if (!rawReferral.trim()) return;
    setPolishing(true);
    setPolishedResult('');
    try {
      const result = await polishReferral(rawReferral);
      setPolishedResult(result);
    } catch (err) {
      setPolishedResult(`Error polishing message: ${err.message}`);
    }
    setPolishing(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(polishedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCopyReferralEmail(email, id) {
    navigator.clipboard.writeText(email);
    setCopiedReferralId(id);
    setTimeout(() => setCopiedReferralId(null), 2000);
  }

  function getTypeStyles(type) {
    switch (type) {
      case 'Full-Time':
        return 'text-emerald-450 bg-emerald-500/10 border-emerald-500/20';
      case 'Part-Time':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'Internship':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Co-op':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Referral':
        return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      case 'Research':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default:
        return 'text-slate-400 bg-slate-800/60 border-slate-700/40';
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 text-purple-400">
              <Briefcase className="h-6 w-6" />
            </div>
            Career Board
          </h1>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Discover student internship opportunities, research listings, or request employee referrals.
          </p>
        </div>
        
        {/* Header Action Buttons - min target 44px */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowPolish(true)}
            id="career-polish-btn"
            className="h-11 px-4 rounded-xl text-xs font-bold border-violet-500/30 text-violet-400 hover:bg-violet-500/10 flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4.5 w-4.5" />
            <span>AI Polish Referral</span>
          </Button>
          <Button
            variant="gradient"
            onClick={() => setShowCreate(true)}
            id="career-create-btn"
            className="h-11 px-5 rounded-xl font-bold flex items-center gap-2 justify-center shadow-md shadow-violet-500/10"
          >
            <Plus className="h-5 w-5" />
            <span>Post Opportunity</span>
          </Button>
        </div>
      </div>

      {/* Sticky Search & Type Filter Ribbon */}
      <div className="sticky top-[57px] lg:top-0 z-20 glass rounded-2xl p-4 shadow-xl border border-slate-800/80 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <Input
            id="career-search"
            placeholder="Search roles by job title, company name or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-11 bg-slate-950/60 border-slate-800/80 focus:border-violet-500/80"
          />
        </div>

        {/* Filter Ribbon tags - touch optimized */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-850/60 items-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">Filter Type:</span>
          <button
            onClick={() => setTypeFilter('')}
            className={`h-9 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center ${
              !typeFilter
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40 shadow-sm'
                : 'bg-slate-900/40 text-slate-400 border border-slate-850 hover:border-slate-700 hover:text-slate-350'
            }`}
          >
            All Roles
          </button>
          
          {JOB_TYPES.map((t) => {
            const selected = typeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`h-9 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center cursor-pointer ${
                  selected
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40 shadow-sm'
                    : 'bg-slate-900/40 text-slate-400 border border-slate-850 hover:border-slate-700 hover:text-slate-350'
                }`}
              >
                <span>{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Jobs opportunity listings Feed */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-40 shimmer-bg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-slate-800/60">
          <Briefcase className="h-14 w-14 text-slate-500 mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-bold text-slate-300">No Opportunities Found</h3>
          <p className="text-slate-400 text-xs mt-1">Try modifying filters or request a referral post.</p>
          <Button variant="outline" className="mt-5 border-slate-800 hover:border-slate-700 h-10 px-4 rounded-xl text-xs font-bold" onClick={() => setShowCreate(true)}>
            Post First Opportunity
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((job) => (
            <Card key={job.id} className="group glass-card overflow-hidden">
              <CardHeader className="p-6 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-100 group-hover:text-violet-400 transition-colors duration-200">
                      {job.title}
                    </CardTitle>
                    
                    <CardDescription className="text-xs text-slate-450 mt-2.5 flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5 font-medium text-slate-350">
                        <Building2 className="h-4 w-4 text-violet-400/80" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-violet-400/80" />
                        {job.location}
                      </span>
                    </CardDescription>
                  </div>
                  
                  <span className={`text-[10px] font-bold py-1 px-3 rounded-lg border tracking-wide uppercase shrink-0 ${getTypeStyles(job.type)}`}>
                    {job.type}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-2">
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </CardContent>

              <CardFooter className="p-6 pt-4 border-t border-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/20">
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Posted by {job.profiles?.full_name || 'Campus Member'}</span>
                </span>
                
                {/* Job CTAs - target heights of min 44px */}
                <div className="flex flex-wrap items-center gap-2">
                  {job.apply_link && (
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      className="h-11 px-4 rounded-xl text-xs font-bold bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-550/20 flex items-center gap-1.5 select-none"
                    >
                      <a href={job.apply_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        <span>Apply Externally</span>
                      </a>
                    </Button>
                  )}
                  
                  {job.referral_contact && (
                    <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-850">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 border-none bg-transparent hover:bg-slate-800 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 px-2 rounded-lg"
                        asChild
                      >
                        <a href={`mailto:${job.referral_contact}?subject=Referral Request: ${job.title} at ${job.company}&body=Hi,\n\nI noticed you have a referral opening for "${job.title}" at "${job.company}" listed on CampusConnect. I would highly appreciate it if you could refer me for this role. I have attached my details for your reference.`}>
                          Request Referral
                        </a>
                      </Button>
                      
                      <button
                        onClick={() => handleCopyReferralEmail(job.referral_contact, job.id)}
                        className="h-8 w-16 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100 transition-all flex items-center justify-center rounded-lg cursor-pointer font-bold text-[10px]"
                        id={`career-copy-email-${job.id}`}
                      >
                        {copiedReferralId === job.id ? (
                          <span className="text-emerald-400">Copied!</span>
                        ) : (
                          <span>Copy</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {showCreate && <CreateJobForm onClose={() => setShowCreate(false)} onCreated={fetchJobs} />}

      {/* AI Referral Polisher Drawer */}
      <Drawer
        open={showPolish}
        onClose={() => { setShowPolish(false); setPolishedResult(''); setRawReferral(''); }}
        title="AI Referral Polisher"
      >
        <div className="rounded-2xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 p-5 space-y-2 mb-4 animate-fade-in shadow-inner">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-bold">Powered by Groq LLM API</span>
          </div>
          <p className="text-xs text-slate-450 leading-relaxed">
            Enter key points (role, experiences, qualifications). Campus AI will write a highly compelling, professional message to request employee referrals.
          </p>
        </div>

        <div className="space-y-4">
          <Textarea
            id="polish-input"
            placeholder="e.g., Hey I want a referral for SWE at Google. I know React, node and Python. I worked on a medical image classification project using TensorFlow at MIT. Thanks!"
            value={rawReferral}
            onChange={(e) => setRawReferral(e.target.value)}
            className="min-h-[140px] bg-slate-950/50 border-slate-850"
          />

          <Button
            variant="gradient"
            className="w-full h-11 font-bold rounded-xl flex items-center justify-center gap-2"
            onClick={handlePolish}
            disabled={polishing || !rawReferral.trim()}
            id="polish-submit-btn"
          >
            {polishing ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Polishing Draft...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5" />
                <span>Polish My Draft</span>
              </>
            )}
          </Button>

          {polishedResult && (
            <div className="animate-fade-in space-y-2 mt-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Polished referral letter</span>
                
                {/* Copy Button - target min 44px */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  id="polish-copy-btn"
                  className="h-10 px-3 rounded-lg hover:bg-slate-800 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Result</span>
                    </>
                  )}
                </Button>
              </div>
              
              {/* Premium Glass Output Box */}
              <div className="rounded-2xl bg-slate-950/70 border border-slate-850 p-5 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap select-all font-sans relative shadow-inner">
                {polishedResult}
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
