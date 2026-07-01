"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getSupabaseBrowserAuthOptions, getSupabaseCookieOptions } from "@/lib/supabase/options";

export function createClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey, {
    cookieOptions: getSupabaseCookieOptions(),
    auth: getSupabaseBrowserAuthOptions(),
  });
}
