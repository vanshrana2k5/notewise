import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Zap, Share2, Archive, Tag, X, Loader2, ChevronDown } from 'lucide-react';
import api from '../utils/api';
import AIPanel from '../components/AIPanel';

const CATEGORIES = ['General', 'Work', 'Personal', 'Ideas', 'Research', 'Journal'];

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showCatMenu, setShowCatMenu] = useState(false);
  const saveTimer = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    api.get(`/notes/${id}`)
      .then(res => { setNote(res.data.note); setLoading(false); })
      .catch(() => { toast.error('Note not found'); navigate('/'); });
  }, [id]);

  const autoSave = useCallback((updatedNote) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await api.patch(`/notes/${updatedNote.id}`, {
          title: updatedNote.title,
          content: updatedNote.content,
          tags: updatedNote.tags,
          category: updatedNote.category
        });
      } catch {
        toast.error('Auto-save failed');
      } finally {
        setSaving(false);
      }
    }, 800);
  }, []);

  const update = (fields) => {
    const updated = { ...note, ...fields };
    setNote(updated);
    autoSave(updated);
  };

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (newTag && !note.tags.includes(newTag)) {
        update({ tags: [...note.tags, newTag] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => update({ tags: note.tags.filter(t => t !== tag) });

  const generateAI = async () => {
    setAiLoading(true);
    setShowAI(true);
    try {
      const res = await api.post(`/notes/${id}/generate-summary`);
      setNote(prev => ({
        ...prev,
        ai_summary: res.data.insights.summary,
        ai_action_items: res.data.insights.action_items,
        ai_suggested_title: res.data.insights.suggested_title
      }));
      toast.success('AI insights generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const shareNote = async () => {
    try {
      const res = await api.post(`/notes/${id}/share`);
      await navigator.clipboard.writeText(res.data.share_url);
      toast.success('Share link copied!');
    } catch {
      toast.error('Share failed');
    }
  };

  const archiveNote = async () => {
    await api.patch(`/notes/${id}`, { is_archived: !note.is_archived });
    toast.success(note.is_archived ? 'Unarchived' : 'Archived');
    navigate('/');
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text3)' }}>
      Loading note...
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Editor Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text2)', padding: '0.4rem 0.6rem', borderRadius: '7px', fontSize: '0.85rem', cursor: 'pointer' }}>
            <ArrowLeft size={15} /> Back
          </button>

          <div style={{ flex: 1 }} />

          <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
            {saving ? 'Saving...' : 'Saved'}
          </span>

          {/* Category */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowCatMenu(p => !p)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.4rem 0.75rem', background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '0.82rem', color: 'var(--text2)', cursor: 'pointer' }}>
              {note.category} <ChevronDown size={12} />
            </button>
            {showCatMenu && (
              <div style={{ position: 'absolute', top: '110%', right: 0, background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '0.4rem', zIndex: 20, minWidth: '140px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { update({ category: cat }); setShowCatMenu(false); }}
                    style={{ display: 'block', width: '100%', padding: '0.45rem 0.65rem', textAlign: 'left', fontSize: '0.85rem', color: note.category === cat ? 'var(--accent)' : 'var(--text2)', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={shareNote} style={toolBtn}><Share2 size={15} /> Share</button>
          <button onClick={archiveNote} style={toolBtn}><Archive size={15} /></button>
          <button onClick={generateAI} disabled={aiLoading}
            style={{ ...toolBtn, background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid rgba(124,106,247,0.3)' }}>
            {aiLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={15} />}
            {aiLoading ? 'Analyzing...' : 'AI Insights'}
          </button>
        </div>

        {/* Note Editor */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 3rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}
          onClick={() => setShowCatMenu(false)}>
          <input
            ref={titleRef}
            value={note.title}
            onChange={e => update({ title: e.target.value })}
            placeholder="Note title..."
            style={{ width: '100%', fontSize: '1.75rem', fontWeight: '600', background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', marginBottom: '1.25rem', letterSpacing: '-0.5px' }}
          />

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            {note.tags.map(tag => (
              <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: '5px', background: 'var(--bg4)', color: 'var(--text2)' }}>
                #{tag}
                <button onClick={() => removeTag(tag)} style={{ color: 'var(--text3)', display: 'flex', cursor: 'pointer' }}><X size={11} /></button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder={note.tags.length === 0 ? '+ add tag, press Enter' : '+ tag'}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text2)', fontSize: '0.78rem', width: '130px', padding: '0.2rem 0.3rem' }}
            />
          </div>

          <textarea
            value={note.content}
            onChange={e => update({ content: e.target.value })}
            placeholder="Start writing your note... You can use Markdown syntax."
            style={{ width: '100%', minHeight: '60vh', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '1rem', lineHeight: '1.8', resize: 'none', fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
      </div>

      {/* AI Panel */}
      {showAI && (
        <AIPanel
          note={note}
          onClose={() => setShowAI(false)}
          onApplyTitle={(t) => update({ title: t })}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const toolBtn = {
  display: 'flex', alignItems: 'center', gap: '5px', padding: '0.4rem 0.75rem',
  background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: '7px',
  fontSize: '0.82rem', color: 'var(--text2)', cursor: 'pointer'
};