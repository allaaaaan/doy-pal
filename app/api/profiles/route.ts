import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET /api/profiles - Get all active profiles
export async function GET() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    return NextResponse.json({ profiles: profiles || [] });
  } catch (error) {
    console.error('Unexpected error fetching profiles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/profiles - Create new profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, avatar_url } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Profile name is required' }, { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        name: name.trim(),
        avatar_url: avatar_url || null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 