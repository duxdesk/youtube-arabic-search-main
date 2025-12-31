import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Search as SearchIcon, Save, History, Play, X, Copy, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { VideoSearchResult } from "@/components/VideoSearchResult";
import SavedSearches from "@/components/SavedSearches";
import YouTubePlayer from "@/components/YouTubePlayer";
import { useYoutuber, useTranscripts } from "@/hooks/useYoutubers";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  videoId: string;
  videoTitle: string;
  timestamp?: string;
}

const Search = () => {
  const { youtuberId } = useParams();
  const safeYoutuberId = youtuberId || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [playerResults, setPlayerResults] = useState<SearchResult[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerStartTime, setPlayerStartTime] = useState<number | undefined>(undefined);
  const { toast } = useToast();

  const resultsPerPage = 10;

  const {
    data: youtuber,
    isLoading: isLoadingYoutuber,
    error: youtuberError
  } = useYoutuber(safeYoutuberId);

  const {
    data: transcripts,
    isLoading: isLoadingTranscripts,
    error: transcriptsError
  } = useTranscripts(safeYoutuberId);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim() || !transcripts) return [];

    const term = searchTerm.toLowerCase();
    return transcripts.filter((transcript: any) => {
      const videoTitle = transcript.video_title?.toLowerCase() || '';
      if (videoTitle.includes(term)) return true;

      const transcriptText = transcript.transcript?.toLowerCase() || '';
      if (transcriptText.includes(term)) return true;

      if (transcript.timestamps && Array.isArray(transcript.timestamps)) {
        const matchesInTimestamps = transcript.timestamps.some((ts: any) =>
          (ts.text?.toLowerCase() || '').includes(term)
        );
        if (matchesInTimestamps) return true;
      }

      return false;
    });
  }, [searchTerm, transcripts]);

  useEffect(() => {
    if (searchResults.length > 0) {
      const formattedResults: SearchResult[] = searchResults.map(result => ({
        videoId: result.video_id,
        videoTitle: result.video_title,
        timestamp: result.published_at
      }));
      setPlayerResults(formattedResults);
    } else {
      setPlayerResults([]);
    }
  }, [searchResults]);

  const paginatedResults = useMemo(() => {
    return searchResults.slice(
      (page - 1) * resultsPerPage,
      page * resultsPerPage
    );
  }, [searchResults, page]);

  const totalPages = Math.ceil(searchResults.length / resultsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setCurrentPlayerIndex(0);

    if (!searchTerm.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال كلمة للبحث",
        variant: "destructive",
      });
      return;
    }

    if (searchResults.length === 0) {
      toast({
        title: "لا توجد نتائج",
        description: `لم يتم العثور على نتائج للبحث عن "${searchTerm}"`,
      });
    } else {
      toast({
        title: "تم البحث",
        description: `تم العثور على ${searchResults.length} نتيجة`,
      });
    }
  };

  const handlePlayVideo = (videoId: string, timestamp?: number) => {
    if (selectedVideoId === videoId && playerStartTime === timestamp) {
      setSelectedVideoId(null);
      setTimeout(() => {
        setSelectedVideoId(videoId);
        setPlayerStartTime(timestamp);
      }, 0);
    } else {
      setSelectedVideoId(videoId);
      setPlayerStartTime(timestamp);
    }

    const index = playerResults.findIndex(r => r.videoId === videoId);
    if (index !== -1) {
      setCurrentPlayerIndex(index);
    }
  };

  const handleNavigatePlayer = (index: number) => {
    if (index >= 0 && index < playerResults.length) {
      setCurrentPlayerIndex(index);
      setSelectedVideoId(playerResults[index].videoId);
      setPlayerStartTime(undefined);
      toast({
        title: "تم التبديل",
        description: `الآن تشاهد: ${playerResults[index].videoTitle}`,
      });
    }
  };

  const handleApplySavedSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
    setCurrentPlayerIndex(0);
    toast({
      title: "تم التحميل",
      description: `تم تحميل البحث المحفوظ: "${term}"`,
    });
  };

  if (youtuberError || transcriptsError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-muted-foreground">حدث خطأ في تحميل البيانات</p>
          <Button
            className="mt-6"
            onClick={() => window.location.reload()}
          >
            إعادة المحاولة
          </Button>
          <Link to="/" className="block mt-4">
            <Button variant="outline">العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingYoutuber || isLoadingTranscripts) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!youtuber) {
    return (
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 flex gap-8">
        <main className="flex-1">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للرئيسية</span>
          </Link>

          <div className="flex items-center gap-6 rounded-2xl bg-card p-6 shadow-md border border-border mb-8">
            <Avatar className="h-24 w-24">
              <AvatarImage src={youtuber.avatar_url} alt={youtuber.arabic_name} />
              <AvatarFallback>{youtuber.arabic_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {youtuber.arabic_name}
              </h1>
              <p className="text-lg text-muted-foreground">{youtuber.english_name}</p>
              {youtuber.description && (
                <p className="text-sm text-muted-foreground">{youtuber.description}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {transcripts?.length || 0} فيديو متاح للبحث
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن كلمة أو جملة في جميع الفيديوهات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 pr-12 pl-24 text-lg border-border bg-card"
              />
              <Button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90"
              >
                بحث
              </Button>
            </div>
          </form>

          <div className="mb-8">
            <SavedSearches
              youtuberId={safeYoutuberId}
              currentSearch={searchTerm}
              onApplySearch={handleApplySavedSearch}
            />
          </div>

          <div className="space-y-4">
            {!searchTerm && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <SearchIcon className="h-8 w-8 text-primary" />
                </div>
                <p className="text-xl font-medium text-foreground">
                  ابدأ البحث في نصوص {youtuber.arabic_name}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  اكتب كلمة أو جملة في صندوق البحث أعلاه
                </p>
              </div>
            )}

            {searchTerm && searchResults.length === 0 && (
              <div className="text-center py-12">
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
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">
                    {searchResults.length} نتيجة للبحث عن "{searchTerm}"
                  </h2>
                  {totalPages > 1 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      الصفحة {page} من {totalPages} - عرض {paginatedResults.length} من {searchResults.length} نتيجة
                    </p>
                  )}
                </div>
                {/* Scrollable Results Container - Max 3 episodes visible */}
                <div
                  className={`space-y-4 ${paginatedResults.length > 3
                    ? 'max-h-[calc(3*400px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40'
                    : ''
                    }`}
                  style={{
                    scrollBehavior: 'smooth'
                  }}
                >
                  {paginatedResults.map((result) => (
                    <VideoSearchResult
                      key={result.id}
                      result={result}
                      searchTerm={searchTerm}
                      onPlayVideo={(timestamp?: number) => handlePlayVideo(result.video_id, timestamp)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                    >
                      السابق
                    </Button>

                    <span className="text-sm text-muted-foreground px-4">
                      الصفحة {page} من {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                    >
                      التالي
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <Sidebar />
      </div>

      <YouTubePlayer
        videoId={selectedVideoId || undefined}
        results={playerResults}
        currentIndex={currentPlayerIndex}
        totalMatchesCount={searchResults.length}
        startTime={playerStartTime}
        onNavigate={handleNavigatePlayer}
      />
    </div>
  );
};

export default Search;
