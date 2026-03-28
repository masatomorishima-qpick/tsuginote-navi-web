import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!supabaseSecretKey) {
  throw new Error('SUPABASE_SECRET_KEY is not set');
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      visit_id = null,
      anon_id = null,
      lp_id,
      page_path = null,
      event_name,
      component_id = null,
      choice_id = null,
      choice_label = null,
      section_id = null,
      view_order = null,
      question_id = null,
      answer_id = null,
      cta_id = null,
      partner_category = null,
      source_section = null,
      selected_intent_id = null,
      selected_barrier_id = null,
      metadata = {},
    } = body;

    if (!lp_id || !event_name) {
      return NextResponse.json(
        {
          ok: false,
          error: 'lp_id and event_name are required',
        },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('lp_event_logs').insert({
      visit_id,
      anon_id,
      lp_id,
      page_path,
      event_name,
      component_id,
      choice_id,
      choice_label,
      section_id,
      view_order,
      question_id,
      answer_id,
      cta_id,
      partner_category,
      source_section,
      selected_intent_id,
      selected_barrier_id,
      metadata,
    });

    if (error) {
      console.error('track insert error:', error);

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('track api error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'unexpected error',
      },
      { status: 500 }
    );
  }
}