import { Play, ChevronLeft, ChevronRight, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResult {
  videoId: string;
  videoTitle: string;
  timestamp?: string;
}

interface YouTubePlayerProps {
  videoId?: string;
  results?: SearchResult[];
  currentIndex?: number;
  totalMatchesCount?: number;
  startTime?: number; // timestamp in seconds
  onNavigate?: (index: number) => void;
}

// Extract video ID from YouTube URL or return as-is if already an ID
const extractVideoId = (url: string): string => {
  if (!url) return '';
  
  // If it's already just an ID (11 characters, alphanumeric with - and _)
  if (/^[\w-]{11}$/.test(url)) return url;
  
  // Extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /v=([^&\s]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return url;
};

const YouTubePlayer = ({ videoId, results = [], currentIndex = 0, totalMatchesCount = 0, startTime, onNavigate }: YouTubePlayerProps) => {
  const totalResults = results.length;
  const currentResult = results[currentIndex];
  const actualVideoId = videoId ? extractVideoId(videoId) : '';

  const handlePrevious = () => {
    if (onNavigate && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (onNavigate && currentIndex < totalResults - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 w-80 z-50">
      <div className="bg-amber-50 rounded-xl shadow-lg border border-border/50 overflow-hidden">
      {actualVideoId ? (
          <iframe
            key={`${actualVideoId}-${startTime}`}
            width="100%"
            height="180"
            src={`https://www.youtube.com/embed/${actualVideoId}?autoplay=1${startTime !== undefined ? `&start=${startTime}` : ''}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="aspect-video"
          />
        ) : (
          <div className="h-44 flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
            <div className="w-16 h-16 rounded-full bg-amber-200/50 flex items-center justify-center mb-3">
              <Play className="w-8 h-8 text-amber-500 fill-amber-500" />
            </div>
          </div>
        )}
        
        {/* Player Controls Section */}
        <div className="p-4 space-y-3 bg-amber-50">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clapperboard className="w-5 h-5 text-foreground" />
              <span className="font-bold text-foreground">المشغل المباشر</span>
            </div>
            <p className="text-sm text-muted-foreground">
              اضغط على أي نتيجة لتشغيلها
            </p>
          </div>

          {/* Navigation Controls */}
          {totalResults > 0 && (
            <>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentIndex >= totalResults - 1}
                  className="flex items-center gap-1 bg-background border-border"
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="font-mono text-sm font-medium text-foreground px-3">
                  {currentIndex + 1} / {totalMatchesCount || totalResults}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentIndex <= 0}
                  className="flex items-center gap-1 bg-background border-border"
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </Button>
              </div>

              {/* Current Video Info */}
              {currentResult && (
                <div className="text-center py-2 px-3 rounded-lg bg-amber-100/50 border border-amber-200/50">
                  <p className="font-medium text-foreground text-sm truncate">
                    {currentResult.videoTitle}
                  </p>
                  {currentResult.timestamp && (
                    <p className="text-primary font-mono text-sm mt-1">
                      {currentResult.timestamp}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;