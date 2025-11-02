import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const examples = [
  {
    title: "Economy Plugin",
    description: "Create a plugin with /balance and /pay commands for a server economy system",
    features: ["Virtual currency", "Balance commands", "Payment system", "MySQL storage"],
  },
  {
    title: "Custom Enchantments",
    description: "Add unique enchantments with fire damage, healing, and teleportation effects",
    features: ["Custom enchants", "Special effects", "NBT data", "Event handlers"],
  },
  {
    title: "Minigame Framework",
    description: "Build a flexible minigame system with lobbies, teams, and scoring",
    features: ["Arena management", "Team system", "Scoreboard", "Game states"],
  },
  {
    title: "Admin Tools",
    description: "Powerful moderation commands for server management",
    features: ["Player management", "Ban/kick system", "Permissions", "Logging"],
  },
];

export const ExamplesDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-2xl">
          View Examples
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Plugin Examples
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {examples.map((example, i) => (
            <Card key={i} className="p-6 hover:border-primary/50 transition-all">
              <h3 className="text-xl font-bold mb-2">{example.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{example.description}</p>
              <ul className="space-y-1">
                {example.features.map((feature, j) => (
                  <li key={j} className="text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
