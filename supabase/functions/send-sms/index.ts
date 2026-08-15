// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MSG91_AUTH_KEY = Deno.env.get("MSG91_AUTH_KEY")
const MSG91_TEMPLATE_ID = Deno.env.get("MSG91_TEMPLATE_ID")
const MSG91_WHATSAPP_INTEGRATED_NUMBER = Deno.env.get("MSG91_WHATSAPP_INTEGRATED_NUMBER")
const MSG91_WHATSAPP_TEMPLATE_NAME = Deno.env.get("MSG91_WHATSAPP_TEMPLATE_NAME")
const MSG91_WHATSAPP_LANG_CODE = Deno.env.get("MSG91_WHATSAPP_LANG_CODE") || "gu"

serve(async (req: Request) => {
  try {
    const body = await req.json()
    console.log("SMS Hook Payload received:", JSON.stringify(body))

    // Handle both Hook styles:
    // 1. Supabase Send SMS Hook payload: { "user": { "phone": "..." }, "sms": { "otp": "..." } }
    // 2. Direct body payload: { "phone": "...", "message": "Your code is 123456" }
    
    let phone = body.phone || (body.user && body.user.phone) || ""
    let otp = ""

    if (body.sms && body.sms.otp) {
      otp = body.sms.otp
    } else {
      const message = body.message || (body.sms && body.sms.message) || ""
      const otpMatch = message.match(/\b\d{6}\b/)
      otp = otpMatch ? otpMatch[0] : ""
    }

    if (!phone) {
      return new Response(JSON.stringify({ error: "Phone number not found in payload" }), { status: 400 })
    }
    if (!otp) {
      return new Response(JSON.stringify({ error: "OTP code not found or could not be parsed" }), { status: 400 })
    }

    // MSG91 expects number without '+' sign (e.g. 917016164239)
    const cleanPhone = phone.replace("+", "")

    // Try WhatsApp channel first if configured
    if (MSG91_WHATSAPP_INTEGRATED_NUMBER && MSG91_WHATSAPP_TEMPLATE_NAME) {
      console.log(`Sending WhatsApp OTP ${otp} to ${cleanPhone} using template ${MSG91_WHATSAPP_TEMPLATE_NAME}...`)
      try {
        const waResponse = await fetch("https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/", {
          method: "POST",
          headers: {
            "authkey": MSG91_AUTH_KEY || "",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            integrated_number: MSG91_WHATSAPP_INTEGRATED_NUMBER,
            content_type: "template",
            payload: {
              type: "template",
              template: {
                name: MSG91_WHATSAPP_TEMPLATE_NAME,
                language: {
                  code: MSG91_WHATSAPP_LANG_CODE,
                  policy: "deterministic"
                },
                to_and_components: [
                  {
                    to: [ cleanPhone ],
                    components: {
                      body_1: {
                        type: "text",
                        value: otp
                      }
                    }
                  }
                ]
              }
            }
          })
        })
        const waText = await waResponse.text()
        console.log(`MSG91 WhatsApp Response (Status ${waResponse.status}):`, waText)

        let result = {}
        try {
          result = JSON.parse(waText)
        } catch (e) {
          result = { raw: waText }
        }

        return new Response(JSON.stringify(result), { 
          status: waResponse.status,
          headers: { "Content-Type": "application/json" }
        })
      } catch (waErr: any) {
        console.error("Error sending WhatsApp OTP:", waErr.message)
        // Fallback to SMS if WhatsApp failed
      }
    }

    // Default to SMS flow
    console.log(`Sending SMS OTP ${otp} to ${cleanPhone} via MSG91 Flow API...`)
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

    const responseText = await response.text()
    console.log(`MSG91 SMS Response (Status ${response.status}):`, responseText)

    let result = {}
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      result = { raw: responseText }
    }

    return new Response(JSON.stringify(result), { 
      status: response.status,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: any) {
    console.error("SMS Hook execution error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})
