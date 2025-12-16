import { useState, useMemo } from "react";
import { Search, FileText } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useYoutubers, useTranscripts } from "@/lib/local-hooks";
import { Link } from "react-router-dom";

const Index = () => {
  const { data: youtubers } = useYoutubers();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all transcripts to count per youtuber
  const { data: allTranscripts } = useTranscripts();

  const transcriptCounts = useMemo(() => {
    if (!allTranscripts) return {};

    const counts: Record<string, number> = {};
    allTranscripts.forEach(t => {
      if (t.youtuber_id) {
        counts[t.youtuber_id] = (counts[t.youtuber_id] || 0) + 1;
      }
    });
    return counts;
  }, [allTranscripts]);

  const filteredYoutubers = useMemo(() => {
    if (!youtubers) return [];
    if (!searchQuery.trim()) return youtubers;

    const query = searchQuery.toLowerCase();
    return youtubers.filter(y =>
      (y.arabic_name?.toLowerCase() || '').includes(query) ||
      (y.english_name?.toLowerCase() || '').includes(query)
    );
  }, [youtubers, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 flex gap-8">
        <main className="flex-1 max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              بحث في محتوى اليوتيوبرز
            </h1>
            <p className="text-muted-foreground">
              اختر يوتيوبر للبحث في محتوى القناة
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <Input
                type="text"
                placeholder="ابحث عن يوتيوبر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-lg pr-12 bg-card border-border rounded-full"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Stats Summary */}
          {youtubers && youtubers.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{filteredYoutubers.length}</p>
                    <p className="text-sm text-muted-foreground">يوتيوبر</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {allTranscripts?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">فيديو</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 col-span-2 md:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {Object.keys(transcriptCounts).length}
                    </p>
                    <p className="text-sm text-muted-foreground">قناة نشطة</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* YouTubers List */}
          <div className="space-y-4">
            {filteredYoutubers.map((youtuber) => (
              <Link key={youtuber.id} to={`/search/${youtuber.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer border-border bg-card hover:border-primary/50 group">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="h-20 w-20 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                        <AvatarImage
                          src={youtuber.avatar_url || ''}
                          alt={youtuber.arabic_name || ''}
                        />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                          {youtuber.arabic_name?.charAt(0) || 'Y'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Names */}
                        <div className="mb-2">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {youtuber.arabic_name || 'اسم غير متوفر'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {youtuber.english_name || ''}
                          </p>
                        </div>

                        {/* Description */}
                        {youtuber.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {youtuber.description}
                          </p>
                        )}

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {/* Transcript Count */}
                          <div className="flex items-center gap-1.5 text-primary">
                            <FileText className="h-4 w-4" />
                            <span className="font-semibold">
                              {transcriptCounts?.[youtuber.id] || 0}
                            </span>
                            <span className="text-muted-foreground">فيديو</span>
                          </div>

                          {/* Subscriber Count */}
                          {youtuber.subscriber_count && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>{youtuber.subscriber_count}</span>
                            </div>
                          )}

                          {/* Category */}
                          {youtuber.category && (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                {youtuber.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}

            {filteredYoutubers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery ? `لا توجد نتائج لـ "${searchQuery}"` : 'لا يوجد يوتيوبرز'}
              </p>
            )}
          </div>
        </main>

        <Sidebar />
      </div>
    </div>
  );
};

export default Index;
