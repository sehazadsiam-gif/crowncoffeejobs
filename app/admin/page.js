'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

const ADMIN_PASS = 'ccadmin6789';

export default function AdminPage() {
    const [auth, setAuth] = useState(false);
    const [pass, setPass] = useState('');
    const [passErr, setPassErr] = useState('');
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');
    const [selectedApp, setSelectedApp] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const fetchData = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            let query = supabase.from('applicants').select('*').order(sortField, { ascending: sortDir === 'asc' });
            if (dateFrom) query = query.gte('created_at', new Date(dateFrom).toISOString());
            if (dateTo) {
                const to = new Date(dateTo);
                to.setHours(23, 59, 59, 999);
                query = query.lte('created_at', to.toISOString());
            }
            if (deptFilter !== 'all') query = query.eq('department', deptFilter);
            const { data, error } = await query;
            if (error) throw error;
            setApplicants(data || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, [dateFrom, dateTo, deptFilter, sortField, sortDir]);

    useEffect(() => { if (auth) fetchData(); }, [auth, fetchData]);

    function handleLogin(e) {
        e.preventDefault();
        if (pass === ADMIN_PASS) { setAuth(true); setPassErr(''); }
        else setPassErr('Wrong password');
    }

    function toggleSort(field) {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('desc'); }
    }

    function formatDate(d) {
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    const filtered = applicants.filter(a => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return a.name?.toLowerCase().includes(s) || a.contact?.includes(s) || a.position?.toLowerCase().includes(s) || a.current_workplace?.toLowerCase().includes(s);
    });

    const stats = {
        total: filtered.length,
        kitchen: filtered.filter(a => a.department === 'kitchen').length,
        front: filtered.filter(a => a.department === 'front').length,
        today: filtered.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length,
    };

    if (!mounted) return null;

    if (!auth) {
        return (
            <main style={{ minHeight: '100vh', minHeight: '100dvh', background: 'linear-gradient(160deg, #F5F0E8 0%, #EDE7DB 50%, #F5F0E8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
                <div style={{ width: '100%', maxWidth: 400, animation: 'fadeUp 0.6s ease forwards' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1A1A1A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 16px', fontWeight: 700 }}>C</div>
                        <h1 style={{ fontFamily: "'Merriweather', serif", fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>Admin Panel</h1>
                        <p style={{ color: '#888', fontSize: 14 }}>Crown Coffee Recruitment</p>
                    </div>
                    <form onSubmit={handleLogin} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 20, padding: 'clamp(1.25rem, 5vw, 2rem)', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', letterSpacing: '0.5px', marginBottom: 8 }}>Password</label>
                        <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Enter admin password"
                            style={{ width: '100%', height: 50, padding: '0 16px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, fontSize: 16, fontFamily: "'Outfit', sans-serif", outline: 'none', color: '#1A1A1A', marginBottom: 12, WebkitAppearance: 'none' }} />
                        {passErr && <p style={{ color: '#D63031', fontSize: 13, marginBottom: 12 }}>{passErr}</p>}
                        <button type="submit" style={{ width: '100%', height: 50, background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'all 0.3s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#B07A1A'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#1A1A1A'; }}>
                            Sign In
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', minHeight: '100dvh', background: 'linear-gradient(160deg, #F5F0E8 0%, #EDE7DB 50%, #F5F0E8 100%)', fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 3vw, 1.5rem) 4rem' }}>

                {/* Header */}
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', animation: 'fadeIn 0.5s ease', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontFamily: "'Merriweather', serif", fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#1A1A1A' }}>Dashboard</h1>
                        <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Crown Coffee Recruitment</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <a href="https://www.crowncoffeebangladesh.xyz/admin" target="_blank" rel="noopener noreferrer" style={{ padding: '8px 20px', background: '#1A1A1A', border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#fff', fontFamily: "'Outfit', sans-serif", textDecoration: 'none', transition: 'all 0.2s', minHeight: 40, display: 'inline-flex', alignItems: 'center' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#B07A1A'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#1A1A1A'; }}>
                            Main Admin ↗
                        </a>
                        <button onClick={() => { setAuth(false); setPass(''); }} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#555', fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s', minHeight: 40 }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#D63031'; e.currentTarget.style.color = '#D63031'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#555'; }}>
                            Logout
                        </button>
                    </div>
                </header>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: '1.5rem', animation: 'fadeUp 0.5s ease' }}>
                    {[
                        { label: 'Total', value: stats.total, color: '#1A1A1A' },
                        { label: 'Kitchen', value: stats.kitchen, color: '#B07A1A' },
                        { label: 'Front Service', value: stats.front, color: '#2D7D46' },
                        { label: 'Today', value: stats.today, color: '#2563EB' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 16, padding: 'clamp(14px, 3vw, 18px) clamp(14px, 3vw, 20px)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                            <div style={{ fontSize: 11, color: '#888', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 6 }}>{s.label}</div>
                            <div style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, color: s.color }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 16, padding: 'clamp(12px, 3vw, 16px) clamp(12px, 3vw, 20px)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', animation: 'fadeUp 0.6s ease 0.1s both', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                    <FilterInput type="text" placeholder="Search name, contact, position…" value={searchTerm} onChange={setSearchTerm} label="Search" />
                    <FilterInput type="date" value={dateFrom} onChange={setDateFrom} label="From" />
                    <FilterInput type="date" value={dateTo} onChange={setDateTo} label="To" />
                    <div>
                        <span style={{ fontSize: 11, color: '#888', fontWeight: 600, display: 'block', marginBottom: 4, letterSpacing: '0.5px' }}>Dept</span>
                        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ height: 42, padding: '0 12px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, fontSize: 14, fontFamily: "'Outfit', sans-serif", color: '#1A1A1A', outline: 'none', cursor: 'pointer', minWidth: 120 }}>
                            <option value="all">All</option>
                            <option value="kitchen">Kitchen</option>
                            <option value="front">Front Service</option>
                        </select>
                    </div>
                    <button onClick={fetchData} style={{ height: 42, padding: '0 20px', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'all 0.3s', alignSelf: 'flex-end' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#B07A1A'}
                        onMouseLeave={e => e.currentTarget.style.background = '#1A1A1A'}>
                        Refresh
                    </button>
                </div>

                {/* Table */}
                <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', animation: 'fadeUp 0.7s ease 0.15s both' }}>
                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>Loading…</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#888' }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                            <div style={{ fontSize: 15, fontWeight: 500 }}>No applications found</div>
                            <div style={{ fontSize: 13, marginTop: 4 }}>Try changing your filters</div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                        {[
                                            { key: 'name', label: 'Name' },
                                            { key: 'contact', label: 'Contact' },
                                            { key: 'department', label: 'Dept' },
                                            { key: 'position', label: 'Position' },
                                            { key: 'current_workplace', label: 'Workplace' },
                                            { key: 'created_at', label: 'Date' },
                                            { key: 'cv', label: 'CV' },
                                        ].map(col => (
                                            <th key={col.key} onClick={() => col.key !== 'cv' && toggleSort(col.key)} style={{ padding: '14px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.8px', textTransform: 'uppercase', cursor: col.key !== 'cv' ? 'pointer' : 'default', whiteSpace: 'nowrap', userSelect: 'none', transition: 'color 0.2s' }}
                                                onMouseEnter={e => { if (col.key !== 'cv') e.currentTarget.style.color = '#1A1A1A'; }}
                                                onMouseLeave={e => { if (col.key !== 'cv') e.currentTarget.style.color = '#888'; }}>
                                                {col.label} {sortField === col.key && (sortDir === 'asc' ? '↑' : '↓')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((a, i) => (
                                        <tr key={a.id || i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'background 0.15s', cursor: 'pointer' }}
                                            onClick={() => setSelectedApp(a)}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,146,42,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '14px 14px', fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap' }}>{a.name}</td>
                                            <td style={{ padding: '14px 14px', color: '#555', whiteSpace: 'nowrap' }}>{a.contact}</td>
                                            <td style={{ padding: '14px 14px' }}>
                                                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 600, letterSpacing: '0.3px', background: a.department === 'kitchen' ? 'rgba(176,122,26,0.1)' : 'rgba(39,174,96,0.08)', color: a.department === 'kitchen' ? '#8A5E12' : '#1B7A3D' }}>
                                                    {a.department === 'kitchen' ? 'Kitchen' : 'Front'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 14px', color: '#555' }}>{a.position}</td>
                                            <td style={{ padding: '14px 14px', color: '#888', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.current_workplace}</td>
                                            <td style={{ padding: '14px 14px', color: '#888', whiteSpace: 'nowrap', fontSize: 12 }}>{formatDate(a.created_at)}</td>
                                            <td style={{ padding: '14px 14px' }}>
                                                {a.cv_url ? (
                                                    <a href={a.cv_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 14px', background: '#1A1A1A', color: '#fff', borderRadius: 50, fontSize: 11, fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#B07A1A'}
                                                        onMouseLeave={e => e.currentTarget.style.background = '#1A1A1A'}>
                                                        View ↗
                                                    </a>
                                                ) : <span style={{ color: '#ccc', fontSize: 12 }}>—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                {selectedApp && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.2s ease' }}
                        onClick={() => setSelectedApp(null)}>
                        <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, padding: 'clamp(1.25rem, 5vw, 2rem)', maxWidth: 480, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.15)', animation: 'fadeUp 0.3s ease', maxHeight: '90vh', maxHeight: '90dvh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontFamily: "'Merriweather', serif", fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 700, color: '#1A1A1A' }}>Application Details</h2>
                                <button onClick={() => setSelectedApp(null)} style={{ width: 38, height: 38, borderRadius: 50, border: '1px solid rgba(0,0,0,0.08)', background: '#fff', cursor: 'pointer', fontSize: 16, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
                            </div>
                            {[
                                ['Name', selectedApp.name],
                                ['Contact', selectedApp.contact],
                                ['Department', selectedApp.department === 'kitchen' ? 'Kitchen' : 'Front Service'],
                                ['Position', selectedApp.position],
                                ['Current Workplace', selectedApp.current_workplace],
                                ['Language', selectedApp.lang === 'bn' ? 'Bangla' : 'English'],
                                ['Applied', formatDate(selectedApp.created_at)],
                            ].map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', gap: 16 }}>
                                    <span style={{ fontSize: 13, color: '#888', fontWeight: 500, flexShrink: 0 }}>{label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', textAlign: 'right', wordBreak: 'break-word' }}>{val}</span>
                                </div>
                            ))}
                            {selectedApp.cv_url && (
                                <a href={selectedApp.cv_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: '1.5rem', padding: '14px', background: '#1A1A1A', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.3s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#B07A1A'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#1A1A1A'}>
                                    Download CV ↗
                                </a>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}

function FilterInput({ type, placeholder, value, onChange, label }) {
    return (
        <div style={{ flex: '1 1 150px', minWidth: 0 }}>
            {label && <span style={{ fontSize: 11, color: '#888', fontWeight: 600, display: 'block', marginBottom: 4, letterSpacing: '0.5px' }}>{label}</span>}
            <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
                style={{ height: 42, width: '100%', padding: '0 12px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, fontSize: 14, fontFamily: "'Outfit', sans-serif", color: '#1A1A1A', outline: 'none', WebkitAppearance: 'none' }} />
        </div>
    );
}