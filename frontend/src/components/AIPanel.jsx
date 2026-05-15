import { X, Zap, CheckSquare, Lightbulb, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AIPanel({ note, onClose, onApplyTitle }) {
  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    <aside style={{ width: '340px', background: 'var(--bg2)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
          <Zap size={16} fill="currentColor" />
          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>AI Insights</span>
        </div>
        <button onClick={onClose} style={{ color: 'var(--text3)', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        {!note.ai_summary ? (
          <div style={{ textAlign: 'center', color: 'var(--text3)', paddingTop: '3rem' }}>
            <Zap size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.85rem' }}>Click "AI Insights" in the toolbar to analyze this note</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Summary */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <h3 style={sectionTitle}><Lightbulb size={13} /> Summary</h3>
                <button onClick={() => copy(note.ai_summary)} style={iconBtn}><Copy size={12} /></button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.7, background: 'var(--bg3)', padding: '0.9rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                {note.ai_summary}
              </p>
            </div>

            {/* Suggested Title */}
            {note.ai_suggested_title && note.ai_suggested_title !== note.title && (
              <div>
                <h3 style={{ ...sectionTitle, marginBottom: '0.6rem' }}>💡 Suggested Title</h3>
                <div style={{ background: 'var(--bg3)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontStyle: 'italic' }}>"{note.ai_suggested_title}"</span>
                  <button onClick={() => { onApplyTitle(note.ai_suggested_title); toast.success('Title applied!'); }}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: '5px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* Action Items */}
            {note.ai_action_items?.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <h3 style={sectionTitle}><CheckSquare size={13} /> Action Items</h3>
                  <button onClick={() => copy(note.ai_action_items.map((a, i) => `${i + 1}. ${a}`).join('\n'))} style={iconBtn}><Copy size={12} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {note.ai_action_items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.65rem 0.85rem', background: 'var(--bg3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: '600', fontSize: '0.8rem', marginTop: '1px', flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text2)', lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

const sectionTitle = {
  display: 'flex', alignItems: 'center', gap: '5px',
  fontSize: '0.78rem', fontWeight: '600', color: 'var(--text3)',
  textTransform: 'uppercase', letterSpacing: '0.07em'
};

const iconBtn = {
  color: 'var(--text3)', padding: '3px', cursor: 'pointer',
  borderRadius: '4px', display: 'flex', alignItems: 'center'
};