import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
'https://cqjztmlxuawaryuacvzm.supabase.co'

const supabaseKey =
'sb_publishable_UUZAlWFi8EbS0NfE815u2g_F7gRi3Go'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)