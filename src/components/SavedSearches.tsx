import { useState, useEffect } from "react";
import { Bookmark, Search, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SavedSearch {
  id: string;
  term: string;
  createdAt: number;
}

interface SavedSearchesProps {
  youtuberId: string;
  currentSearch: string;
  onApplySearch: (term: string) => void;
}

const SavedSearches = ({ youtuberId, currentSearch, onApplySearch }: SavedSearchesProps) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const storageKey = `saved-searches-${youtuberId}`;

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setSavedSearches(JSON.parse(stored));
    }
  }, [storageKey]);

  const saveCurrentSearch = () => {
    if (!currentSearch.trim()) return;
    
    const exists = savedSearches.some(s => s.term.toLowerCase() === currentSearch.toLowerCase());
    if (exists) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      term: currentSearch,
      createdAt: Date.now()
    };
    
    const updated = [newSearch, ...savedSearches];
    setSavedSearches(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const deleteSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return (
    <div className="bg-amber-50/50 rounded-xl border border-border/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">عمليات البحث المحفوظة</h3>
        </div>
        <span className="text-sm text-muted-foreground">{savedSearches.length} بحث محفوظ</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
        <Button
          onClick={saveCurrentSearch}
          disabled={!currentSearch.trim()}
          size="sm"
          className="bg-primary/10 text-primary hover:bg-primary/20"
        >
          <Bookmark className="w-4 h-4 ml-2" />
          حفظ البحث الحالي
        </Button>
      </div>

      {isExpanded && savedSearches.length > 0 && (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {savedSearches.map((search) => (
            <div 
              key={search.id} 
              className="bg-background rounded-lg p-3 border border-border/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Search className="w-3 h-3 ml-1" />
                    {search.term}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate flex-1 mx-3 text-right">
                  البحث عن كلمه "{search.term}"
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2 justify-start">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => deleteSearch(search.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onApplySearch(search.term)}
                  className="bg-primary text-primary-foreground"
                >
                  <Search className="w-4 h-4 ml-2" />
                  تطبيق
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isExpanded && savedSearches.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          لا توجد عمليات بحث محفوظة
        </p>
      )}
    </div>
  );
};

export default SavedSearches;
