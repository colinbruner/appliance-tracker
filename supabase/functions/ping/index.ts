import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PING_SECRET = Deno.env.get('PING_SECRET') ?? ''

Deno.serve(async (req) => {
  const secret = req.headers.get('x-ping-secret') ?? ''

  if (!PING_SECRET || secret !== PING_SECRET) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { count, error } = await supabase
    .from('appliances')
    .select('*', { count: 'exact', head: true })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ ok: true, count }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})
