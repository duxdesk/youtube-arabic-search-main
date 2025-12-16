import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background" dir="rtl">
      <h1 className="text-4xl font-bold mb-8">بحث يوتيوب عربي</h1>
      <div className="flex w-full max-w-md gap-2">
        <Input placeholder="ابحث عن صانعي محتوى عربي..." />
        <Button asChild variant="default">
          <Link to="/search/test">
            <Search className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <p className="mt-4 text-muted-foreground">مدعوم بـ Supabase و Fuse.js</p>
    </div>
  );
};

export default Index;
