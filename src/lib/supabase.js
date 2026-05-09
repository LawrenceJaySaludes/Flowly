import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ophsnnmncibjczvpeyib.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9waHNubm1uY2liamN6dnBleWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzA5ODQsImV4cCI6MjA5MzQ0Njk4NH0.MfN1voieVRnOIQGtdml4gLgrdaKQC2NCVis9Qf7161I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
