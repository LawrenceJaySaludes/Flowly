import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = "https://ulzxlmqfssptopsnmdva.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsenhsbXFmc3NwdG9wc25tZHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTE2MDksImV4cCI6MjA5MDM4NzYwOX0.cyRE5LHdpROOtysflAu9YxqAV1cbKR9JHDKPQYMAc50";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === "web",
    persistSession: true,
  },
});
