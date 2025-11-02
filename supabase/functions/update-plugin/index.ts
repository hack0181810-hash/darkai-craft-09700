import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, existingFiles, platform, mcVersion, model = "google/gemini-2.5-flash" } = await req.json();

    if (!prompt || !existingFiles || existingFiles.length === 0) {
      throw new Error("Missing required parameters");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build context from existing files
    const fileContext = existingFiles.map((f: any) => 
      `FILE: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``
    ).join("\n\n");

    const systemPrompt = `You are an expert Minecraft plugin developer. The user has an existing ${platform} plugin for Minecraft ${mcVersion}.

CRITICAL INSTRUCTIONS:
1. Apply ONLY the requested changes incrementally to existing files
2. DO NOT regenerate the entire plugin
3. Respond with a JSON object containing an array of file updates
4. Only include files that need to be modified
5. For each file, provide the COMPLETE updated content

Response format:
{
  "updates": [
    {
      "path": "path/to/file.java",
      "content": "complete updated file content",
      "description": "brief description of changes made"
    }
  ],
  "summary": "brief summary of all changes made"
}

EXISTING PROJECT FILES:
${fileContext}

USER REQUEST: ${prompt}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      throw new Error(`AI API error: ${error}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Extract JSON from response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(
      JSON.stringify({ success: true, updates: result }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Update error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
