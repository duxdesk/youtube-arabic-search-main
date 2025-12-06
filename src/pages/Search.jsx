import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2 } from "lucide-react";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setResults(["Placeholder result 1", "Placeholder result 2"]); // Simulate API
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 text-center">بحث في النصوص</h1>
        <div className="relative">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن كلمة أو جملة..."
            className="h-14 pr-12 text-lg border-2 border-orange-200 rounded-2xl"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={!searchTerm.trim() || isSearching}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <SearchIcon className="w-5 h-5" />}
          </Button>
        </div>
        {isSearching ? (
          <div className="text-center p-8">
            <Loader2 className="animate-spin mx-auto h-8 w-8 text-orange-500" />
            <p>جاري البحث...</p>
          </div>
        ) : results.length > 0 ? (
          <ul className="space-y-2">
            {results.map((result, idx) => (
              <li key={idx} className="p-4 bg-white rounded-lg shadow border-orange-200">
                {result}
              </li>
            ))}
          </ul>
        ) : searchTerm && (
          <div className="text-center p-8 text-gray-500">
            لا نتائج. جرب كلمات أخرى!
          </div>
        )}
      </div>
    </div>
  );
}
