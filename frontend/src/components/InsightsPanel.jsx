import { useEffect, useState } from 'react';
import { FileText, Archive, Globe, Zap, TrendingUp } from 'lucide-react';
import api from '../utils/api';

export default function InsightsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/insights').then(res => { setData(res.data); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', color: 'var(--text3)', paddingTop: '4rem' }}>Loading insights...</div>;

  const maxWeek = Math.max(...data.weeklyActivity.map(d => d.count), 1);

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.5rem' }}>Workspace Insights</h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: FileText, label: 'Total Notes', value: data.stats.totalNotes, color: 'var(--accent)' },
          { icon: Archive, label: 'Archived', value: data.stats.archivedNotes, color: 'var(--text2)' },
          { icon: Globe, label: 'Public Shares', value: data.stats.publicNotes, color: 'var(--green)' },
          { icon: Zap, label: 'AI Calls', value: data.stats.aiUsage, color: 'var(--amber)' }
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <Icon size={18} style={{ color, marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: '600', letterSpacing: '-0.5px' }}>{value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '0.25rem' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Weekly Activity */}
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.25rem' }}>
            <TrendingUp size={15} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text2)' }}>Weekly Activity</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
            {data.weeklyActivity.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', background: d.count > 0 ? 'var(--accent)' : 'var(--bg4)', borderRadius: '4px 4px 2px 2px', height: `${Math.max((d.count / maxWeek) * 80, d.count > 0 ? 8 : 4)}px`, transition: 'height 0.3s', opacity: d.count > 0 ? 1 : 0.4 }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tags */}
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text2)', marginBottom: '1rem' }}>Top Tags</h2>
          {data.topTags.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>No tags yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {data.topTags.slice(0, 6).map(({ tag, count }) => (
                <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text2)', minWidth: '80px' }}>#{tag}</span>
                  <div style={{ flex: 1, height: '4px', background: 'var(--bg4)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--accent)', borderRadius: '2px', width: `${(count / data.topTags[0].count) * 100}%` }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text3)', minWidth: '20px', textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Notes */}
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
        <h2 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text2)', marginBottom: '1rem' }}>Recently Edited</h2>
        {data.recentNotes.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>No notes yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.recentNotes.map(n => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius)', background: 'var(--bg4)' }}>
                <span style={{ fontSize: '0.87rem', fontWeight: '500' }}>{n.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--accent-soft)', color: 'var(--accent)' }}>{n.category}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{new Date(n.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}