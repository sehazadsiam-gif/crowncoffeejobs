'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabase';

const POSITIONS = {
  kitchen: ['Head Chef', 'Commi 1', 'Commi 2', 'Commi 3', 'Pickupman', 'Dishwasher'],
  front: ['Manager', 'Supervisor', 'Senior Waiter', 'Jr Waiter', 'Cleaner'],
};

const TEXT = {
  bn: {
    headline: 'আপনার যাত্রা শুরু হোক',
    sub: 'Crown Coffee পরিবারে যোগ দিন',
    secDept: 'বিভাগ',
    kitchen: 'রান্নাঘর',
    kitchenSub: 'Head Chef · Commi · Pickupman · Dishwasher',
    front: 'ফ্রন্ট সার্ভিস',
    frontSub: 'Manager · Supervisor · Waiter · Cleaner',
    secPosition: 'পদ',
    posHint: 'প্রথমে বিভাগ নির্বাচন করুন',
    secInfo: 'ব্যক্তিগত তথ্য',
    lblName: 'পূর্ণ নাম',
    lblContact: 'যোগাযোগ নম্বর',
    lblWorkplace: 'বর্তমান কর্মস্থল',
    phName: 'আপনার পূর্ণ নাম লিখুন',
    phContact: '01XXXXXXXXX',
    phWorkplace: 'বর্তমানে কোথায় কাজ করছেন?',
    secCV: 'সিভি আপলোড',
    uploadTitle: 'ক্লিক করুন অথবা ফাইল টেনে আনুন',
    uploadHint: 'PDF · JPG · PNG — সর্বোচ্চ ১০০ MB',
    btnText: 'আবেদন জমা দিন',
    sending: 'জমা হচ্ছে…',
    successTitle: 'আবেদন সফল!',
    successMsg: '৭ দিনের মধ্যে আপনার সাথে যোগাযোগ করা হবে এবং Crown Coffee-তে সরাসরি সাক্ষাৎকারের জন্য ডাকা হবে।',
    again: 'নতুন আবেদন করুন',
    errFill: 'সকল তথ্য পূরণ করুন।',
    errFile: 'সিভি আপলোড করুন।',
    errSize: 'ফাইল ১০০ MB-এর বেশি হবে না।',
    errType: 'শুধু PDF, JPG, PNG গ্রহণযোগ্য।',
    errSubmit: 'সমস্যা হয়েছে। আবার চেষ্টা করুন।',
  },
  en: {
    headline: 'Begin Your Journey',
    sub: 'Join the Crown Coffee family',
    secDept: 'Department',
    kitchen: 'Kitchen',
    kitchenSub: 'Head Chef · Commi · Pickupman · Dishwasher',
    front: 'Front Service',
    frontSub: 'Manager · Supervisor · Waiter · Cleaner',
    secPosition: 'Position',
    posHint: 'Select a department first',
    secInfo: 'Personal Info',
    lblName: 'Full Name',
    lblContact: 'Contact Number',
    lblWorkplace: 'Current Workplace',
    phName: 'Enter your full name',
    phContact: '01XXXXXXXXX',
    phWorkplace: 'Where do you currently work?',
    secCV: 'Upload CV',
    uploadTitle: 'Click or drag file here',
    uploadHint: 'PDF · JPG · PNG — Max 100 MB',
    btnText: 'Submit Application',
    sending: 'Submitting…',
    successTitle: 'Application Sent!',
    successMsg: 'আপনার আবেদন গ্রহণ করা হয়েছে। ৭ দিনের মধ্যে যোগাযোগ করা হবে এবং Crown Coffee-তে সরাসরি সাক্ষাৎকারের জন্য ডাকা হবে।',
    again: 'Submit Another',
    errFill: 'Fill in all required fields.',
    errFile: 'Please upload your CV.',
    errSize: 'Max file size is 100 MB.',
    errType: 'Only PDF, JPG, PNG accepted.',
    errSubmit: 'Something went wrong. Try again.',
  },
};

export default function HomePage() {
  const [lang, setLang] = useState('bn');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => setMounted(true), []);

  const c = TEXT[lang];

  function selectDept(d) { setDepartment(d); setPosition(''); }

  function handleFile(f) {
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|jpe?g|png)$/i)) { setErrMsg(c.errType); return; }
    if (f.size > 100 * 1024 * 1024) { setErrMsg(c.errSize); return; }
    setErrMsg(''); setFile(f);
  }

  async function handleSubmit() {
    if (!department || !position || !name || !contact || !workplace) { setErrMsg(c.errFill); return; }
    if (!file) { setErrMsg(c.errFile); return; }
    setErrMsg(''); setStatus('sending');
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      // Sanitize name: keep only ASCII alphanumeric, hyphens; replace everything else with underscores
      const safeName = name
        .replace(/[^a-zA-Z0-9\-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
      const baseName = safeName || 'cv';
      const fileName = Date.now() + '_' + baseName + '.' + ext;
      if (supabase) {
        const { error: uploadError } = await supabase.storage.from('cvs').upload(fileName, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(fileName);
        const { error: insertError } = await supabase.from('applicants').insert({ name, contact, current_workplace: workplace, department, position, cv_url: urlData.publicUrl, lang });
        if (insertError) throw insertError;
      }
      setStatus('success');
    } catch (err) {
      console.error('[Crown Coffee Submit Error]', err?.message || err);
      setErrMsg(c.errSubmit);
      setStatus('idle');
    }
  }

  function resetForm() { setDepartment(''); setPosition(''); setName(''); setContact(''); setWorkplace(''); setFile(null); setStatus('idle'); setErrMsg(''); }

  if (!mounted) return null;

  if (status === 'success') {
    return (
      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F0E8 0%, #EDE7DB 50%, #F5F0E8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', animation: 'fadeUp 0.7s ease forwards', maxWidth: 440 }}>
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 2rem' }}>
            <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px solid var(--gold-soft)', opacity: 0.4, animation: 'pulse-ring 2s ease-out infinite' }} />
            <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', border: '1px solid var(--gold-soft)', opacity: 0.2, animation: 'pulse-ring 2s ease-out 0.4s infinite' }} />
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(200,146,42,0.15), rgba(200,146,42,0.05))', border: '2px solid var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: 'var(--gold-deep)', backdropFilter: 'blur(10px)' }}>✓</div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 12 }}>{c.successTitle}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: '3rem', lineHeight: 1.6 }}>{c.successMsg}</p>
          <button onClick={resetForm} style={{ padding: '14px 40px', background: 'var(--charcoal)', color: 'var(--white)', border: 'none', borderRadius: 50, fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.3s', letterSpacing: '0.5px' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(176,122,26,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--charcoal)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            {c.again}
          </button>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: '3rem' }}>01771784474 · Sector-13, Uttara</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F0E8 0%, #EDE7DB 50%, #F5F0E8 100%)', position: 'relative' }}>

      {/* Decorative background blobs */}
      <div style={{ position: 'fixed', top: -200, right: -150, width: 500, height: 500, background: 'radial-gradient(circle, rgba(200,146,42,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -200, left: -100, width: 450, height: 450, background: 'radial-gradient(circle, rgba(200,146,42,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: '40%', left: '60%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(200,146,42,0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 1.25rem 4rem', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 0 1rem', animation: 'fadeIn 0.5s ease forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <Image src="/logo.png" alt="Crown Coffee" width={44} height={44} style={{ borderRadius: '50%', display: 'block' }} />
              <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: '1.5px solid rgba(200,146,42,0.3)', pointerEvents: 'none' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1.2, letterSpacing: '-0.3px' }}>Crown Coffee</div>
              <div style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600, marginTop: 1 }}>Multi Cuisine Café</div>
            </div>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200,146,42,0.2)', borderRadius: 50, padding: 3, gap: 2 }}>
            {['bn', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '6px 18px', border: 'none', borderRadius: 50,
                background: lang === l ? 'var(--charcoal)' : 'transparent',
                color: lang === l ? 'var(--white)' : 'var(--text-secondary)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)', transition: 'all 0.3s',
                letterSpacing: '0.5px',
              }}>{l === 'bn' ? 'বাংলা' : 'English'}</button>
            ))}
          </div>
        </header>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '3rem 0 2.5rem', animation: 'fadeUp 0.6s ease forwards' }}>
          <div style={{ display: 'inline-block', padding: '6px 20px', background: 'rgba(200,146,42,0.1)', borderRadius: 50, marginBottom: '1.5rem', border: '1px solid rgba(200,146,42,0.15)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold-deep)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {lang === 'bn' ? 'ক্যারিয়ার' : 'Careers'}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>{c.headline}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>{c.sub}</p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.5)',
          borderRadius: 24,
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
          animation: 'fadeUp 0.7s ease 0.1s both forwards',
        }}>

          {/* --- DEPARTMENT --- */}
          <SectionLabel text={c.secDept} step="01" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            {[['kitchen', '🍳', c.kitchen, c.kitchenSub], ['front', '☕', c.front, c.frontSub]].map(([key, icon, label, sub]) => {
              const active = department === key;
              return (
                <button key={key} onClick={() => selectDept(key)} style={{
                  position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  gap: 6, padding: '18px 18px 14px', textAlign: 'left',
                  background: active ? 'rgba(200,146,42,0.08)' : 'rgba(255,255,255,0.6)',
                  border: active ? '1.5px solid var(--gold-soft)' : '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 16, cursor: 'pointer', transition: 'all 0.3s ease',
                  fontFamily: 'var(--font-body)', overflow: 'hidden',
                  boxShadow: active ? '0 4px 20px rgba(200,146,42,0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                  transform: active ? 'scale(1.02)' : 'scale(1)',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(200,146,42,0.3)'; e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; } }}
                >
                  {active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--gold-soft), var(--gold))', borderRadius: '3px 3px 0 0' }} />}
                  <span style={{ fontSize: 28 }}>{icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: active ? 'var(--gold-deep)' : 'var(--charcoal)' }}>{label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{sub}</span>
                </button>
              );
            })}
          </div>

          {/* --- POSITION --- */}
          <SectionLabel text={c.secPosition} step="02" />
          <div style={{ marginBottom: 28, minHeight: 44 }}>
            {department ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, animation: 'slideDown 0.3s ease forwards' }}>
                {POSITIONS[department].map(pos => {
                  const active = position === pos;
                  return (
                    <button key={pos} onClick={() => setPosition(pos)} style={{
                      padding: '9px 18px',
                      background: active ? 'var(--charcoal)' : 'rgba(255,255,255,0.7)',
                      border: active ? '1px solid var(--charcoal)' : '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 50, color: active ? 'var(--white)' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      fontFamily: 'var(--font-body)', transition: 'all 0.25s',
                      letterSpacing: '0.2px',
                    }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.color = 'var(--charcoal)'; } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                    >{pos}</button>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '10px 0' }}>{c.posHint}</p>
            )}
          </div>

          <Divider />

          {/* --- PERSONAL INFO --- */}
          <SectionLabel text={c.secInfo} step="03" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
            <InputField label={c.lblName} placeholder={c.phName} value={name} onChange={setName} />
            <InputField label={c.lblContact} placeholder={c.phContact} value={contact} onChange={setContact} type="tel" />
            <InputField label={c.lblWorkplace} placeholder={c.phWorkplace} value={workplace} onChange={setWorkplace} />
          </div>

          <Divider />

          {/* --- CV UPLOAD --- */}
          <SectionLabel text={c.secCV} step="04" />
          <div
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            style={{
              border: dragOver ? '2px solid var(--gold-soft)' : file ? '2px solid var(--success)' : '2px dashed rgba(0,0,0,0.1)',
              borderRadius: 16, padding: file ? '20px' : '36px 20px',
              textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'rgba(200,146,42,0.06)' : file ? 'rgba(39,174,96,0.04)' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.3s', marginBottom: 24, position: 'relative',
            }}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(39,174,96,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>✓</div>
                <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--charcoal)', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                </div>
                <button onClick={e => { e.stopPropagation(); setFile(null); }} style={{ width: 32, height: 32, borderRadius: 50, border: '1px solid rgba(0,0,0,0.08)', background: 'var(--white)', cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>✕</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 28, marginBottom: 10, animation: 'float 3s ease-in-out infinite', color: 'var(--text-muted)' }}>↑</div>
                <div style={{ color: 'var(--text-main)', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{c.uploadTitle}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.uploadHint}</div>
              </>
            )}
          </div>

          {/* Error */}
          {errMsg && (
            <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(214,48,49,0.06)', border: '1px solid rgba(214,48,49,0.15)', color: 'var(--danger)', fontSize: 13, marginBottom: 20, fontFamily: 'var(--font-body)', animation: 'slideDown 0.3s ease forwards', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>!</span>
              {errMsg}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={status === 'sending'} style={{
            width: '100%', height: 56,
            background: status === 'sending' ? 'var(--gray-400)' : 'var(--charcoal)',
            color: 'var(--white)', border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-body)',
            cursor: status === 'sending' ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            letterSpacing: '0.3px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}
            onMouseEnter={e => { if (status !== 'sending') { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(176,122,26,0.35)'; } }}
            onMouseLeave={e => { if (status !== 'sending') { e.currentTarget.style.background = 'var(--charcoal)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; } }}>
            {status === 'sending' ? (
              <><span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--white)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />{c.sending}</>
            ) : (<>{c.btnText}<span style={{ fontSize: 18, transition: 'transform 0.3s' }}>→</span></>)}
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem', animation: 'fadeIn 0.8s ease 0.3s both forwards' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.5px' }}>01771784474 · 6, Shah Makdum Avenue, Sector-13, Uttara</p>
        </div>
      </div>
    </main>
  );
}

function SectionLabel({ text, step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 50, background: 'var(--charcoal)', color: 'var(--white)', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-body)', flexShrink: 0, letterSpacing: '0.5px' }}>{step}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--charcoal)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>{text}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'linear-gradient(to right, rgba(0,0,0,0.06), rgba(0,0,0,0.02), transparent)', margin: '4px 0 28px' }} />;
}

function InputField({ label, placeholder, value, onChange, type = 'text' }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: focused ? 'var(--gold-deep)' : 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: 8, fontFamily: "'Outfit', sans-serif", transition: 'color 0.2s' }}>
        {label} <span style={{ color: 'var(--danger)', fontWeight: 400 }}>*</span>
      </label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 48, padding: '0 16px',
          background: focused ? 'var(--white)' : 'rgba(255,255,255,0.6)',
          border: focused ? '1.5px solid var(--gold-soft)' : '1px solid rgba(0,0,0,0.07)',
          borderRadius: 12, color: 'var(--text-main)', fontSize: 14,
          fontFamily: 'var(--font-body)', outline: 'none',
          transition: 'all 0.25s ease',
          boxShadow: focused ? '0 0 0 4px rgba(200,146,42,0.1)' : 'none',
        }} />
    </div>
  );
}