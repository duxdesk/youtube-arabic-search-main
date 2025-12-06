import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useYoutubers } from "@/lib/supabase-hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Creators = () => {
  const { data: youtubers, isLoading } = useYoutubers();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex gap-8">
        <main className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            منشئ الفيديوهات القصيرة
          </h1>

          {isLoading ? (
            <p className="text-muted-foreground">جاري التحميل...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {youtubers?.map((youtuber) => (
                <Card key={youtuber.id} className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={youtuber.avatar} alt={youtuber.name_ar} />
                        <AvatarFallback>{youtuber.name_ar[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {youtuber.name_ar}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {youtuber.subscriber_count} مشترك
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {youtuber.category}
                        </p>
                      </div>
                      <Link to={`/search/${youtuber.id}`}>
                        <Button size="sm" variant="outline">
                          <Search className="h-4 w-4 ml-2" />
                          بحث
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
        
        <Sidebar />
      </div>
    </div>
  );
};

export default Creators;
