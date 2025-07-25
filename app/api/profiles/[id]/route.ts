import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET /api/profiles/[id] - Get single profile
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/profiles/[id] - Update profile (only avatar_url allowed as per requirement)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { avatar_url } = body;

    // Only allow updating avatar_url as per user requirements
    const updates: any = {};
    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', params.id)
      .eq('is_active', true)
      .select()
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/profiles/[id] - Soft delete profile
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', params.id)
      .select()
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile deleted successfully', profile });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 