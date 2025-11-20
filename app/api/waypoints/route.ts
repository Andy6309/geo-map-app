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
      .from('waypoints')
      .select('id, name, notes, color, icon_type, longitude, latitude, created_at')
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
    const { name, notes, color, icon_type, longitude, latitude } = body;

    if (!name || longitude === undefined || latitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, longitude, latitude' },
        { status: 400 }
      );
    }

    // Create GeoJSON point for PostGIS
    const { data, error } = await supabase
      .from('waypoints')
      .insert([
        {
          user_id: user.id,
          name,
          notes: notes || null,
          color: color || 'red',
          icon_type: icon_type || 'deer',
          longitude,
          latitude,
          location: `POINT(${longitude} ${latitude})`,
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
    const { id, name, notes, color, icon_type, longitude, latitude } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing waypoint id' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (notes !== undefined) updateData.notes = notes;
    if (color !== undefined) updateData.color = color;
    if (icon_type !== undefined) updateData.icon_type = icon_type;
    
    if (longitude !== undefined && latitude !== undefined) {
      updateData.longitude = longitude;
      updateData.latitude = latitude;
      updateData.location = `POINT(${longitude} ${latitude})`;
    }

    const { data, error } = await supabase
      .from('waypoints')
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
      return NextResponse.json({ error: 'Missing waypoint id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('waypoints')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
