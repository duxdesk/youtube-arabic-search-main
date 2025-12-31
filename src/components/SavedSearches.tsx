import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Trash2, UserCircle, LogOut, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface SavedSearch {
  id: string;
  searchTerm: string;
  savedAt: string;
  comment?: string;
}

interface SavedSearchesProps {
  youtuberId: string;
  currentSearch: string;
  onApplySearch: (searchTerm: string) => void;
}

export const SavedSearches = ({ youtuberId, currentSearch, onApplySearch }: SavedSearchesProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      setIsLoggedIn(true);
      loadSearches(savedUser);
    }
  }, [youtuberId]);

  const loadSearches = (user: string) => {
    const key = `searches_${user}_${youtuberId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setSearches(JSON.parse(saved));
    }
  };

  const handleLogin = () => {
    if (username && password) {
      localStorage.setItem('current_user', username);
      setIsLoggedIn(true);
      loadSearches(username);
      toast({ title: "تم تسجيل الدخول", description: `مرحباً ${username}!` });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    setIsLoggedIn(false);
    setSearches([]);
    toast({ title: "تم تسجيل الخروج" });
  };

  const handleSave = () => {
    if (!currentSearch.trim()) return;
    
    const user = localStorage.getItem('current_user');
    if (!user) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      searchTerm: currentSearch,
      savedAt: new Date().toISOString(),
    };

    const updated = [newSearch, ...searches];
    setSearches(updated);
    
    const key = `searches_${user}_${youtuberId}`;
    localStorage.setItem(key, JSON.stringify(updated));
    
    toast({ title: "تم الحفظ", description: `تم حفظ: "${currentSearch}"` });
  };

  const handleDelete = (id: string) => {
    const user = localStorage.getItem('current_user');
    if (!user) return;

    const updated = searches.filter(s => s.id !== id);
    setSearches(updated);
    
    const key = `searches_${user}_${youtuberId}`;
    localStorage.setItem(key, JSON.stringify(updated));
    
    toast({ title: "تم الحذف" });
  };

  const handleUpdateComment = (id: string, comment: string) => {
    const user = localStorage.getItem('current_user');
    if (!user) return;

    const updated = searches.map(s => 
      s.id === id ? { ...s, comment: comment } : s
    );
    
    setSearches(updated);
    
    const key = `searches_${user}_${youtuberId}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            عمليات البحث المحفوظة
          </CardTitle>
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <UserCircle className="h-3 w-3 ml-1" />
                {localStorage.getItem('current_user')}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {!isLoggedIn ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              سجل دخول لحفظ عمليات البحث
            </p>
            <Input
              placeholder="اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleLogin} className="w-full">
              تسجيل الدخول
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentSearch && (
              <Button onClick={handleSave} variant="outline" className="w-full">
                <Bookmark className="h-4 w-4 ml-2" />
                حفظ: "{currentSearch}"
              </Button>
            )}

            {searches.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                لا توجد عمليات بحث محفوظة
              </p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {searches.map((search, index) => (
                  <div key={search.id} className="flex flex-col p-3 bg-muted/50 rounded-lg space-y-3 border border-transparent hover:border-primary/10 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {index + 1}
                        </span>
                        
                        <button
                          onClick={() => onApplySearch(search.searchTerm)}
                          className="hover:text-primary transition-colors text-right"
                        >
                          <div className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            <span className="font-medium">{search.searchTerm}</span>
                          </div>
                        </button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(search.id)}
                        className="h-8 w-8 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground font-bold mr-1 uppercase tracking-tight">ملاحظات البحث:</p>
                      <Textarea 
                        placeholder="أضف ملاحظاتك هنا..."
                        defaultValue={search.comment || ""}
                        onBlur={(e) => handleUpdateComment(search.id, e.target.value)}
                        className="min-h-[70px] text-sm bg-background/50 border-none resize-none focus-visible:ring-1 focus-visible:ring-primary/20 shadow-inner"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedSearches;
