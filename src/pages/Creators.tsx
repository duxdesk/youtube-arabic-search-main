import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
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
