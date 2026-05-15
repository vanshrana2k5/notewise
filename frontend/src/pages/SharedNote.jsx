import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Zap, Calendar, Tag, CheckSquare } from 'lucide-react';
import api from '../utils/api';

export default function SharedNote() {
  const { shareId } = useParams();
  const [note, setNote] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/shared/${shareId}`)
      .then(res => setNote(res.data.note))
      .catch(() => setError(true));
  }, [shareId]);

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--text3)' }}>
      <span style={{ fontSize: '2rem' }}>🔒</span>
      <h2 style={{ color: 'var(--text)' }}>Note not found</h2>
      <p style={{ fontSize: '0.9rem' }}>This note may have been unshared or doesn't exist.</p>
    </div>
  );

  if (!note) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>Loading...</div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2.5rem', color: 'var(--text3)', fontSize: '0.85rem' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={13} color="#fff" fill="#fff" />
          </div>
          NoteWise · Shared Note
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '1rem', lineHeight: 1.3 }}>{note.title}</h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: 'var(--text3)' }}>
            <Calendar size={13} /> {new Date(note.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>by {note.author_name}</span>
          {note.tags.map(tag => (
            <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.78rem', padding: '0.2rem 0.6rem', background: 'var(--bg3)', borderRadius: '5px', color: 'var(--text2)' }}>
              <Tag size={10} /> {tag}
            </span>
          ))}
        </div>

        {/* AI Summary (if available) */}
        {note.ai_summary && (
          <div style={{ background: 'var(--accent-soft)', border: '1px solid rgba(124,106,247,0.25)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
              <Zap size={12} fill="currentColor" /> AI Summary
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text2)', lineHeight: 1.7 }}>{note.ai_summary}</p>

            {note.ai_action_items?.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--accent)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
                  <CheckSquare size={12} /> Action Items
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {note.ai_action_items.map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.86rem', color: 'var(--text2)' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: '600', flexShrink: 0 }}>{i + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.85, whiteSpace: 'pre-wrap', fontFamily: "'DM Sans', sans-serif" }}>
          {note.content || <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>No content.</span>}
        </div>
      </div>
    </div>
  );
}