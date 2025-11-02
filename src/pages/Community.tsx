import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Star, Clock } from "lucide-react";
import { motion } from "framer-motion";

const communityPlugins = [
  {
    id: 1,
    name: "AutoFarm Pro",
    description: "Automatic farming system with crop rotation and multi-farm support",
    author: "MinecraftDev",
    downloads: 1250,
    rating: 4.8,
    platform: "Paper",
    version: "1.21.1",
    createdAt: "2 days ago",
  },
  {
    id: 2,
    name: "Custom Enchants",
    description: "Add 50+ unique enchantments to your server with custom effects",
    author: "EnchantMaster",
    downloads: 3420,
    rating: 4.9,
    platform: "Spigot",
    version: "1.20.4",
    createdAt: "5 days ago",
  },
  {
    id: 3,
    name: "Economy System",
    description: "Complete economy plugin with shops, trading, and banking features",
    author: "EcoBuilder",
    downloads: 2100,
    rating: 4.7,
    platform: "Paper",
    version: "1.21.1",
    createdAt: "1 week ago",
  },
  {
    id: 4,
    name: "PvP Arena",
    description: "Competitive PvP arenas with matchmaking and leaderboards",
    author: "PvPKing",
    downloads: 890,
    rating: 4.6,
    platform: "Paper",
    version: "1.21.1",
    createdAt: "3 days ago",
  },
  {
    id: 5,
    name: "Quest System",
    description: "Daily quests and achievements system with rewards",
    author: "QuestMaker",
    downloads: 1670,
    rating: 4.8,
    platform: "Bukkit",
    version: "1.20.4",
    createdAt: "1 week ago",
  },
  {
    id: 6,
    name: "Mob Arena",
    description: "Wave-based mob fighting arena with custom mobs",
    author: "ArenaCreator",
    downloads: 2340,
    rating: 4.9,
    platform: "Paper",
    version: "1.21.1",
    createdAt: "4 days ago",
  },
];

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Community Creations
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover amazing plugins created by our community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityPlugins.map((plugin, index) => (
              <motion.div
                key={plugin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--shadow-glow)]">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl">{plugin.name}</CardTitle>
                      <Badge variant="secondary">{plugin.platform}</Badge>
                    </div>
                    <CardDescription>{plugin.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>by {plugin.author}</span>
                        <span>v{plugin.version}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4 text-primary" />
                          <span>{plugin.downloads.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-secondary fill-secondary" />
                          <span>{plugin.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{plugin.createdAt}</span>
                        </div>
                      </div>

                      <Button className="w-full rounded-xl" variant="default">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;