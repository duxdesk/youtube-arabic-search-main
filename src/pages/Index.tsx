import { useState, useMemo } from "react";
import { Search, FileText } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useYoutubers } from "@/lib/supabase-hooks";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const Index = () => {
  const { data: youtubers } = useYoutubers();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch transcript counts per youtuber
  const { data: transcriptCounts } = useQuery({
    queryKey: ['transcript-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transcripts')
        .select('youtuber_id');
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(t => {
        counts[t.youtuber_id] = (counts[t.youtuber_id] || 0) + 1;
      });
      return counts;
    }
  });

  const filteredYoutubers = useMemo(() => {
    if (!youtubers) return [];
    if (!searchQuery.trim()) return youtubers;
    
    const query = searchQuery.toLowerCase();
    return youtubers.filter(y => 
      y.name_ar.toLowerCase().includes(query) || 
      y.name_en.toLowerCase().includes(query)
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

          {/* YouTubers List */}
          <div className="space-y-3">
            {filteredYoutubers.map((youtuber) => (
              <Link key={youtuber.id} to={`/search/${youtuber.id}`}>
                <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-border bg-card hover:border-primary/50">
                  <div className="flex items-center justify-between">
                    {/* Transcript Count */}
                    <div className="flex items-center gap-2 text-primary">
                      <span className="font-semibold text-lg">
                        {transcriptCounts?.[youtuber.id] || 0}
                      </span>
                      <FileText className="h-5 w-5" />
                    </div>

                    {/* Name and Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <h3 className="font-semibold text-foreground">
                          {youtuber.name_ar}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {youtuber.name_en}
                        </p>
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={youtuber.avatar} alt={youtuber.name_ar} />
                        <AvatarFallback>{youtuber.name_ar.charAt(0)}</AvatarFallback>
                      </Avatar>
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
