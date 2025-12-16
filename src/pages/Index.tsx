import { useState, useMemo } from "react";
import { Search, FileText } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

const Index = () => {
  const { data: youtubers } = useYoutubers();
  const [searchQuery, setSearchQuery] = useState("");


  const filteredYoutubers = useMemo(() => {
    if (!youtubers) return [];
    if (!searchQuery.trim()) return youtubers;
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
