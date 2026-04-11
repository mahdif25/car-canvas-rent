import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateCode(prefix: string, name: string | null): string {
  const clean = name
    ? name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)
    : crypto.randomUUID().slice(0, 6).toUpperCase()
  return `${prefix}-${clean}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  let broadcastId: string
  try {
    const body = await req.json()
    broadcastId = body.broadcast_id
    if (!broadcastId) throw new Error('missing broadcast_id')
  } catch {
    return new Response(JSON.stringify({ error: 'broadcast_id required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Load broadcast
  const { data: broadcast, error: bErr } = await supabase
    .from('email_broadcasts')
    .select('*')
    .eq('id', broadcastId)
    .single()

  if (bErr || !broadcast) {
    return new Response(JSON.stringify({ error: 'Broadcast not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Extract coupon conditions from filters_json
  const filtersJson = broadcast.filters_json as Record<string, any> || {}
  const minTotalPrice = filtersJson.minTotalPrice ? Number(filtersJson.minTotalPrice) : null
  const minRentalDays = filtersJson.minRentalDays ? Number(filtersJson.minRentalDays) : null

  // Mark as sending
  await supabase.from('email_broadcasts').update({ status: 'sending' }).eq('id', broadcastId)

  // Load recipients
  const { data: recipients = [] } = await supabase
    .from('broadcast_recipients')
    .select('*')
    .eq('broadcast_id', broadcastId)
    .eq('status', 'pending')

  // For shared mode, load the source coupon
  let sharedCouponCode: string | null = null
  if (broadcast.coupon_mode === 'shared' && broadcast.source_coupon_id) {
    const { data: sc } = await supabase.from('coupons').select('code').eq('id', broadcast.source_coupon_id).single()
    sharedCouponCode = sc?.code || null
  }

  let sentCount = 0
  const expiresFormatted = broadcast.coupon_expires_at
    ? new Date(broadcast.coupon_expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  for (const recipient of recipients!) {
    try {
      let couponCode: string | null = null
      let friendCouponCode: string | null = null
      let couponId: string | null = null
      let friendCouponId: string | null = null

      if (broadcast.coupon_mode === 'shared') {
        couponCode = sharedCouponCode
      } else if (broadcast.coupon_mode === 'unique') {
        // Create unique coupon
        const code = generateCode(broadcast.coupon_prefix || 'PROMO', recipient.name)
        const { data: newCoupon, error: cErr } = await supabase.from('coupons').insert({
          code,
          discount_amount: broadcast.discount_amount,
          max_uses: 1,
          is_active: true,
          expires_at: broadcast.coupon_expires_at || null,
          min_total_price: minTotalPrice,
          min_rental_days: minRentalDays,
        }).select('id, code').single()

        if (!cErr && newCoupon) {
          couponCode = newCoupon.code
          couponId = newCoupon.id
        }
      } else if (broadcast.coupon_mode === 'referral') {
        // Create customer coupon
        const custCode = generateCode(broadcast.coupon_prefix || 'REF', recipient.name)
        const { data: c1 } = await supabase.from('coupons').insert({
          code: custCode,
          discount_amount: broadcast.discount_amount,
          max_uses: 1,
          is_active: true,
          expires_at: broadcast.coupon_expires_at || null,
        }).select('id, code').single()

        if (c1) {
          couponCode = c1.code
          couponId = c1.id
        }

        // Create friend coupon
        const friendCode = generateCode(`AMI-${broadcast.coupon_prefix || 'REF'}`, recipient.name)
        const { data: c2 } = await supabase.from('coupons').insert({
          code: friendCode,
          discount_amount: broadcast.friend_discount_amount || broadcast.discount_amount,
          max_uses: 1,
          is_active: true,
          expires_at: broadcast.coupon_expires_at || null,
          min_total_price: minTotalPrice,
          min_rental_days: minRentalDays,
        }).select('id, code').single()

        if (c2) {
          friendCouponCode = c2.code
          friendCouponId = c2.id
        }
      }

      // Update recipient with coupon IDs
      if (couponId || friendCouponId) {
        await supabase.from('broadcast_recipients').update({
          coupon_id: couponId,
          friend_coupon_id: friendCouponId,
        }).eq('id', recipient.id)
      }

      // Detect if body_html is builder-generated (contains HTML tags) vs plain text
      const isBuilderHtml = broadcast.body_html && broadcast.body_html.includes('<div')

      // Send email via send-transactional-email
      const { error: sendErr } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'promotional-email',
          recipientEmail: recipient.email,
          idempotencyKey: `broadcast-${broadcastId}-${recipient.id}`,
          templateData: {
            recipientName: recipient.name || 'Client',
            subject: broadcast.subject,
            bodyHtml: isBuilderHtml ? '' : broadcast.body_html,
            renderedBodyHtml: isBuilderHtml ? broadcast.body_html : '',
            couponCode,
            discountAmount: broadcast.discount_amount,
            expiresAt: expiresFormatted,
            friendCouponCode,
            friendDiscountAmount: broadcast.friend_discount_amount || broadcast.discount_amount,
            minTotalPrice: minTotalPrice,
            minRentalDays: minRentalDays,
          },
        },
      })

      if (sendErr) {
        console.error('Send error for recipient', recipient.id, sendErr)
        await supabase.from('broadcast_recipients').update({ status: 'failed' }).eq('id', recipient.id)
      } else {
        await supabase.from('broadcast_recipients').update({ status: 'sent' }).eq('id', recipient.id)
        sentCount++
      }
    } catch (e) {
      console.error('Error processing recipient', recipient.id, e)
      await supabase.from('broadcast_recipients').update({ status: 'failed' }).eq('id', recipient.id)
    }
  }

  // Update broadcast
  await supabase.from('email_broadcasts').update({
    sent_count: sentCount,
    status: sentCount === recipients!.length ? 'sent' : 'failed',
  }).eq('id', broadcastId)

  return new Response(JSON.stringify({ success: true, sent: sentCount, total: recipients!.length }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
