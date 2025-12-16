import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Transcript } from "@/lib/local-hooks";

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

// Parse duration string (e.g., "15:30" or "1:23:45") to seconds
const parseDuration = (duration?: string): number => {
  if (!duration) return 0;
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
};

// Get video duration from transcript timestamps or duration field
const getVideoDuration = (result: Transcript): number => {
  // First, try to get from duration field
  if (result.duration) {
    const parsed = parseDuration(result.duration);
    if (parsed > 0) return parsed;
  }

  // Second, try to get from timestamps array
  if (result.timestamps && result.timestamps.length > 0) {
    const lastTimestamp = result.timestamps[result.timestamps.length - 1];
    if (lastTimestamp.end_time) {
      return lastTimestamp.end_time;
    }
  }

  // Fallback: estimate based on transcript length (rough: ~150 chars per 10 seconds)
  return Math.max(600, Math.floor(result.transcript.length / 15));
};

const VideoSearchResult = ({ result, searchTerm, onPlayVideo }: VideoSearchResultProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedContextIndex, setExpandedContextIndex] = useState<number | null>(null);

  // Get actual video duration
  const videoDuration = getVideoDuration(result);

  // Get extended context (20 seconds before and after)
  const getExtendedContext = (timestamp: number): string => {
    if (!result.timestamps || result.timestamps.length === 0) {
      return result.transcript || '';
    }

    const contextDuration = 20; // 20 seconds before and after
    const startTime = Math.max(0, timestamp - contextDuration);
    const endTime = timestamp + contextDuration;

    // Find all timestamps within the context window
    const contextSegments = result.timestamps.filter(ts =>
      (ts.start_time || 0) >= startTime && (ts.start_time || 0) <= endTime
    );

    if (contextSegments.length === 0) {
      return result.transcript || '';
    }

    return contextSegments.map(ts => ts.text).join(' ');
  };

  // Find all match positions in the transcript with actual timestamps
  const findMatches = (): MatchPosition[] => {
    if (!searchTerm.trim()) return [];

    const matches: MatchPosition[] = [];
    const lowerTerm = searchTerm.toLowerCase();

    // Search in timestamps array if available
    if (result.timestamps && result.timestamps.length > 0) {
      result.timestamps.forEach((ts, index) => {
        const lowerText = ts.text.toLowerCase();
        let startIndex = 0;

        while ((startIndex = lowerText.indexOf(lowerTerm, startIndex)) !== -1) {
          const timestamp = ts.start_time || 0;
          const position = videoDuration > 0 ? (timestamp / videoDuration) * 100 : 0;

          // Get context
          const contextStart = Math.max(0, startIndex - 50);
          const contextEnd = Math.min(ts.text.length, startIndex + searchTerm.length + 50);
          const context = ts.text.substring(contextStart, contextEnd);

          matches.push({
            index: matches.length,
            position,
            timestamp,
            text: ts.text.substring(startIndex, startIndex + searchTerm.length),
            context: (contextStart > 0 ? '...' : '') + context + (contextEnd < ts.text.length ? '...' : '')
          });

          startIndex += searchTerm.length;
        }
      });
    } else {
      // Fallback: search in full transcript text
      const lowerText = result.transcript.toLowerCase();
      const totalLength = result.transcript.length;
      let startIndex = 0;

      while ((startIndex = lowerText.indexOf(lowerTerm, startIndex)) !== -1) {
        // Estimate timestamp based on position in text
        const estimatedTimestamp = videoDuration > 0
          ? Math.floor((startIndex / totalLength) * videoDuration)
          : 0;
        const position = videoDuration > 0 ? (estimatedTimestamp / videoDuration) * 100 : 0;

        // Get context
        const contextStart = Math.max(0, startIndex - 50);
        const contextEnd = Math.min(totalLength, startIndex + searchTerm.length + 50);
        const context = result.transcript.substring(contextStart, contextEnd);

        matches.push({
          index: matches.length,
          position,
          timestamp: estimatedTimestamp,
          text: result.transcript.substring(startIndex, startIndex + searchTerm.length),
          context: (contextStart > 0 ? '...' : '') + context + (contextEnd < totalLength ? '...' : '')
        });

        startIndex += searchTerm.length;
      }
    }

    return matches;
  };

  const matches = findMatches();
  const matchCount = matches.length;

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

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
                  {result.duration && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {result.duration}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Badge variant="default" className="shrink-0 bg-primary text-primary-foreground">
              {matchCount} نتيجة
            </Badge>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="text-right">
                الخط الزمني للنتائج ({matchCount} نتيجة) - اضغط على النقاط للانتقال
              </span>
              <span className="text-xs font-mono">
                {formatTime(videoDuration)}
              </span>
            </div>
            <div
              className="relative h-12 bg-muted/50 rounded-lg cursor-pointer border border-border/50"
              onClick={() => onPlayVideo()}
            >
              {/* Timeline track */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1 bg-muted-foreground/20 rounded-full" />

              {/* Time markers */}
              <div className="absolute inset-x-4 top-0 bottom-0 flex justify-between items-end pb-1">
                <span className="text-[10px] text-muted-foreground/50">0:00</span>
                <span className="text-[10px] text-muted-foreground/50">{formatTime(videoDuration / 2)}</span>
                <span className="text-[10px] text-muted-foreground/50">{formatTime(videoDuration)}</span>
              </div>

              {/* Match dots */}
              {matches.map((match, idx) => (
                <button
                  key={idx}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full hover:scale-150 transition-transform hover:ring-2 hover:ring-primary/50 z-10"
                  style={{ left: `${4 + (match.position * 0.92)}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTimelineClick(match.timestamp);
                  }}
                  title={`${formatTime(match.timestamp)} - ${match.context}`}
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
                <div key={idx} className="space-y-2">
                  <button
                    onClick={() => handleTimelineClick(match.timestamp)}
                    className="w-full text-right rounded-lg bg-muted/30 p-3 hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/30"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          نتيجة {idx + 1}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(match.timestamp)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedContextIndex(expandedContextIndex === idx ? null : idx);
                        }}
                        className="text-xs h-7"
                      >
                        {expandedContextIndex === idx ? 'إخفاء السياق' : 'اظهار السياق'}
                      </Button>
                    </div>
                    <p className="text-sm text-card-foreground leading-relaxed">
                      {highlightText(match.context, searchTerm)}
                    </p>
                  </button>

                  {/* Extended Context Window */}
                  {expandedContextIndex === idx && (
                    <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 rounded-lg p-4 animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                          السياق الكامل (±20 ثانية)
                        </span>
                      </div>
                      <div className="text-sm text-amber-900/80 dark:text-amber-100/80 leading-relaxed bg-white/50 dark:bg-black/20 rounded p-3 max-h-60 overflow-y-auto">
                        {highlightText(getExtendedContext(match.timestamp), searchTerm)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoSearchResult;
