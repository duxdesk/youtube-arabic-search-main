import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useYoutubers } from "@/lib/supabase-hooks";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Video } from "lucide-react";

const Manage = () => {
  const { data: youtubers } = useYoutubers();
  
  const { data: transcriptCount } = useQuery({
    queryKey: ['transcript-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('transcripts')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex gap-8">
        <main className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            إدارة النصوص
          </h1>

          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  عدد اليوتيوبرز
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {youtubers?.length || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  عدد النصوص
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {transcriptCount || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  الفيديوهات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {transcriptCount || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>قائمة اليوتيوبرز</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {youtubers?.map((youtuber) => (
                  <div key={youtuber.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{youtuber.name_ar}</p>
                      <p className="text-sm text-muted-foreground">{youtuber.name_en}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{youtuber.category}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
        
        <Sidebar />
      </div>
    </div>
  );
};

export default Manage;
