import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import {
  ShoppingBag, Tag, Search, Plus, X, MessageCircle,
  Package, Laptop, BookOpen, Armchair, Bike, MoreHorizontal
} from 'lucide-react';

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics', icon: Laptop, color: 'text-cyan-400' },
  { value: 'books', label: 'Books', icon: BookOpen, color: 'text-amber-450' },
  { value: 'furniture', label: 'Furniture', icon: Armchair, color: 'text-rose-400' },
  { value: 'transport', label: 'Transport', icon: Bike, color: 'text-emerald-450' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-slate-400' },
];

const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair', 'Used'];

function CreateItemForm({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: 'electronics',
    condition: 'Good', whatsapp_number: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.whatsapp_number.trim()) {
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('listings_marketplace').insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      condition: form.condition,
      whatsapp_number: form.whatsapp_number,
      is_sold: false,
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
              <ShoppingBag className="h-5 w-5 text-orange-400" />
              List an Item
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Sell textbooks, gadgets, or furniture to other students</p>
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
            <label className="text-xs font-semibold text-slate-300">What are you selling?</label>
            <Input
              id="mkt-title"
              placeholder="e.g., iPad Air (4th Gen) 64GB - Perfect Condition"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="bg-slate-950/50 border-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <Textarea
              id="mkt-desc"
              placeholder="Add details about age, warranty, specifications, meeting spot..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              className="bg-slate-950/50 border-slate-800 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Price ($)</label>
              <Input
                id="mkt-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="250.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="bg-slate-950/50 border-slate-800"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                id="mkt-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 text-xs font-semibold text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500/60"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Item Condition</label>
            <div className="flex flex-wrap gap-1.5">
              {CONDITION_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, condition: c })}
                  className={`h-9 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    form.condition === c
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      : 'bg-slate-950/50 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-orange-400" /> WhatsApp Contact Number
            </label>
            <Input
              id="mkt-whatsapp"
              placeholder="e.g., +15550199"
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
              required
              className="bg-slate-950/50 border-slate-800"
            />
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-11 font-bold rounded-xl mt-4 shadow-md"
            disabled={loading}
          >
            {loading ? 'Publishing listing...' : 'List Item for Sale'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings_marketplace')
      .select('*, profiles(full_name, college)')
      .eq('is_sold', false)
      .order('created_at', { ascending: false });
    if (!error) setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter && item.category !== categoryFilter) return false;
      return true;
    });
  }, [items, search, categoryFilter]);

  function getConditionStyles(condition) {
    switch (condition) {
      case 'New':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'Like New':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Good':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Fair':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-slate-800/60 text-slate-400 border border-slate-700/40';
    }
  }

  function openWhatsApp(number, itemTitle) {
    const cleanNumber = number.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi! I saw your listing "${itemTitle}" on the CampusConnect Marketplace. Is it still available?`);
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20 text-orange-400">
              <ShoppingBag className="h-6 w-6" />
            </div>
            Marketplace
          </h1>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Acquire or clear textbooks, electronics, and supplies inside the verified student community.
          </p>
        </div>

        {/* Sell Item Trigger - min target 44px height */}
        <Button
          variant="gradient"
          onClick={() => setShowCreate(true)}
          id="mkt-create-btn"
          className="h-11 px-5 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center select-none shadow-md shadow-orange-500/10"
        >
          <Plus className="h-5 w-5" /> Sell Item
        </Button>
      </div>

      {/* Sticky Search & Category Ribbon */}
      <div className="sticky top-[57px] lg:top-0 z-20 glass rounded-2xl p-4 shadow-xl border border-slate-800/80 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <Input
            id="mkt-search"
            placeholder="Search marketplace listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-11 bg-slate-950/60 border-slate-800/80 focus:border-orange-500/80"
          />
        </div>
        
        {/* Category filters - touch optimized */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-850/60">
          <button
            onClick={() => setCategoryFilter('')}
            className={`h-9 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center ${
              !categoryFilter
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                : 'bg-slate-900/40 text-slate-400 border border-slate-850 hover:border-slate-700 hover:text-slate-350'
            }`}
          >
            All Products
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
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                    : 'bg-slate-900/40 text-slate-400 border border-slate-850 hover:border-slate-700 hover:text-slate-350'
                }`}
              >
                <Icon className={`h-4 w-4 ${selected ? 'text-orange-450' : c.color}`} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-60 shimmer-bg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-slate-800/60">
          <Package className="h-14 w-14 text-slate-500 mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-bold text-slate-300">No Items listed</h3>
          <p className="text-slate-400 text-xs mt-1">Be the first to post something for sale or check other categories.</p>
          <Button variant="outline" className="mt-5 border-slate-800 hover:border-slate-700 h-10 px-4 rounded-xl text-xs font-bold" onClick={() => setShowCreate(true)}>
            Sell First Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => {
            const cat = CATEGORIES.find((c) => c.value === item.category);
            return (
              <Card key={item.id} className="group glass-card flex flex-col justify-between overflow-hidden relative">
                <div>
                  <CardHeader className="p-5 pb-2">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-bold py-0.5 px-2 rounded-md ${getConditionStyles(item.condition)}`}>
                        {item.condition}
                      </span>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-450 py-0.5 px-2 rounded-md font-semibold uppercase tracking-wider">
                        {cat?.label || item.category}
                      </span>
                    </div>
                    
                    <CardTitle className="text-sm font-bold text-slate-100 group-hover:text-orange-400 transition-colors duration-200 line-clamp-2 leading-snug">
                      {item.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-5 py-2 space-y-3.5">
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                      <Tag className="h-4 w-4 text-emerald-450 shrink-0" />
                      <span className="text-base font-extrabold text-emerald-400 font-mono tracking-tight">
                        ${item.price}
                      </span>
                      
                      {/* Active Status indicator with pulse */}
                      <span className="ml-auto flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Active</span>
                      </span>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-5 pt-3 border-t border-slate-900 flex items-center justify-between gap-3 bg-slate-900/20">
                  <div className="min-w-0">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Seller</span>
                    <span className="text-xs font-semibold text-slate-350 truncate block">
                      {item.profiles?.full_name || 'Campus Member'}
                    </span>
                  </div>

                  {/* Preformatted WhatsApp dispatch node - min target 44px */}
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => openWhatsApp(item.whatsapp_number, item.title)}
                    id={`mkt-wa-${item.id}`}
                    className="h-11 px-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-450 border border-emerald-550/20 text-xs font-bold transition-all active:scale-95 duration-150 shrink-0 shadow-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Contact</span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {showCreate && <CreateItemForm onClose={() => setShowCreate(false)} onCreated={fetchItems} />}
    </div>
  );
}
