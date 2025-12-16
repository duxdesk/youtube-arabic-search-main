import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Search } from "lucide-react";
import { Youtuber } from "@/lib/supabase-hooks";

interface YoutuberCardProps {
  youtuber: Youtuber;
}

const YoutuberCard = ({ youtuber }: YoutuberCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-glow hover:-translate-y-1 bg-gradient-card border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={youtuber.avatar}
              alt={youtuber.name_ar}
              className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/10 transition-transform group-hover:scale-110"
            />
            <div className="absolute -bottom-1 -right-1 rounded-full bg-gradient-primary p-1.5 shadow-glow">
              <Search className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                {youtuber.name_ar}
              </h3>
              <p className="text-sm text-muted-foreground">
                {youtuber.name_en}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{youtuber.subscriber_count} مشترك</span>
            </div>
            
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              {youtuber.category}
            </Badge>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {youtuber.description}
            </p>
          </div>
        </div>
        
        <Link to={`/search/${youtuber.id}`} className="mt-4 block">
          <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all">
            ابحث في نصوصه
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default YoutuberCard;
