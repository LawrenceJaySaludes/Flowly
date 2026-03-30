import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ulzxlmqfssptopsnmdva.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsenhsbXFmc3NwdG9wc25tZHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTE2MDksImV4cCI6MjA5MDM4NzYwOX0.cyRE5LHdpROOtysflAu9YxqAV1cbKR9JHDKPQYMAc50";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});
