import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Transcript } from "@/lib/supabase-hooks";

interface MatchPosition {
  index: number;
  position: number; // 0-100 percentage for timeline display
  timestamp: number; // actual seconds for video seeking
  text: string;
  context: string;
}

interface VideoSearchResultProps {
  result: Transcript;
  searchTerm: string;
  onPlayVideo: (timestamp?: number) => void;
}

// Parse timestamp string (e.g., "1:35" or "12:45") to seconds
const parseTimestamp = (ts: string): number => {
  const parts = ts.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
};

// Extract all timestamps from transcript with their positions
const extractTimestamps = (transcript: string): { position: number; seconds: number }[] => {
  // Try multiple patterns to find timestamps
  // Pattern 1: Timestamps on their own line (e.g., "0:35\n" or "\n1:23:45\n")
  // Pattern 2: Timestamps anywhere in text
  const patterns = [
    /(?:^|\n)(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:\n|$)/gm,
    /\b(\d{1,2}:\d{2}:\d{2})\b/g, // HH:MM:SS format
    /(?:^|\s)(\d{1,2}:\d{2})(?:\s|$|\n)/gm, // MM:SS format with boundaries
  ];
  
  const timestamps: { position: number; seconds: number }[] = [];
  
  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(transcript)) !== null) {
      const seconds = parseTimestamp(match[1]);
      // Avoid duplicates
      if (!timestamps.some(t => Math.abs(t.position - match.index) < 10 && t.seconds === seconds)) {
        timestamps.push({
          position: match.index,
          seconds
        });
      }
    }
  }
  
  // Sort by position
  timestamps.sort((a, b) => a.position - b.position);
  
  return timestamps;
};

// Estimate video duration based on transcript length (rough estimate: ~150 chars per 10 seconds)
const estimateTimestampFromPosition = (position: number, totalLength: number, estimatedDuration: number = 600): number => {
  const percentage = position / totalLength;
  return Math.floor(percentage * estimatedDuration);
};

const VideoSearchResult = ({ result, searchTerm, onPlayVideo }: VideoSearchResultProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Find all match positions in the transcript with actual timestamps
  const findMatches = (): MatchPosition[] => {
    if (!searchTerm.trim()) return [];
    
    const matches: MatchPosition[] = [];
    const lowerText = result.transcript.toLowerCase();
    const lowerTerm = searchTerm.toLowerCase();
    const totalLength = result.transcript.length;
    const timestamps = extractTimestamps(result.transcript);
    
    let startIndex = 0;
    let matchIndex = 0;
    
    while ((startIndex = lowerText.indexOf(lowerTerm, startIndex)) !== -1) {
      const position = (startIndex / totalLength) * 100;
      
      // Find the nearest timestamp before this match
      let timestamp = 0;
      
      if (timestamps.length > 0) {
        // Use actual timestamps from transcript
        for (let i = timestamps.length - 1; i >= 0; i--) {
          if (timestamps[i].position <= startIndex) {
            timestamp = timestamps[i].seconds;
            break;
          }
        }
      } else {
        // No timestamps found - estimate based on position in transcript
        // Assume average video is 10 minutes (600 seconds)
        timestamp = estimateTimestampFromPosition(startIndex, totalLength, 600);
      }
      
      // Get context around the match (50 chars before and after)
      const contextStart = Math.max(0, startIndex - 50);
      const contextEnd = Math.min(totalLength, startIndex + searchTerm.length + 50);
      const context = result.transcript.substring(contextStart, contextEnd);
      
      matches.push({
        index: matchIndex,
        position,
        timestamp,
        text: result.transcript.substring(startIndex, startIndex + searchTerm.length),
        context: (contextStart > 0 ? '...' : '') + context + (contextEnd < totalLength ? '...' : '')
      });
      
      startIndex += searchTerm.length;
      matchIndex++;
    }
    
    return matches;
  };

  const matches = findMatches();
  const matchCount = matches.length;

  const highlightText = (text: string, term: string) => {
    if (!term.trim()) return text;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={index} className="bg-primary/30 text-primary-foreground font-semibold px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleTimelineClick = (timestamp: number) => {
    onPlayVideo(timestamp);
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-soft hover:border-primary/30 bg-gradient-card animate-slide-up">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
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
                  <span className="font-mono text-xs">#{result.video_id}</span>
                </div>
              </div>
            </div>
            <Badge variant="default" className="shrink-0 bg-primary text-primary-foreground">
              {matchCount} نتيجة
            </Badge>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-right">
              الخط الزمني للنتائج ({matchCount} نتيجة) - اضغط على النقاط للانتقال
            </p>
            <div 
              className="relative h-12 bg-muted/50 rounded-lg cursor-pointer border border-border/50"
              onClick={() => onPlayVideo()}
            >
              {/* Timeline track */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1 bg-muted-foreground/20 rounded-full" />
              
              {/* Match dots */}
              {matches.map((match, idx) => (
                <button
                  key={idx}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full hover:scale-150 transition-transform hover:bg-primary z-10"
                  style={{ left: `${4 + (match.position * 0.92)}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTimelineClick(match.timestamp);
                  }}
                  title={match.context}
                />
              ))}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              إظهار النتائج ({matchCount})
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Expanded Results */}
          {isExpanded && (
            <div className="space-y-3 border-t border-border/50 pt-4">
              {matches.map((match, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTimelineClick(match.timestamp)}
                  className="w-full text-right rounded-lg bg-muted/30 p-3 hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/30"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      نتيجة {idx + 1}
                    </Badge>
                  </div>
                  <p className="text-sm text-card-foreground leading-relaxed">
                    {highlightText(match.context, searchTerm)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoSearchResult;
