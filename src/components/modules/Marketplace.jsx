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
  { value: 'electronics', label: 'Electronics', icon: Laptop },
  { value: 'books', label: 'Books', icon: BookOpen },
  { value: 'furniture', label: 'Furniture', icon: Armchair },
  { value: 'transport', label: 'Transport', icon: Bike },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-12 pb-12 bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-2xl p-6 w-full max-w-lg animate-fade-in my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold gradient-text">Sell an Item</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="mkt-title" placeholder="What are you selling?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea id="mkt-desc" placeholder="Describe your item..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Price ($)</label>
              <Input id="mkt-price" type="number" min="0" step="0.01" placeholder="25.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <select
                id="mkt-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-10 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm text-foreground cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Condition</label>
            <div className="flex flex-wrap gap-2">
              {CONDITION_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, condition: c })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    form.condition === c
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'bg-secondary text-muted-foreground border border-border hover:border-primary/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Number (required for contact)
            </label>
            <Input
              id="mkt-whatsapp"
              placeholder="+1234567890"
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
              required
            />
          </div>
          <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
            {loading ? 'Publishing...' : 'List Item for Sale'}
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

  function getConditionVariant(condition) {
    if (condition === 'New' || condition === 'Like New') return 'success';
    if (condition === 'Good') return 'default';
    return 'warning';
  }

  function openWhatsApp(number, itemTitle) {
    const cleanNumber = number.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi! I'm interested in your listing on CampusConnect: "${itemTitle}". Is it still available?`);
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/20">
              <ShoppingBag className="h-6 w-6 text-orange-400" />
            </div>
            Marketplace
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Buy & sell within your campus community</p>
        </div>
        <Button variant="gradient" onClick={() => setShowCreate(true)} id="mkt-create-btn">
          <Plus className="h-4 w-4" /> Sell Item
        </Button>
      </div>

      {/* Search & Categories */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="mkt-search" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              !categoryFilter
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'bg-secondary text-muted-foreground border border-border hover:border-primary/30'
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
                  categoryFilter === c.value
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-secondary text-muted-foreground border border-border hover:border-primary/30'
                }`}
              >
                <Icon className="h-3 w-3" /> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5 h-52 shimmer-bg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No items found.</p>
          <Button variant="outline" className="mt-4" onClick={() => setShowCreate(true)}>List the first item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="group flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={getConditionVariant(item.condition)}>{item.condition}</Badge>
                  <Badge variant="gradient">
                    {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                  </Badge>
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4 text-success" />
                  <span className="text-lg font-bold text-success">${item.price}</span>
                </div>
              </CardContent>
              <CardFooter className="justify-between pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  {item.profiles?.full_name || 'Campus member'}
                </span>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => openWhatsApp(item.whatsapp_number, item.title)}
                  id={`mkt-wa-${item.id}`}
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Contact
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {showCreate && <CreateItemForm onClose={() => setShowCreate(false)} onCreated={fetchItems} />}
    </div>
  );
}
