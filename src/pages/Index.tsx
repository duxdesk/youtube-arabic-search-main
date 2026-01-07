import { useState, useMemo } from "react";
import { Search, FileText } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useYoutubers } from "@/hooks/useYoutubers";
import { Link } from "react-router-dom";

const Index = () => {
  // The useYoutubers hook now calculates transcript_count automatically
  const { data: youtubers, isLoading } = useYoutubers();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredYoutubers = useMemo(() => {
    if (!youtubers) return [];
    if (!searchQuery.trim()) return youtubers;

    const query = searchQuery.toLowerCase();
    return youtubers.filter(y =>
      y.arabic_name.toLowerCase().includes(query) ||
      y.english_name.toLowerCase().includes(query)
    );
  }, [youtubers, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <div className="container mx-auto px-4 py-8 flex gap-8">
        <main className="flex-1 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              بحث في محتوى اليوتيوبرز
            </h1>
            <p className="text-muted-foreground">
              اختر يوتيوبر للبحث في محتوى القناة
            </p>
          </div>

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

          <div className="space-y-3">
            {filteredYoutubers.map((youtuber) => (
              <Link key={youtuber.id} to={`/search/${youtuber.id}`}>
                <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-border bg-card hover:border-primary/50">
                  <div className="flex items-center justify-between">
                    {/* Updated to use the count from our database hook */}
                    <div className="flex items-center gap-2 text-primary">
                      <span className="font-semibold text-lg">
                        {youtuber.transcript_count || 0}
                      </span>
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <h3 className="font-semibold text-foreground">
                          {youtuber.arabic_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {youtuber.english_name}
                        </p>
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={youtuber.avatar_url} alt={youtuber.arabic_name} />
                        <AvatarFallback>{youtuber.arabic_name?.charAt(0)}</AvatarFallback>
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
