import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Batch endpoint to fetch all geospatial data in a single request
 * This significantly improves performance by:
 * - Reducing round trips (1 request instead of 3)
 * - Single authentication check
 * - Parallel database queries
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Single auth check for all data
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Execute all queries in parallel for maximum speed
    const [waypointsResult, linesResult, areasResult] = await Promise.all([
      supabase
        .from('waypoints')
        .select('id, name, notes, color, icon_type, longitude, latitude, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      
      supabase
        .from('lines')
        .select('id, name, notes, color, coordinates, total_distance, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      
      supabase
        .from('areas')
        .select('id, name, notes, color, coordinates, total_area, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ]);

    // Check for errors
    if (waypointsResult.error) throw waypointsResult.error;
    if (linesResult.error) throw linesResult.error;
    if (areasResult.error) throw areasResult.error;

    // Return all data in a single response
    return NextResponse.json({
      waypoints: waypointsResult.data || [],
      lines: linesResult.data || [],
      areas: areasResult.data || [],
    });
  } catch (error: any) {
    console.error('Batch fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
