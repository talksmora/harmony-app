// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// @ts-ignore
const MSG91_AUTH_KEY = Deno.env.get("MSG91_AUTH_KEY")
// @ts-ignore
const MSG91_TEMPLATE_ID = Deno.env.get("MSG91_TEMPLATE_ID")

serve(async (req: Request) => {
  try {
    const { phone, message } = await req.json()
    // Supabase OTP message format: "Your code is 123456"
    const otpMatch = message.match(/\b\d{6}\b/)
    const otp = otpMatch ? otpMatch[0] : ""

    if (!otp) {
      return new Response(JSON.stringify({ error: "OTP not found in message" }), { status: 400 })
    }

    // MSG91 expects number without '+' sign (e.g. 917016164239)
    const cleanPhone = phone.replace("+", "")

    const response = await fetch("https://api.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        "authkey": MSG91_AUTH_KEY || "",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        template_id: MSG91_TEMPLATE_ID || "",
        recipients: [
          {
            mobiles: cleanPhone,
            otp: otp
          }
        ]
      })
    })

    const result = await response.json()
    return new Response(JSON.stringify(result), { status: response.status })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
