import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompileRequest {
  project_name: string;
  files: Array<{ path: string; content: string }>;
  platform: string;
  scripts: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { project_name, files, platform, scripts }: CompileRequest = await req.json();
    
    console.log('Compiling project:', project_name);

    // ⚠️ CRITICAL: Real JAR compilation is IMPOSSIBLE in edge functions
    // 
    // Why we can't compile here:
    // ❌ No Java JDK (javac compiler) - Edge functions run on Deno, not Java
    // ❌ No Minecraft APIs (Paper, Spigot, etc.) - Dependencies not available
    // ❌ No build tools (Gradle, Maven) - Not installed in edge environment
    // ❌ Time limits - Compilation takes 30s-5min, edge functions timeout at 150s
    // ❌ Memory constraints - Large plugins need >512MB RAM for compilation
    // 
    // Instead, this function:
    // ✅ Packages source files for download
    // ✅ Includes build scripts (build.gradle, pom.xml)
    // ✅ Provides step-by-step compilation instructions
    // 
    // TO GET A REAL WORKING JAR:
    // 1. Download the ZIP file from the sandbox
    // 2. Extract it on your computer
    // 3. Install Java JDK 17+ from https://adoptium.net
    // 4. Open terminal/command prompt in the extracted folder
    // 5. Run: ./gradlew build (Windows: gradlew.bat build)
    // 6. Find your JAR in: build/libs/
    // 7. Upload to your Minecraft server's plugins folder
    
    // Create comprehensive build instructions and source package
    let buildInstructions = `╔════════════════════════════════════════════════════════════════╗
║                 DARK AI PLUGIN BUILD GUIDE                     ║
║                                                                ║
║  ⚠️  EDGE FUNCTIONS CANNOT COMPILE JAVA CODE                   ║
║  Follow these steps to create a real working JAR              ║
╚════════════════════════════════════════════════════════════════╝

PROJECT: ${project_name}
PLATFORM: ${platform}
BUILD SYSTEM: ${scripts[0]?.includes('gradle') ? 'Gradle' : 'Maven'}

═══════════════════════════════════════════════════════════════
STEP 1: INSTALL JAVA JDK
═══════════════════════════════════════════════════════════════
Download and install Java JDK 17 or higher:
→ https://adoptium.net/temurin/releases/

Verify installation:
  java -version
  javac -version

Both should show version 17 or higher.

═══════════════════════════════════════════════════════════════
STEP 2: DOWNLOAD PROJECT FILES
═══════════════════════════════════════════════════════════════
1. Go to the Sandbox page
2. Click "Download Project Files" button
3. Extract the ZIP to a folder on your computer

═══════════════════════════════════════════════════════════════
STEP 3: COMPILE THE PLUGIN
═══════════════════════════════════════════════════════════════
Open terminal/command prompt in the project folder.

${scripts[0]?.includes('gradle') ? `
For Gradle (build.gradle present):
  Windows:    gradlew.bat build
  Mac/Linux:  ./gradlew build
  
First time? Gradle will download dependencies (~50-200MB).
This may take 2-5 minutes.
` : `
For Maven (pom.xml present):
  Windows:    mvn.cmd package
  Mac/Linux:  mvn package
  
First time? Maven will download dependencies (~50-200MB).
This may take 2-5 minutes.
`}

═══════════════════════════════════════════════════════════════
STEP 4: LOCATE YOUR JAR FILE
═══════════════════════════════════════════════════════════════
${scripts[0]?.includes('gradle') ? `
After build completes successfully:
  build/libs/${project_name}-1.0.jar
` : `
After build completes successfully:
  target/${project_name}-1.0.jar
`}

═══════════════════════════════════════════════════════════════
STEP 5: INSTALL ON MINECRAFT SERVER
═══════════════════════════════════════════════════════════════
1. Copy the JAR file
2. Paste into your server's "plugins" folder
3. Restart the server or run: /reload confirm
4. Check console for successful load

═══════════════════════════════════════════════════════════════
TROUBLESHOOTING
═══════════════════════════════════════════════════════════════
❌ "javac: command not found"
  → Install JDK from https://adoptium.net

❌ "JAVA_HOME is not set"
  → Set environment variable to JDK installation path

❌ "Could not find or load main class"
  → Your JAR wasn't built properly. Re-run build command

❌ Plugin loads but doesn't work
  → Check server console for errors
  → Verify Minecraft version matches (${platform})
  → Check plugin.yml configuration

═══════════════════════════════════════════════════════════════
SOURCE FILES INCLUDED IN THIS PACKAGE
═══════════════════════════════════════════════════════════════
`;

    files.forEach(file => {
      buildInstructions += `\n${file.path}\n`;
    });

    buildInstructions += `\n═══════════════════════════════════════════════════════════════\n`;
    buildInstructions += `\nNeed help? Join our Discord community!\n`;
    buildInstructions += `Generated by DARK AI - https://dark-ai.com\n`;

    // Convert to base64 for transfer
    const encoder = new TextEncoder();
    const data = encoder.encode(buildInstructions);
    const base64 = btoa(String.fromCharCode(...data));

    console.log('Build instructions prepared, size:', data.length, 'bytes');

    return new Response(
      JSON.stringify({ 
        success: true, 
        jar_data: base64,
        jar_name: `${project_name}-BUILD-INSTRUCTIONS.txt`,
        size: data.length,
        is_demo: false,
        is_instructions: true,
        message: '⚠️ REAL COMPILATION REQUIRED - Download and build with Java JDK',
        instructions: {
          title: 'Edge functions cannot compile Java code',
          reason: 'No Java compiler available in Deno runtime',
          steps: [
            '1. Download the build instructions file (click download button)',
            '2. Download all project files from sandbox',
            '3. Install Java JDK 17+ from https://adoptium.net',
            '4. Open terminal in project folder',
            '5. Run: ./gradlew build (or gradlew.bat on Windows)',
            '6. Find JAR in build/libs/ folder',
            '7. Upload to server plugins folder'
          ],
          warning: 'The "JAR" file from this function is NOT executable. It contains build instructions only.',
          documentation: 'Open the downloaded .txt file for complete step-by-step guide'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in compile-plugin:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function findMainClass(files: Array<{ path: string; content: string }>): string {
  for (const file of files) {
    if (file.path.endsWith('.java') && file.content.includes('extends JavaPlugin')) {
      // Extract package and class name
      const packageMatch = file.content.match(/package\s+([\w.]+);/);
      const classMatch = file.content.match(/public\s+class\s+(\w+)/);
      
      if (packageMatch && classMatch) {
        return `${packageMatch[1]}.${classMatch[1]}`;
      }
    }
  }
  return 'com.example.plugin.Main';
}
