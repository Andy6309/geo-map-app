
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get the session from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // You can now use the session in your middleware
  if (session) {
    // User is signed in
  } else {
    // User is not signed in
  }

  return res;
}
        },
      },
    },
  );

  return supabaseResponse
};

