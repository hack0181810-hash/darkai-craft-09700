import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface GenerationFormProps {
  onGenerate: (data: {
    description: string;
    pluginType: string;
    mcVersion: string;
    model: string;
  }) => void;
  isGenerating: boolean;
}

const GenerationFormComponent = ({ onGenerate, isGenerating }: GenerationFormProps) => {
  const [description, setDescription] = useState("");
  const [pluginType, setPluginType] = useState("paper");
  const [mcVersion, setMcVersion] = useState("1.21.4");
  const [model, setModel] = useState("google/gemini-2.5-flash");

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onGenerate({ description, pluginType, mcVersion, model });
    }
  }, [description, pluginType, mcVersion, model, onGenerate]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-screen p-6 relative"
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[150px]"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>
      
      <Card className="w-full max-w-4xl p-10 border-primary/30 shadow-[var(--shadow-glow-strong)] backdrop-blur-sm bg-card/95 relative z-10">
        <div className="mb-10 text-center">
          <motion.div 
            className="inline-flex items-center justify-center p-5 rounded-3xl bg-gradient-to-br from-primary to-secondary mb-6 shadow-[var(--shadow-glow-strong)]"
            animate={{
              boxShadow: [
                '0 0 30px hsl(190 100% 50% / 0.6)',
                '0 0 50px hsl(190 100% 50% / 0.8)',
                '0 0 30px hsl(190 100% 50% / 0.6)',
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            Create Your Plugin
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Describe your plugin idea and watch AI generate production-ready code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="description" className="text-lg font-bold">
              What do you want to build?
            </Label>
            <Textarea
              id="description"
              placeholder="Example: A simple economy plugin with commands for /balance, /pay, and shops. Add a shop GUI with items players can buy and sell..."
              value={description}
              onChange={handleDescriptionChange}
              className="min-h-40 text-base resize-none border-primary/30 focus:border-primary focus:ring-primary/20 transition-all"
              disabled={isGenerating}
              autoComplete="off"
              spellCheck="true"
              maxLength={5000}
            />
            <p className="text-sm text-muted-foreground">
              Be specific! Include commands, features, and behaviors you want.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="pluginType" className="text-base font-bold">
                Platform
              </Label>
              <Select value={pluginType} onValueChange={setPluginType} disabled={isGenerating}>
                <SelectTrigger id="pluginType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paper">Paper Plugin</SelectItem>
                  <SelectItem value="spigot">Spigot Plugin</SelectItem>
                  <SelectItem value="velocity">Velocity Plugin</SelectItem>
                  <SelectItem value="bukkit">Bukkit Plugin</SelectItem>
                  <SelectItem value="skript">Skript Script</SelectItem>
                  <SelectItem value="datapack">Minecraft Datapack</SelectItem>
                  <SelectItem value="fabric">Fabric Mod</SelectItem>
                  <SelectItem value="forge">Forge Mod</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="mcVersion" className="text-base font-bold">
                MC Version
              </Label>
              <Select value={mcVersion} onValueChange={setMcVersion} disabled={isGenerating}>
                <SelectTrigger id="mcVersion">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.21.4">1.21.4 (Latest)</SelectItem>
                  <SelectItem value="1.21.3">1.21.3</SelectItem>
                  <SelectItem value="1.21.1">1.21.1</SelectItem>
                  <SelectItem value="1.21">1.21</SelectItem>
                  <SelectItem value="1.20.6">1.20.6</SelectItem>
                  <SelectItem value="1.20.5">1.20.5</SelectItem>
                  <SelectItem value="1.20.4">1.20.4</SelectItem>
                  <SelectItem value="1.20.3">1.20.3</SelectItem>
                  <SelectItem value="1.20.2">1.20.2</SelectItem>
                  <SelectItem value="1.20.1">1.20.1</SelectItem>
                  <SelectItem value="1.20">1.20</SelectItem>
                  <SelectItem value="1.19.4">1.19.4</SelectItem>
                  <SelectItem value="1.19.3">1.19.3</SelectItem>
                  <SelectItem value="1.19.2">1.19.2</SelectItem>
                  <SelectItem value="1.19.1">1.19.1</SelectItem>
                  <SelectItem value="1.19">1.19</SelectItem>
                  <SelectItem value="1.18.2">1.18.2</SelectItem>
                  <SelectItem value="1.18.1">1.18.1</SelectItem>
                  <SelectItem value="1.18">1.18</SelectItem>
                  <SelectItem value="1.17.1">1.17.1</SelectItem>
                  <SelectItem value="1.17">1.17</SelectItem>
                  <SelectItem value="1.16.5">1.16.5</SelectItem>
                  <SelectItem value="1.16.4">1.16.4</SelectItem>
                  <SelectItem value="1.16.3">1.16.3</SelectItem>
                  <SelectItem value="1.16.2">1.16.2</SelectItem>
                  <SelectItem value="1.16.1">1.16.1</SelectItem>
                  <SelectItem value="1.15.2">1.15.2</SelectItem>
                  <SelectItem value="1.14.4">1.14.4</SelectItem>
                  <SelectItem value="1.13.2">1.13.2</SelectItem>
                  <SelectItem value="1.12.2">1.12.2</SelectItem>
                  <SelectItem value="1.11.2">1.11.2</SelectItem>
                  <SelectItem value="1.10.2">1.10.2</SelectItem>
                  <SelectItem value="1.9.4">1.9.4</SelectItem>
                  <SelectItem value="1.8.9">1.8.9</SelectItem>
                  <SelectItem value="1.7.10">1.7.10</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="model" className="text-base font-bold">
                AI Model
              </Label>
              <Select value={model} onValueChange={setModel} disabled={isGenerating}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</SelectItem>
                  <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro (Most Powerful)</SelectItem>
                  <SelectItem value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Fastest)</SelectItem>
                  <SelectItem value="openai/gpt-5">GPT-5 (Premium)</SelectItem>
                  <SelectItem value="openai/gpt-5-mini">GPT-5 Mini (Balanced)</SelectItem>
                  <SelectItem value="openai/gpt-5-nano">GPT-5 Nano (Quick)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full text-xl py-8 rounded-2xl font-black"
            disabled={isGenerating || !description.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Generating Your Plugin...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-3" />
                Generate Plugin with AI
              </>
            )}
          </Button>
          
          {!description.trim() && (
            <p className="text-center text-sm text-muted-foreground">
              Enter a plugin description to get started
            </p>
          )}
        </form>
      </Card>
    </motion.div>
  );
};

export const GenerationForm = memo(GenerationFormComponent);
