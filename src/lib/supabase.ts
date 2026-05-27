import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pgjvpxmpxlchjcrsyewb.supabase.co";

const supabaseKey = "sb_publishable_bLAcDeBumvjfBnTGb4iqhQ_kuwldJx9";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
