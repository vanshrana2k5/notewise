import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Plus, Search, Tag, Archive, LayoutDashboard, LogOut,
  FileText, Zap, MoreHorizontal, Trash2, Share2, FolderOpen
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import InsightsPanel from '../components/InsightsPanel';

const CATEGORIES = ['General', 'Work', 'Personal', 'Ideas', 'Research', 'Journal'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [view, setView] = useState('notes'); // 'notes' | 'insights'
  const [allTags, setAllTags] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { archived: showArchived };
      if (search) params.search = search;
      if (activeTag) params.tag = activeTag;
      if (activeCategory) params.category = activeCategory;
      const res = await api.get('/notes', { params });
      setNotes(res.data.notes);
      const tags = [...new Set(res.data.notes.flatMap(n => n.tags))];
      setAllTags(tags);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [search, activeTag, activeCategory, showArchived]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const createNote = async () => {
    try {
      const res = await api.post('/notes', { title: 'Untitled Note', content: '', category: activeCategory || 'General' });
      navigate(`/note/${res.data.note.id}`);
    } catch {
      toast.error('Failed to create note');
    }
  };

  const deleteNote = async (id) => {
    if (!confirm('Delete this note permanently?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(p => p.filter(n => n.id !== id));
      toast.success('Note deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const archiveNote = async (id, isArchived) => {
    try {
      await api.patch(`/notes/${id}`, { is_archived: !isArchived });
      setNotes(p => p.filter(n => n.id !== id));
      toast.success(isArchived ? 'Note unarchived' : 'Note archived');
    } catch {
      toast.error('Action failed');
    }
  };

  const shareNote = async (id) => {
    try {
      const res = await api.post(`/notes/${id}/share`);
      await navigator.clipboard.writeText(res.data.share_url);
      toast.success('Share link copied to clipboard!');
    } catch {
      toast.error('Share failed');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: '240px', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontWeight: '600', fontSize: '1rem' }}>NoteWise</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.4rem', marginLeft: '38px' }}>{user?.name}</p>
        </div>

        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
          <button onClick={() => { setView('notes'); setShowArchived(false); setActiveTag(''); setActiveCategory(''); }}
            style={navBtnStyle(view === 'notes' && !showArchived)}>
            <FileText size={15} /> All Notes
          </button>
          <button onClick={() => setView('insights')} style={navBtnStyle(view === 'insights')}>
            <LayoutDashboard size={15} /> Insights
          </button>
          <button onClick={() => { setView('notes'); setShowArchived(true); setActiveTag(''); }}
            style={navBtnStyle(showArchived && view === 'notes')}>
            <Archive size={15} /> Archived
          </button>

          {CATEGORIES.length > 0 && (
            <>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)', padding: '1rem 0.75rem 0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categories</div>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setActiveCategory(activeCategory === cat ? '' : cat); setView('notes'); }}
                  style={navBtnStyle(activeCategory === cat)}>
                  <FolderOpen size={15} /> {cat}
                </button>
              ))}
            </>
          )}

          {allTags.length > 0 && (
            <>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)', padding: '1rem 0.75rem 0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags</div>
              {allTags.map(tag => (
                <button key={tag} onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                  style={navBtnStyle(activeTag === tag)}>
                  <Tag size={13} /> {tag}
                </button>
              ))}
            </>
          )}
        </nav>

        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} style={{ ...navBtnStyle(false), color: 'var(--text3)', width: '100%' }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg2)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              style={{ width: '100%', maxWidth: '400px', padding: '0.55rem 0.9rem 0.55rem 2.25rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
          <button onClick={createNote}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.55rem 1rem', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: '500', fontSize: '0.9rem', cursor: 'pointer' }}>
            <Plus size={16} /> New Note
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {view === 'insights' ? (
            <InsightsPanel />
          ) : loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', paddingTop: '4rem' }}>Loading...</div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '5rem', color: 'var(--text3)' }}>
              <FileText size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '1rem' }}>No notes yet</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>Click "New Note" to get started</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}
              onClick={() => setMenuOpen(null)}>
              {notes.map(note => (
                <div key={note.id}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.1rem', cursor: 'pointer', position: 'relative', transition: 'border-color 0.2s' }}
                  onClick={() => navigate(`/note/${note.id}`)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '500', lineHeight: 1.4, flex: 1, paddingRight: '2rem' }}>{note.title}</h3>
                    <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === note.id ? null : note.id); }}
                      style={{ position: 'absolute', top: '0.9rem', right: '0.9rem', color: 'var(--text3)', padding: '2px' }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </div>

                  {note.content && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6, marginBottom: '0.8rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {note.content.replace(/[#*`]/g, '')}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.8rem' }}>
                    <span style={catBadge}>{note.category}</span>
                    {note.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={tagBadge}>#{tag}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{timeAgo(note.updated_at)}</span>
                    {note.ai_summary && <Zap size={12} style={{ color: 'var(--accent)' }} title="Has AI summary" />}
                  </div>

                  {/* Dropdown menu */}
                  {menuOpen === note.id && (
                    <div onClick={e => e.stopPropagation()}
                      style={{ position: 'absolute', top: '2.5rem', right: '0.75rem', background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '0.4rem', zIndex: 10, minWidth: '160px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                      <button onClick={() => { shareNote(note.id); setMenuOpen(null); }} style={dropItem}>
                        <Share2 size={13} /> Share & copy link
                      </button>
                      <button onClick={() => { archiveNote(note.id, note.is_archived); setMenuOpen(null); }} style={dropItem}>
                        <Archive size={13} /> {note.is_archived ? 'Unarchive' : 'Archive'}
                      </button>
                      <div style={{ borderTop: '1px solid var(--border)', margin: '0.3rem 0' }} />
                      <button onClick={() => { deleteNote(note.id); setMenuOpen(null); }} style={{ ...dropItem, color: 'var(--red)' }}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const navBtnStyle = (active) => ({
  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
  padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.875rem',
  color: active ? 'var(--text)' : 'var(--text2)',
  background: active ? 'var(--bg4)' : 'transparent',
  fontWeight: active ? '500' : '400', cursor: 'pointer', textAlign: 'left',
  transition: 'all 0.15s', marginBottom: '2px'
});

const catBadge = {
  fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px',
  background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: '500'
};

const tagBadge = {
  fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px',
  background: 'var(--bg4)', color: 'var(--text3)'
};

const dropItem = {
  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
  padding: '0.5rem 0.6rem', borderRadius: '6px', fontSize: '0.82rem',
  color: 'var(--text2)', background: 'transparent', cursor: 'pointer', textAlign: 'left',
  transition: 'background 0.15s'
};