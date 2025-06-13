import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from "next/headers";

export const createClient = async () => {
    const cookieStore = await cookies();

    return createPagesServerClient(
        {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
            supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing user sessions.
                    }
                },
            },
        }
    );
};
