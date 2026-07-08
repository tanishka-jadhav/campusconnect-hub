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
  Sparkles, Download, BookOpen, FileCode, Presentation, File
} from 'lucide-react';

const CATEGORIES = [
  { value: 'notes', label: 'Lecture Notes', icon: BookOpen },
  { value: 'assignments', label: 'Assignments', icon: FileText },
  { value: 'projects', label: 'Projects', icon: FileCode },
  { value: 'slides', label: 'Slides', icon: Presentation },
  { value: 'other', label: 'Other', icon: File },
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
      course_code: form.course_code,
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-12 pb-12 bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-2xl p-6 w-full max-w-lg animate-fade-in my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold gradient-text">Share Resource</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="res-title" placeholder="Resource title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <select
                id="res-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-10 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm text-foreground cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <Input id="res-course" placeholder="Course code (e.g., CS101)" value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} />
          </div>
          <Textarea id="res-desc" placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Textarea
            id="res-content"
            placeholder="Paste your notes / text content here (optional — used for AI summarization)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="min-h-[100px]"
          />
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Attach File (optional)</label>
            <label
              htmlFor="res-file-upload"
              className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer bg-secondary/30"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {file ? file.name : 'Click to upload a file'}
              </span>
              <input
                id="res-file-upload"
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
          </div>
          <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
            {loading ? 'Uploading...' : 'Share Resource'}
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
      setSummaryResult(`Error: ${err.message}`);
    }
    setSummarizing(false);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/20">
              <FolderOpen className="h-6 w-6 text-amber-400" />
            </div>
            Resources
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Shared notes, documents & study materials</p>
        </div>
        <Button variant="gradient" onClick={() => setShowUpload(true)} id="res-upload-btn">
          <Plus className="h-4 w-4" /> Share Resource
        </Button>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="res-search" placeholder="Search by title or course code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              !categoryFilter ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-secondary text-muted-foreground border border-border hover:border-primary/30'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.value}
                onClick={() => setCategoryFilter(c.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  categoryFilter === c.value ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-secondary text-muted-foreground border border-border hover:border-primary/30'
                }`}
              >
                <Icon className="h-3 w-3" /> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="glass-card rounded-xl p-5 h-48 shimmer-bg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No resources shared yet.</p>
          <Button variant="outline" className="mt-4" onClick={() => setShowUpload(true)}>Share the first resource</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resource) => {
            const cat = CATEGORIES.find((c) => c.value === resource.category);
            const CatIcon = cat?.icon || File;
            return (
              <Card key={resource.id} className="group flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CatIcon className="h-3 w-3" /> {cat?.label || resource.category}
                    </Badge>
                    {resource.course_code && (
                      <Badge variant="outline">{resource.course_code}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
                </CardContent>
                <CardFooter className="justify-between pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    {resource.profiles?.full_name || 'Campus member'}
                  </span>
                  <div className="flex gap-2">
                    {(resource.content || resource.description) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSummarizer(resource)}
                        className="border-gradient-start/40 text-primary hover:bg-primary/10"
                        id={`res-summarize-${resource.id}`}
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Summarize
                      </Button>
                    )}
                    {resource.file_url && (
                      <Button variant="default" size="sm" asChild>
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3.5 w-3.5" /> Download
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

      {/* AI Summarize Notes Drawer */}
      <Drawer
        open={showSummarize}
        onClose={() => { setShowSummarize(false); setSummaryResult(''); setSelectedResource(null); }}
        title="AI Notes Summarizer"
      >
        <div className="rounded-xl bg-gradient-to-r from-gradient-start/10 to-gradient-end/10 border border-gradient-start/20 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Powered by Groq AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Get instant bulleted key takeaways from any notes or document content.
          </p>
        </div>

        {selectedResource && (
          <div className="rounded-lg bg-secondary/50 border border-border p-3 mb-4">
            <p className="text-sm font-medium">{selectedResource.title}</p>
            {selectedResource.course_code && (
              <p className="text-xs text-muted-foreground">{selectedResource.course_code}</p>
            )}
          </div>
        )}

        <Textarea
          id="summarize-input"
          placeholder="Paste your notes here..."
          value={summaryInput}
          onChange={(e) => setSummaryInput(e.target.value)}
          className="min-h-[140px]"
        />

        <Button
          variant="gradient"
          className="w-full"
          onClick={handleSummarize}
          disabled={summarizing || !summaryInput.trim()}
          id="summarize-submit-btn"
        >
          {summarizing ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Summarizing...
            </span>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Summarize Notes
            </>
          )}
        </Button>

        {summaryResult && (
          <div className="animate-fade-in mt-4">
            <span className="text-sm font-semibold text-success mb-2 block">Key Takeaways</span>
            <div className="rounded-xl bg-secondary/50 border border-border p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {summaryResult}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
