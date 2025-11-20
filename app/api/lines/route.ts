import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('lines')
      .select('id, name, notes, color, coordinates, total_distance, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, notes, color, coordinates, total_distance, segment_distances } = body;

    if (!name || !coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
      return NextResponse.json(
        { error: 'Missing required fields: name, coordinates (array of [lng, lat] with at least 2 points)' },
        { status: 400 }
      );
    }

    // Create WKT LineString for PostGIS
    const wktCoords = coordinates.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(', ');
    const lineString = `LINESTRING(${wktCoords})`;

    const { data, error } = await supabase
      .from('lines')
      .insert([
        {
          user_id: user.id,
          name,
          notes: notes || null,
          color: color || '#e53935',
          geometry: lineString,
          coordinates: coordinates, // Store coordinates as JSONB for easy access
          total_distance: total_distance || 0,
          segment_distances: segment_distances || [],
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, notes, color, coordinates, total_distance, segment_distances } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing line id' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (notes !== undefined) updateData.notes = notes;
    if (color !== undefined) updateData.color = color;
    if (total_distance !== undefined) updateData.total_distance = total_distance;
    if (segment_distances !== undefined) updateData.segment_distances = segment_distances;
    
    if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
      const wktCoords = coordinates.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(', ');
      updateData.geometry = `LINESTRING(${wktCoords})`;
      updateData.coordinates = coordinates; // Also update JSONB coordinates
    }

    const { data, error } = await supabase
      .from('lines')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing line id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('lines')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
