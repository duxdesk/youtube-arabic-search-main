import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import VideoSearchResult from "@/components/VideoSearchResult";
import YouTubePlayer from "@/components/YouTubePlayer";
import SavedSearches from "@/components/SavedSearches";
import { useYoutuber, useTranscripts, Transcript } from "@/lib/local-hooks";
import { toast } from "sonner";

interface MatchInfo {
  videoId: string;
  videoTitle: string;
  timestamp: number;
  videoIndex: number;
}

const Search = () => {
  const { youtuberId } = useParams<{ youtuberId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentVideoId, setCurrentVideoId] = useState<string | undefined>();
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [currentStartTime, setCurrentStartTime] = useState<number | undefined>();

  // Helper: Calculate start time with context buffer (start 10-12 seconds before the match)
  const getStartTimeWithContext = (timestamp: number, bufferSeconds: number = 10): number => {
    // Start 10 seconds before the match, but not before 0
    return Math.max(0, timestamp - bufferSeconds);
  };

  const handleApplySearch = (term: string) => {
    setSearchTerm(term);
    setCurrentMatchIndex(0);
  };

  const handlePlayVideo = (videoId: string, videoIndex: number, timestamp?: number) => {
    setCurrentVideoId(videoId);

    // Apply context buffer to the timestamp for playback
    const startTime = timestamp !== undefined ? getStartTimeWithContext(timestamp) : undefined;
    setCurrentStartTime(startTime);

    // Find the match index for this video and timestamp
    let matchIdx = -1;

    if (timestamp !== undefined) {
      // Try to find exact or near-exact match (within 5 seconds tolerance)
      matchIdx = allMatches.findIndex(m =>
        m.videoId === videoId && Math.abs(m.timestamp - timestamp) < 5
      );
    }

    if (matchIdx === -1) {
      // If no timestamp match, find first match in this video
      matchIdx = allMatches.findIndex(m => m.videoId === videoId);

      // If we found a match by video ID but no timestamp was provided,
      // use the timestamp from the first match
      if (matchIdx !== -1 && timestamp === undefined) {
        const matchTimestamp = allMatches[matchIdx].timestamp;
        const calculatedStartTime = getStartTimeWithContext(matchTimestamp);
        setCurrentStartTime(calculatedStartTime);
      }
    }

    if (matchIdx !== -1) {
      setCurrentMatchIndex(matchIdx);
    }
  };

  const handleNavigateMatch = (matchIndex: number) => {
    if (allMatches[matchIndex]) {
      const match = allMatches[matchIndex];
      setCurrentMatchIndex(matchIndex);
      setCurrentVideoId(match.videoId);
      // Apply context buffer to the timestamp
      const startTime = getStartTimeWithContext(match.timestamp);
      setCurrentStartTime(startTime);
    }
  };

  const { data: youtuber, isLoading: isLoadingYoutuber } = useYoutuber(youtuberId || "");
  const { data: transcripts, isLoading: isLoadingTranscripts } = useTranscripts(youtuberId);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim() || !transcripts) return [];

    const term = searchTerm.toLowerCase();
    return transcripts.filter(transcript => {
      // Search in the combined transcript text
      const transcriptText = transcript.transcript?.toLowerCase() || '';
      const videoTitle = transcript.video_title?.toLowerCase() || '';

      return transcriptText.includes(term) || videoTitle.includes(term);
    });
  }, [searchTerm, transcripts]);

  // Extract all individual matches with their timestamps
  const allMatches = useMemo((): MatchInfo[] => {
    if (!searchTerm.trim() || !searchResults.length) return [];

    const matches: MatchInfo[] = [];
    const term = searchTerm.toLowerCase();

    searchResults.forEach((result, videoIndex) => {
      // Search in timestamps if available
      if (result.timestamps && result.timestamps.length > 0) {
        result.timestamps.forEach(ts => {
          const lowerText = ts.text.toLowerCase();
          if (lowerText.includes(term)) {
            matches.push({
              videoId: result.video_id,
              videoTitle: result.video_title || 'عنوان غير متوفر',
              timestamp: ts.start_time || 0,
              videoIndex
            });
          }
        });
      } else {
        // Fallback: if no timestamps, just add one match per video
        const transcriptText = result.transcript?.toLowerCase() || '';
        if (transcriptText.includes(term)) {
          matches.push({
            videoId: result.video_id,
            videoTitle: result.video_title || 'عنوان غير متوفر',
            timestamp: 0,
            videoIndex
          });
        }
      }
    });

    return matches;
  }, [searchTerm, searchResults]);

  const totalMatchesCount = allMatches.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error("الرجاء إدخال كلمة للبحث");
      return;
    }

    if (searchResults.length === 0) {
      toast.info("لم يتم العثور على نتائج");
    } else {
      toast.success(`تم العثور على ${totalMatchesCount} نتيجة في ${searchResults.length} فيديو`);
    }
  };

  if (isLoadingYoutuber || isLoadingTranscripts) {
    return (
      <div className="min-h-screen bg-gradient-secondary">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!youtuber) {
    return (
      <div className="min-h-screen bg-gradient-secondary">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-muted-foreground">لم يتم العثور على اليوتيوبر</p>
          <Link to="/">
            <Button className="mt-6">العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <Header />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Youtuber Info */}
        <div className="mb-8 animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للرئيسية</span>
          </Link>

          <div className="flex items-center gap-6 rounded-2xl bg-gradient-card p-6 shadow-soft border border-border/50">
            <img
              src={youtuber.avatar_url || 'https://via.placeholder.com/150'}
              alt={youtuber.arabic_name || ''}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
            />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {youtuber.arabic_name || 'اسم غير متوفر'}
              </h1>
              <p className="text-lg text-muted-foreground">{youtuber.english_name || ''}</p>
              {youtuber.description && (
                <p className="text-sm text-muted-foreground">{youtuber.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Search Form and Saved Searches Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Search Form */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث عن كلمة أو جملة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-14 pr-12 text-lg border-border/50 focus:border-primary focus:ring-primary bg-card shadow-soft"
                />
                <Button
                  type="submit"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-gradient-primary hover:shadow-glow transition-all"
                >
                  بحث
                </Button>
              </div>
            </form>
          </div>

          {/* Saved Searches */}
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <SavedSearches
              youtuberId={youtuberId || ""}
              currentSearch={searchTerm}
              onApplySearch={handleApplySearch}
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-4 pb-52 lg:pb-4">
          {searchTerm && searchResults.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <SearchIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-xl text-muted-foreground">
                لم يتم العثور على نتائج للبحث عن "{searchTerm}"
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                جرب كلمات مختلفة أو تأكد من الإملاء
              </p>
            </div>
          )}

          {searchResults.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-2xl font-bold">
                  {totalMatchesCount} نتيجة في {searchResults.length} فيديو
                </h2>
              </div>

              {/* Horizontal Scroll Container */}
              <div className="relative">
                {/* Scroll Hint */}
                {searchResults.length > 2 && (
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                      اسحب لليمين أو اليسار لرؤية المزيد
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </p>
                  </div>
                )}

                {/* Scrollable Episodes Container */}
                <div
                  className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'hsl(var(--primary)) hsl(var(--muted))',
                  }}
                >
                  {searchResults.map((result, index) => (
                    <div
                      key={result.youtuber_id + '-' + result.video_id}
                      className="flex-shrink-0 snap-start"
                      style={{
                        width: 'calc(50% - 12px)',
                        minWidth: '400px',
                        animationDelay: `${0.1 * (index + 1)}s`
                      }}
                    >
                      <VideoSearchResult
                        result={result}
                        searchTerm={searchTerm}
                        onPlayVideo={(position) => handlePlayVideo(result.video_id, index, position)}
                      />
                    </div>
                  ))}
                </div>

                {/* Custom Scrollbar Styling */}
                <style>{`
                  .overflow-x-auto::-webkit-scrollbar {
                    height: 8px;
                  }
                  .overflow-x-auto::-webkit-scrollbar-track {
                    background: hsl(var(--muted));
                    border-radius: 4px;
                  }
                  .overflow-x-auto::-webkit-scrollbar-thumb {
                    background: hsl(var(--primary));
                    border-radius: 4px;
                  }
                  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--primary) / 0.8);
                  }
                `}</style>
              </div>
            </>
          )}

          {!searchTerm && (
            <div className="text-center py-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary shadow-glow mb-4">
                <SearchIcon className="h-8 w-8 text-primary-foreground" />
              </div>
              <p className="text-xl font-medium text-foreground">
                ابدأ البحث في نصوص {youtuber.arabic_name || 'اليوتيوبر'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                اكتب كلمة أو جملة في صندوق البحث أعلاه
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Fixed YouTube Player */}
      <YouTubePlayer
        videoId={currentVideoId}
        results={allMatches.map(m => ({
          videoId: m.videoId,
          videoTitle: m.videoTitle,
          timestamp: formatTime(m.timestamp)
        }))}
        currentIndex={currentMatchIndex}
        totalMatchesCount={totalMatchesCount}
        startTime={currentStartTime}
        onNavigate={handleNavigateMatch}
      />
    </div>
  );
};

// Helper function to format seconds to MM:SS
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default Search;
