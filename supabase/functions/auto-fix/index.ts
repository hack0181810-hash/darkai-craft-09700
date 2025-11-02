import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoFixRequest {
  buildLog: string;
  files: Array<{ path: string; content: string }>;
  model: string;
}

const AUTOFIX_PROMPT = `You are DARK AI's Auto-Fix engine. 
Given build_log + project context, output:
{
 "patches": [{ "path": "...", "new_content": "..." }],
 "explanation": "reasoning of fix",
 "confidence": 0.0–1.0
}
Keep patches minimal and safe.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { buildLog, files, model }: AutoFixRequest = await req.json();
    
    console.log('Auto-fixing with log:', buildLog.substring(0, 200));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const filesContext = files.map(f => `File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    
    const userPrompt = `Build Log:\n\`\`\`\n${buildLog}\n\`\`\`\n\nProject Files:\n${filesContext}\n\nProvide fixes for the errors.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: AUTOFIX_PROMPT },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let fixData;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      fixData = JSON.parse(jsonStr);
    } catch {
      fixData = {
        patches: [],
        explanation: content,
        confidence: 0.5
      };
    }

    return new Response(
      JSON.stringify({ success: true, fixes: fixData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-fix:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
