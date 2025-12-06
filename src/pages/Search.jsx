import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, Sparkles, Calendar, Clock, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase"; // Your Supabase client

export default function SearchPage({ youtuber }) {  // Pass youtuber from route or query
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);

  const { toast } = useToast();

  const { data: transcripts = [], isLoading } = useQuery({
    queryKey: ['transcripts', youtuber?.id],
    queryFn: async () => {
      if (!youtuber?.id) return [];
      const { data } = await supabase.from('transcripts').select('*').eq('youtuber_id', youtuber.id);
      return data || [];
    },
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      // Simulate search (replace with real fuzzy/Supabase query)
      const filtered = transcripts.filter(t => t.content.toLowerCase().includes(searchTerm.toLowerCase()));
      setResults(filtered);
      toast({ title: `${filtered.length} نتيجة` });
    } catch (err) {
      toast({ title: 'خطأ في البحث', variant: 'destructive' });
    }
    setIsSearching(false);
  };

  return (
    <div className="flex-1 p-6 space-y-6" dir="rtl">
      {/* Header with Youtuber Profile */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {youtuber?.avatar_url ? (
              <img src={youtuber.avatar_url} alt={youtuber.arabic_name} className="w-16 h-16 rounded-full object-cover border-2 border-purple-200" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {youtuber?.arabic_name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{youtuber?.arabic_name}</h1>
              <p className="text-sm text-gray-500">{youtuber?.english_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card className="border-purple-200">
        <CardContent className="p-6">
          <div className="relative">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن كلمة أو جملة في جميع النصوص..."
              className="h-14 pr-12 text-lg border-2 border-purple-200 focus:border-purple-400 rounded-2xl shadow-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={!searchTerm.trim() || isSearching}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </Button>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm('')}
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters Placeholder (Matching Image) */}
      <Card className="border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">فلاتر البحث</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">تاريخ النشر</label>
              <div className="flex gap-2">
                <Input type="date" placeholder="من" className="h-10 text-sm" />
                <Input type="date" placeholder="إلى" className="h-10 text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">مدة الفيديو</label>
              <div className="flex gap-2">
                <Input type="number" placeholder="أدنى" className="h-10 text-sm" />
                <Input type="number" placeholder="أقصى" className="h-10 text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">حد أدنى للنتائج</label>
              <Input type="number" placeholder="5" className="h-10 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Area (Matching Image) */}
      <Card className="border-purple-200">
        <CardContent className="p-6">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg shadow-sm border border-purple-100">
                  <h3 className="font-semibold text-gray-900">{result.video_title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{result.content.substring(0, 100)}...</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-purple-100 text-purple-800">10:30</Badge>
                    <Badge className="bg-orange-100 text-orange-800">فيديو 1</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>ابدأ البحث لعرض النتائج</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
