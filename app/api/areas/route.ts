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
      .from('areas')
      .select('id, name, notes, color, coordinates, total_area, created_at')
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
    const { name, notes, color, coordinates, total_area, perimeter } = body;

    if (!name || !coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
      return NextResponse.json(
        { error: 'Missing required fields: name, coordinates (array of [lng, lat] with at least 3 points)' },
        { status: 400 }
      );
    }

    // Create WKT Polygon for PostGIS
    // Ensure the polygon is closed (first and last points are the same)
    const coords = [...coordinates];
    if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
      coords.push(coords[0]);
    }
    
    const wktCoords = coords.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(', ');
    const polygon = `POLYGON((${wktCoords}))`;

    const { data, error} = await supabase
      .from('areas')
      .insert([
        {
          user_id: user.id,
          name,
          notes: notes || null,
          color: color || '#1976d2',
          geometry: polygon,
          coordinates: coordinates, // Store coordinates as JSONB for easy access
          total_area: total_area || 0,
          perimeter: perimeter || 0,
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
    const { id, name, notes, color, coordinates, total_area, perimeter } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing area id' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (notes !== undefined) updateData.notes = notes;
    if (color !== undefined) updateData.color = color;
    if (total_area !== undefined) updateData.total_area = total_area;
    if (perimeter !== undefined) updateData.perimeter = perimeter;
    
    if (coordinates && Array.isArray(coordinates) && coordinates.length >= 3) {
      const coords = [...coordinates];
      if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
        coords.push(coords[0]);
      }
      const wktCoords = coords.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(', ');
      updateData.geometry = `POLYGON((${wktCoords}))`;
      updateData.coordinates = coordinates; // Also update JSONB coordinates
    }

    const { data, error } = await supabase
      .from('areas')
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
      return NextResponse.json({ error: 'Missing area id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('areas')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
