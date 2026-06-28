'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabase';

const POSITIONS = {
  kitchen: ['Head Chef', 'Commi 1', 'Commi 2', 'Commi 3', 'Pickupman', 'Dishwasher'],
  front: ['Manager', 'Supervisor', 'Senior Waiter', 'Jr Waiter', 'Cleaner'],
};

const TEXT = {
  bn: {
    headline: 'আপনার যাত্রা শুরু হোক',
    sub: 'Crown Coffee-তে যোগ দিন — স্বপ্নের ক্যারিয়ার গড়ুন',
    secDept: 'বিভাগ নির্বাচন করুন',
    kitchen: 'রান্নাঘর',
    kitchenSub: 'Head Chef · Commi · Pickupman · Dishwasher',
    front: 'ফ্রন্ট সার্ভিস',
    frontSub: 'Manager · Supervisor · Waiter · Cleaner',
    secPosition: 'পদ নির্বাচন করুন',
    posHint: 'আগে একটি বিভাগ নির্বাচন করুন',
    secInfo: 'ব্যক্তিগত তথ্য',
    lblName: 'পূর্ণ নাম',
    lblContact: 'যোগাযোগ নম্বর',
    lblWorkplace: 'বর্তমান কর্মস্থল',
    phName: 'আপনার পূর্ণ নাম',
    phContact: '01XXXXXXXXX',
    phWorkplace: 'বর্তমানে কোথায় কাজ করছেন?',
    secCV: 'সিভি আপলোড',
    uploadTitle: 'ফাইল টেনে আনুন অথবা ক্লিক করুন',
    uploadHint: 'PDF · JPG · PNG — সর্বোচ্চ ১০০ MB',
    btnText: 'আবেদন জমা দিন',
    sending: 'পাঠানো হচ্ছে…',
    successTitle: 'আবেদন সফল হয়েছে!',
    successMsg: 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
    again: 'নতুন আবেদন',
    errFill: 'অনুগ্রহ করে সকল তথ্য পূরণ করুন।',
    errFile: 'সিভি আপলোড করুন।',
    errSize: 'ফাইলের সাইজ ১০০ MB-এর বেশি হবে না।',
    errType: 'শুধুমাত্র PDF, JPG, JPEG, PNG ফাইল গ্রহণযোগ্য।',
    errSubmit: 'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।',
  },
  en: {
    headline: 'Begin Your Journey',
    sub: 'Join Crown Coffee — Build a career worth celebrating',
    secDept: 'Select Department',
    kitchen: 'Kitchen',
    kitchenSub: 'Head Chef · Commi · Pickupman · Dishwasher',
    front: 'Front Service',
    frontSub: 'Manager · Supervisor · Waiter · Cleaner',
    secPosition: 'Select Position',
    posHint: 'Please select a department first',
    secInfo: 'Personal Information',
    lblName: 'Full Name',
    lblContact: 'Contact Number',
    lblWorkplace: 'Current Workplace',
    phName: 'Your full name',
    phContact: '01XXXXXXXXX',
    phWorkplace: 'Where do you currently work?',
    secCV: 'CV Upload',
    uploadTitle: 'Drag & drop or click to upload',
    uploadHint: 'PDF · JPG · PNG — Max 100 MB',
    btnText: 'Submit Application',
    sending: 'Sending…',
    successTitle: 'Application Submitted!',
    successMsg: "We'll be in touch with you shortly.",
    again: 'New Application',
    errFill: 'Please fill in all required fields.',
    errFile: 'Please upload your CV.',
    errSize: 'File size must not exceed 100 MB.',
    errType: 'Only PDF, JPG, JPEG, PNG files are accepted.',
    errSubmit: 'Something went wrong. Please try again.',
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
  const fileInputRef = useRef();

  const c = TEXT[lang];

  function selectDept(d) {
    setDepartment(d);
    setPosition('');
  }

  function handleFile(f) {
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|jpe?g|png)$/i)) {
      setErrMsg(c.errType); return;
    }
    if (f.size > 100 * 1024 * 1024) { setErrMsg(c.errSize); return; }
    setErrMsg('');
    setFile(f);
  }

  async function handleSubmit() {
    if (!department || !position || !name || !contact || !workplace) { setErrMsg(c.errFill); return; }
    if (!file) { setErrMsg(c.errFile); return; }
    setErrMsg('');
    setStatus('sending');
    try {
      const ext = file.name.split('.').pop();
      const fileName = Date.now() + '_' + name.replace(/\s+/g, '_') + '.' + ext;
      const { error: uploadError } = await supabase.storage
        .from('cvs').upload(fileName, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(fileName);
      const { error: insertError } = await supabase.from('applicants').insert({
        name, contact, current_workplace: workplace, department, position,
        cv_url: urlData.publicUrl, lang,
      });
      if (insertError) throw insertError;
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrMsg(c.errSubmit);
      setStatus('idle');
    }
  }

  function resetForm() {
    setDepartment(''); setPosition(''); setName(''); setContact('');
    setWorkplace(''); setFile(null); setStatus('idle'); setErrMsg('');
  }

  const inputStyle = {
    width: '100%', height: 48, padding: '0 16px', background: '#FFFFFF',
    border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-main)',
    fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--gold-deep)',
    letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8,
    fontFamily: "'Outfit', sans-serif",
  };
  const sectionLabelStyle = {
    fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase',
    color: 'var(--text-muted)', marginBottom: 16, fontWeight: 600,
    fontFamily: "'Outfit', sans-serif",
  };
  const onFocus = e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(176,122,26,0.12)'; };
  const onBlur = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

  if (status === 'success') {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', animation: 'fadeUp 0.6s ease forwards' }}>
          <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 2rem' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--gold)', opacity: 0.3, animation: 'pulse-ring 2s ease-out infinite' }} />
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(176,122,26,0.12)', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--gold-deep)' }}>✓</div>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 12 }}>{c.successTitle}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: '2.5rem' }}>{c.successMsg}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>01806576024 · 6, Shah Makdum Ave, Uttara</p>
          <button onClick={resetForm} style={{ marginTop: '2rem', padding: '13px 34px', background: 'var(--gold)', color: '#FFFFFF', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, fontFamily: "'Outfit', sans-serif", cursor: 'pointer' }}>{c.again}</button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(176,122,26,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-15%', left: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(176,122,26,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 1.5rem 3rem', position: 'relative', zIndex: 1 }}>

        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Image src="/logo.png" alt="Crown Coffee" width={46} height={46} style={{ borderRadius: '50%' }} />
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1.2 }}>Crown Coffee</div>
              <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500 }}>Multi Cuisine Café</div>
            </div>
          </div>
          <div style={{ display: 'flex', background: 'var(--cream-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 3, gap: 2 }}>
            {['bn', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '5px 16px', border: 'none', borderRadius: 20,
                background: lang === l ? 'var(--gold)' : 'transparent',
                color: lang === l ? '#FFFFFF' : 'var(--gold)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s',
              }}>{l === 'bn' ? 'বাং' : 'EN'}</button>
            ))}
          </div>
        </header>

        <div style={{ textAlign: 'center', padding: '2rem 0 2.5rem', animation: 'fadeUp 0.6s ease forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, maxWidth: 70, height: 1, background: 'linear-gradient(to right, transparent, var(--gold))' }} />
            <div style={{ color: 'var(--gold)', fontSize: 16 }}>◆</div>
            <div style={{ flex: 1, maxWidth: 70, height: 1, background: 'linear-gradient(to left, transparent, var(--gold))' }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 7vw, 46px)', fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1.15, marginBottom: '0.75rem' }}>{c.headline}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 420, margin: '0 auto' }}>{c.sub}</p>
        </div>

        <div style={{
          background: 'var(--cream-card)', border: '1px solid var(--border)', borderRadius: 20,
          padding: '2rem', boxShadow: '0 4px 24px rgba(43, 33, 24, 0.05)',
          animation: 'fadeUp 0.6s ease forwards',
        }}>

          <p style={sectionLabelStyle}>{c.secDept}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: '1.75rem' }}>
            {[['kitchen', '🍳', c.kitchen, c.kitchenSub], ['front', '☕', c.front, c.frontSub]].map(([key, icon, label, sub]) => (
              <button key={key} onClick={() => selectDept(key)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', textAlign: 'left',
                background: department === key ? 'rgba(176,122,26,0.12)' : '#FFFFFF',
                border: '1px solid ' + (department === key ? 'var(--gold)' : 'var(--border)'),
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Outfit', sans-serif",
              }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                <span>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: department === key ? 'var(--gold-deep)' : 'var(--charcoal)' }}>{label}</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</span>
                </span>
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '0 0 1.75rem' }} />

          <p style={sectionLabelStyle}>{c.secPosition}</p>
          <div style={{ marginBottom: '1.75rem' }}>
            {department ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                {POSITIONS[department].map(pos => (
                  <button key={pos} onClick={() => setPosition(pos)} style={{
                    padding: '11px 14px',
                    background: position === pos ? 'rgba(176,122,26,0.12)' : '#FFFFFF',
                    border: '1px solid ' + (position === pos ? 'var(--gold)' : 'var(--border)'),
                    borderRadius: 10, color: position === pos ? 'var(--gold-deep)' : 'var(--text-secondary)',
                    fontSize: 13, fontWeight: position === pos ? 600 : 400, cursor: 'pointer',
                    textAlign: 'left', fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s',
                  }}>
                    {position === pos && <span style={{ marginRight: 6 }}>◆</span>}{pos}
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', padding: '4px 0' }}>{c.posHint}</p>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '0 0 1.75rem' }} />

          <p style={sectionLabelStyle}>{c.secInfo}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: '1.75rem' }}>
            <div>
              <label style={labelStyle}>{c.lblName} <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input style={inputStyle} value={name} placeholder={c.phName} onChange={e => setName(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={labelStyle}>{c.lblContact} <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input style={inputStyle} value={contact} placeholder={c.phContact} type="tel" onChange={e => setContact(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={labelStyle}>{c.lblWorkplace} <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input style={inputStyle} value={workplace} placeholder={c.phWorkplace} onChange={e => setWorkplace(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '0 0 1.75rem' }} />

          <p style={sectionLabelStyle}>{c.secCV}</p>
          <div
            style={{
              border: '1.5px dashed ' + (dragOver ? 'var(--gold)' : 'var(--border-bright)'),
              borderRadius: 14, padding: '2rem', textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'rgba(176,122,26,0.06)' : 'var(--cream-soft)',
              transition: 'all 0.2s', marginBottom: '1.5rem',
            }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
                <div style={{ color: 'var(--gold-deep)', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{file.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
                <div style={{ color: 'var(--text-main)', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{c.uploadTitle}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.uploadHint}</div>
              </>
            )}
          </div>

          {errMsg && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', color: 'var(--danger)', fontSize: 13, marginBottom: '1rem', fontFamily: "'Outfit', sans-serif" }}>{errMsg}</div>
          )}

          <button onClick={handleSubmit} disabled={status === 'sending'} style={{
            width: '100%', height: 52,
            background: status === 'sending' ? 'rgba(176,122,26,0.5)' : 'var(--gold)',
            color: '#FFFFFF', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600,
            fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.5px',
            cursor: status === 'sending' ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 6px 18px rgba(176,122,26,0.25)',
          }}
            onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.background = 'var(--gold-deep)'; }}
            onMouseLeave={e => { if (status !== 'sending') e.currentTarget.style.background = 'var(--gold)'; }}>
            {status === 'sending' ? (
              <>
                <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />
                {c.sending}
              </>
            ) : c.btnText}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: 12, lineHeight: 2 }}>
          <div style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>01806576024</div>
          <div>6, Shah Makdum Avenue, Sector-13, Uttara</div>
        </div>
      </div>
    </main>
  );
}