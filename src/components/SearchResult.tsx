import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Play } from "lucide-react";
import { Transcript } from "@/lib/supabase-hooks";

interface SearchResultProps {
  result: Transcript;
  searchTerm: string;
  onPlayVideo?: () => void;
}

const SearchResult = ({ result, searchTerm, onPlayVideo }: SearchResultProps) => {
  const highlightText = (text: string, term: string) => {
    if (!term.trim()) return text;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={index} className="bg-accent/30 text-accent-foreground font-semibold px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-soft hover:border-primary/30 bg-gradient-card animate-slide-up">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="rounded-lg bg-primary/10 p-2">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-lg text-card-foreground">
                  {result.video_title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(result.published_at).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0">
              نتيجة بحث
            </Badge>
            {onPlayVideo && (
              <Button
                size="sm"
                variant="outline"
                onClick={onPlayVideo}
                className="shrink-0"
              >
                <Play className="h-4 w-4 ml-1" />
                تشغيل
              </Button>
            )}
          </div>
          
          <div className="rounded-lg bg-muted/50 p-4 text-right leading-relaxed">
            <p className="text-card-foreground">
              {highlightText(result.transcript, searchTerm)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResult;
