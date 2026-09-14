import { corsHeaders } from "npm:@supabase/supabase-js@^2/cors";

Deno.serve(async (req: Request) => {
    // Handle browser CORS preflight request
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: corsHeaders,
        });
    }

    try {
        const {
            businessName,
            category,
            rating,
            liked,
            issues,
        } = await req.json();

        if (!businessName || !rating) {
            return new Response(
                JSON.stringify({
                    error: "businessName and rating are required",
                }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        const groqApiKey = Deno.env.get("GROQ_API_KEY");

        if (!groqApiKey) {
            throw new Error("GROQ_API_KEY is not configured");
        }

        const prompt = `
Generate a natural customer review based ONLY on the information provided below.

Business name: ${businessName}
Business category: ${category || "business"}
Rating: ${rating}/5
Things the customer liked: ${liked?.length ? liked.join(", ") : "None provided"
            }
Things the customer felt could be improved: ${issues?.length ? issues.join(", ") : "None provided"
            }

Rules:
- Write in first person, as if the customer is writing the review.
- Do not invent any facts, people, products, prices, events, services, or experiences.
- Do not mention information that the customer did not provide.
- Keep the review natural and concise.
- Match the tone and sentiment to the rating.
- Do not exaggerate the customer's experience.
- Do not mention AI or that the review was generated.
- Do not use quotation marks around the review.
- Return ONLY the review text.
`;

        const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${groqApiKey}`,
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-20b",
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    temperature: 0.7,
                    max_completion_tokens: 512,
                    include_reasoning: false,
                }),
            }
        );

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();

            console.error("Groq API error:", errorText);

            return new Response(
                JSON.stringify({
                    error: "Failed to generate review",
                }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        const groqData = await groqResponse.json();

        const review =
            groqData.choices?.[0]?.message?.content?.trim();

        if (!review) {
            throw new Error("Groq returned an empty review");
        }

        return new Response(
            JSON.stringify({
                success: true,
                review,
            }),
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error) {
        console.error("Function error:", error);

        return new Response(
            JSON.stringify({
                error: "Something went wrong while generating the review",
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            }
        );
    }
});