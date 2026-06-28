import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    const body = await request.json();
    const { name, contact, current_workplace, department, position, cv_url, lang } = body;

    if (!name || !contact || !current_workplace || !department || !position) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase.from('applicants').insert({
      name, contact, current_workplace, department, position, cv_url, lang,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
