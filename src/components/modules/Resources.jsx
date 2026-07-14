import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { summarizeNotes } from '../../services/groq';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { Drawer } from '../ui/Drawer';
import {
  FolderOpen, FileText, Upload, Search, Plus, X,
  Sparkles, Download, BookOpen, FileCode, Presentation, File, Copy, Check
} from 'lucide-react';

const CATEGORIES = [
  { value: 'notes', label: 'Lecture Notes', icon: BookOpen, color: 'text-cyan-500' },
  { value: 'assignments', label: 'Assignments', icon: FileText, color: 'text-amber-500' },
  { value: 'projects', label: 'Projects', icon: FileCode, color: 'text-emerald-500' },
  { value: 'slides', label: 'Slides', icon: Presentation, color: 'text-indigo-500' },
  { value: 'other', label: 'Other', icon: File, color: 'text-slate-500' },
];

function UploadResourceForm({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', category: 'notes', course_code: '', content: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    let fileUrl = null;
    if (file) {
      const fileExt = file.name.split('.').pop();
      const filePath = `resources/${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('resources').getPublicUrl(filePath);
        fileUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from('resources').insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      category: form.category,
      course_code: form.course_code.toUpperCase(),
      content: form.content,
      file_url: fileUrl,
      file_name: file?.name || null,
    });

    setLoading(false);
    if (!error) {
      onCreated();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto transition-colors duration-200">
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-amber-400" />
              Share Resource
            </h2>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Upload slides, code files, homework sheets or exam syllabus notes</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Resource Title</label>
            <Input
              id="res-title"
              placeholder="e.g., CS101 Final Exam Prep Guide"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="bg-secondary/40 border-border focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Category</label>
              <select
                id="res-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-800 bg-secondary/40 px-3 text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/10"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Course Code (optional)</label>
              <Input
                id="res-course"
                placeholder="e.g., CS-101"
                value={form.course_code}
                onChange={(e) => setForm({ ...form, course_code: e.target.value })}
                className="bg-secondary/40 border-border focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Brief Description</label>
            <Textarea
              id="res-desc"
              placeholder="Brief details about what the document contains, week numbers, topics..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-secondary/40 border-border min-h-[80px] focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Notes / Text Content (optional — used for AI summarization)
            </label>
            <Textarea
              id="res-content"
              placeholder="Paste raw lecture note text here..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="bg-secondary/40 border-border min-h-[100px] focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground block mb-1">Attach Document File (optional)</label>
            <label
              htmlFor="res-file-upload"
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border hover:border-amber-500/40 transition-colors cursor-pointer bg-secondary/35"
            >
              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-foreground" />
              <span className="text-xs text-muted-foreground text-center font-medium">
                {file ? file.name : 'Click to select and attach document file'}
              </span>
              <input
                id="res-file-upload"
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-11 font-bold rounded-xl mt-4 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Sharing resource...' : 'Share Resource'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // AI Summarize state
  const [showSummarize, setShowSummarize] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [summaryInput, setSummaryInput] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function fetchResources() {
    setLoading(true);
    const { data, error } = await supabase
      .from('resources')
      .select('*, profiles(full_name, college)')
      .order('created_at', { ascending: false });
    if (!error) setResources(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchResources(); }, []);

  const filtered = resources.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !(r.course_code || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && r.category !== categoryFilter) return false;
    return true;
  });

  function openSummarizer(resource) {
    setSelectedResource(resource);
    setSummaryInput(resource.content || resource.description || '');
    setSummaryResult('');
    setShowSummarize(true);
  }

  async function handleSummarize() {
    if (!summaryInput.trim()) return;
    setSummarizing(true);
    setSummaryResult('');
    try {
      const result = await summarizeNotes(summaryInput);
      setSummaryResult(result);
    } catch (err) {
      setSummaryResult(`Error generating summary: ${err.message}`);
    }
    setSummarizing(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(summaryResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-amber-500">
              <FolderOpen className="h-6 w-6" />
            </div>
            Resources Hub
          </h1>
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
            Access shared study materials, lecture folders, assignments, and instantly run AI summaries.
          </p>
        </div>

        {/* Share Resource Trigger - min target 44px height */}
        <Button
          variant="gradient"
          onClick={() => setShowUpload(true)}
          id="res-upload-btn"
          className="h-11 px-5 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center select-none shadow-md shadow-amber-500/10 cursor-pointer"
        >
          <Plus className="h-5 w-5" /> Share Resource
        </Button>
      </div>

      {/* Sticky Search & Category Ribbon */}
      <div className="sticky top-[57px] lg:top-0 z-20 glass rounded-2xl p-4 shadow-xl border border-border space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <Input
            id="res-search"
            placeholder="Search by course code, keyword, or document title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-11 bg-secondary/45 border-border focus:border-amber-500"
          />
        </div>

        {/* Category tags - touch optimized */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-border items-center">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mr-1">Categories:</span>
          <button
            onClick={() => setCategoryFilter('')}
            className={`h-9 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center ${
              !categoryFilter
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-sm'
                : 'bg-secondary/40 text-muted-foreground border border-border hover:border-amber-500/25 hover:text-foreground'
            }`}
          >
            All Docs
          </button>
          
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const selected = categoryFilter === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setCategoryFilter(c.value)}
                className={`h-9 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  selected
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'bg-secondary/40 text-muted-foreground border border-border hover:border-amber-500/25 hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${selected ? 'text-amber-650' : c.color}`} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid List for files */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-48 shimmer-bg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-border">
          <FolderOpen className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-bold text-foreground">No Documents Uploaded</h3>
          <p className="text-muted-foreground text-xs mt-1">Check other tags or be the first to share notes.</p>
          <Button variant="outline" className="mt-5 border-border hover:border-primary/20 h-10 px-4 rounded-xl text-xs font-bold cursor-pointer" onClick={() => setShowUpload(true)}>
            Share First Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((resource) => {
            const cat = CATEGORIES.find((c) => c.value === resource.category);
            const CatIcon = cat?.icon || File;
            return (
              <Card key={resource.id} className="group glass-card flex flex-col justify-between overflow-hidden p-6">
                <div>
                  <CardHeader className="p-0 pb-2">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold py-0.5 px-2 bg-secondary border border-border rounded-md text-muted-foreground">
                        <CatIcon className="h-3.5 w-3.5" />
                        <span>{cat?.label || resource.category}</span>
                      </span>
                      
                      {resource.course_code && (
                        <span className="font-mono text-[11px] font-bold text-primary bg-secondary border border-border py-0.5 px-2.5 rounded-md tracking-wider">
                          {resource.course_code}
                        </span>
                      )}
                    </div>
                    
                    <CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1 leading-snug">
                      {resource.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-0 py-2">
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {resource.description || 'No description provided.'}
                    </p>
                  </CardContent>
                </div>

                <CardFooter className="p-0 pt-4 mt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
                  <div className="min-w-0">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider block font-bold">Contributor</span>
                    <span className="text-xs font-semibold text-foreground truncate block">
                      {resource.profiles?.full_name || 'Campus Member'}
                    </span>
                  </div>

                  {/* Actions - min target height 44px, locked to footer */}
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    {(resource.content || resource.description) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSummarizer(resource)}
                        className="h-11 px-3.5 rounded-xl text-xs font-bold border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-1.5 cursor-pointer"
                        id={`res-summarize-${resource.id}`}
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Summarize</span>
                      </Button>
                    )}
                    
                    {resource.file_url && (
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                        className="h-11 w-11 flex items-center justify-center rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all active:scale-95 duration-150 cursor-pointer shadow-sm shrink-0"
                        title="Download Document"
                      >
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {showUpload && <UploadResourceForm onClose={() => setShowUpload(false)} onCreated={fetchResources} />}

      {/* AI Summary Notes Drawer */}
      <Drawer
        open={showSummarize}
        onClose={() => { setShowSummarize(false); setSummaryResult(''); setSelectedResource(null); }}
        title="AI Notes Summarizer"
      >
        <div className="rounded-2xl bg-gradient-to-r from-cyan-500/10 to-amber-500/10 border border-amber-500/20 p-5 space-y-2 mb-4 animate-fade-in shadow-inner">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-450">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-bold">Powered by Groq LLM API</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Extract primary learning objectives, keywords, equations, and summaries from raw lecture notes.
          </p>
        </div>

        {selectedResource && (
          <div className="rounded-xl bg-secondary/45 border border-border p-4 space-y-1.5 shadow-sm">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider block font-bold">Active Document</span>
            <p className="text-xs font-bold text-foreground">{selectedResource.title}</p>
            {selectedResource.course_code && (
              <span className="font-mono text-[10px] text-primary block mt-1">{selectedResource.course_code}</span>
            )}
          </div>
        )}

        <div className="space-y-4 mt-4">
          <Textarea
            id="summarize-input"
            placeholder="Paste raw text or edit notes to summarize..."
            value={summaryInput}
            onChange={(e) => setSummaryInput(e.target.value)}
            className="min-h-[140px] bg-secondary/40 border-border focus:border-primary"
          />

          <Button
            variant="gradient"
            className="w-full h-11 font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 cursor-pointer"
            onClick={handleSummarize}
            disabled={summarizing || !summaryInput.trim()}
            id="summarize-submit-btn"
          >
            {summarizing ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Summarizing Notes...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5" />
                <span>Summarize Notes</span>
              </>
            )}
          </Button>

          {summaryResult && (
            <div className="animate-fade-in space-y-2 mt-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Summarized Takeaways</span>
                
                {/* Copy Takeaways Button - min target 44px height */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  id="summarize-copy-btn"
                  className="h-10 px-3 rounded-lg hover:bg-secondary text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy takeaways</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Premium Glass Output Box */}
              <div className="rounded-2xl bg-secondary/45 border border-border p-5 text-foreground text-xs leading-relaxed whitespace-pre-wrap select-all font-sans relative shadow-inner">
                {summaryResult}
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
