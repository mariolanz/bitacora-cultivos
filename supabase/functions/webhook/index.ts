import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Crea el cliente de Supabase
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  if (req.method === 'POST') {
    const body = await req.json()
    // Guarda el payload en una tabla de logs_webhook (debes crearla si la necesitas)
    const { error } = await supabase.from('logs_webhook').insert([{ payload: body }])
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
    }
    return new Response(JSON.stringify({ status: 'ok' }), { headers: corsHeaders })
  }

  return new Response('Método no soportado', { status: 405, headers: corsHeaders })
})