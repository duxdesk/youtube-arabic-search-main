import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import {
  useYoutubers,
  useAllTranscripts,
  useDeleteYoutuber,
  useUpdateYoutuberRank,
  useDeleteTranscript,
  useDeleteAllTranscripts
} from "@/hooks/useYoutubers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Users, Video, Trash2, Search, AlertTriangle, Lock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

// ⚠️ CHANGE THIS PASSWORD TO YOUR OWN! ⚠️
const ADMIN_PASSWORD = "admin123";

const Manage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Password protection
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordError, setShowPasswordError] = useState(false);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('manage_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('manage_auth', 'true');
      setShowPasswordError(false);
      toast({
        title: "تم تسجيل الدخول",
        description: "مرحباً بك في صفحة الإدارة",
      });
    } else {
      setShowPasswordError(true);
      setPasswordInput("");
      toast({
        title: "كلمة مرور خاطئة",
        description: "الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('manage_auth');
    navigate('/');
  };

  // Main data hooks
  const { data: youtubers, isLoading: youtubersLoading } = useYoutubers();
  const { data: transcripts, isLoading: transcriptsLoading } = useAllTranscripts();
  const deleteYoutuber = useDeleteYoutuber();
  const deleteTranscript = useDeleteTranscript();
  const deleteAllTranscripts = useDeleteAllTranscripts();
  const updateRank = useUpdateYoutuberRank();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [youtuberToDelete, setYoutuberToDelete] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const [selectedYoutuberForTranscripts, setSelectedYoutuberForTranscripts] = useState<string | null>(null);
  const [transcriptToDelete, setTranscriptToDelete] = useState<string | null>(null);
  const [deleteTranscriptDialogOpen, setDeleteTranscriptDialogOpen] = useState(false);
  const [deleteAllTranscriptsDialogOpen, setDeleteAllTranscriptsDialogOpen] = useState(false);

  useEffect(() => {
    if (!initializedRef.current && !youtubersLoading && youtubers) {
      const savedYoutuberId = localStorage.getItem('selectedYoutuberForTranscripts');
      if (savedYoutuberId && youtubers.some(y => y.id === savedYoutuberId)) {
        setSelectedYoutuberForTranscripts(savedYoutuberId);
      }
      initializedRef.current = true;
    }
  }, [youtubers, youtubersLoading]);

  useEffect(() => {
    if (selectedYoutuberForTranscripts) {
      localStorage.setItem('selectedYoutuberForTranscripts', selectedYoutuberForTranscripts);
    } else {
      localStorage.removeItem('selectedYoutuberForTranscripts');
    }
  }, [selectedYoutuberForTranscripts]);

  const transcriptCount = transcripts?.length || 0;

  const getTranscriptCount = (youtuberId: string) => {
    return transcripts?.filter(t => t.youtuber_id === youtuberId).length || 0;
  };

  const filteredYoutubers = youtubers?.filter(y =>
    !searchQuery.trim() ||
    y.arabic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    y.english_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDeleteClick = (youtuberId: string) => {
    setYoutuberToDelete(youtuberId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (youtuberToDelete) {
      await deleteYoutuber.mutateAsync(youtuberToDelete);
      setDeleteDialogOpen(false);
      setYoutuberToDelete(null);
      if (selectedYoutuberForTranscripts === youtuberToDelete) {
        setSelectedYoutuberForTranscripts(null);
      }
    }
  };

  const handleSelectYoutuberForTranscripts = (youtuberId: string) => {
    if (selectedYoutuberForTranscripts === youtuberId) {
      setSelectedYoutuberForTranscripts(null);
    } else {
      setSelectedYoutuberForTranscripts(youtuberId);
    }
  };

  const youtuberToDeleteData = youtubers?.find(y => y.id === youtuberToDelete);
  const transcriptsToDelete = getTranscriptCount(youtuberToDelete || "");
  const selectedYoutuber = youtubers?.find(y => y.id === selectedYoutuberForTranscripts);
  const selectedYoutuberTranscripts = transcripts?.filter(t => t.youtuber_id === selectedYoutuberForTranscripts) || [];

  // Password Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto mt-20">
            <Card className="border-border bg-card">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">صفحة محمية</CardTitle>
                <p className="text-muted-foreground mt-2">
                  يرجى إدخال كلمة المرور للوصول إلى صفحة الإدارة
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="password"
                      placeholder="كلمة المرور"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setShowPasswordError(false);
                      }}
                      className={`text-center text-lg ${showPasswordError ? 'border-red-500' : ''}`}
                      autoFocus
                    />
                    {showPasswordError && (
                      <p className="text-sm text-red-500 mt-2 text-center">
                        كلمة المرور غير صحيحة
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    دخول
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/')}
                  >
                    العودة للرئيسية
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (youtubersLoading || transcriptsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex gap-8">
          <main className="flex-1">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          </main>
          <Sidebar />
        </div>
      </div>
    );
  }

  // Main Manage Page
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 flex gap-8">
        <main className="flex-1">
          {/* Header with Logout */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">إدارة البيانات</h1>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <Lock className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  عدد اليوتيوبرز
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{youtubers?.length || 0}</p>
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
                <p className="text-3xl font-bold text-foreground">{transcriptCount}</p>
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
                <p className="text-3xl font-bold text-foreground">{transcriptCount}</p>
              </CardContent>
            </Card>
          </div>

          {/* Manage Transcripts Section */}
          <Card className="border-border bg-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                إدارة النصوص
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اختر اليوتيوبر:</label>
                  <div className="max-w-3xl mx-auto">
                    <div className="relative">
                      {/* Horizontal Scroll Container - Shows 3 at a time */}
                      <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory gap-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {youtubers?.map((youtuber) => (
                          <div
                            key={youtuber.id}
                            className="flex-shrink-0 w-[calc(33.333%-0.5rem)] snap-center"
                          >
                            <Button
                              variant={selectedYoutuberForTranscripts === youtuber.id ? "default" : "outline"}
                              onClick={() => handleSelectYoutuberForTranscripts(youtuber.id)}
                              className="w-full h-full flex flex-col items-center justify-center p-4 gap-3"
                            >
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={youtuber.avatar_url} />
                                <AvatarFallback className="text-lg">
                                  {youtuber.arabic_name?.[0] || 'Y'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-center">
                                <span className="font-medium block text-sm truncate w-full">
                                  {youtuber.arabic_name}
                                </span>
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  {getTranscriptCount(youtuber.id)} نص
                                </Badge>
                              </div>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scroll indicator dots */}
                    {youtubers && youtubers.length > 3 && (
                      <div className="flex justify-center gap-1 mt-4">
                        {Array.from({ length: Math.ceil(youtubers.length / 3) }).map((_, index) => (
                          <div
                            key={index}
                            className="w-2 h-2 rounded-full bg-gray-300"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedYoutuber && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={selectedYoutuber.avatar_url} />
                            <AvatarFallback>{selectedYoutuber.arabic_name?.[0] || 'Y'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{selectedYoutuber.arabic_name}</h3>
                            <p className="text-sm text-muted-foreground">{selectedYoutuber.english_name}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedYoutuberForTranscripts(null)}>
                          إلغاء التحديد
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">قائمة النصوص ({selectedYoutuberTranscripts.length})</h3>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteAllTranscriptsDialogOpen(true)}
                          disabled={selectedYoutuberTranscripts.length === 0}
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف جميع النصوص
                        </Button>
                      </div>

                      <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                        {selectedYoutuberTranscripts.map((transcript) => (
                          <div key={transcript.id} className="p-3 flex items-center justify-between hover:bg-muted/50">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">{transcript.video_title}</p>
                                <p className="text-xs text-muted-foreground">{transcript.video_id}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                setTranscriptToDelete(transcript.id);
                                setDeleteTranscriptDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {selectedYoutuberTranscripts.length === 0 && (
                          <div className="p-8 text-center text-muted-foreground">
                            لا توجد نصوص لهذا اليوتيوبر
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* YouTubers Management */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  إدارة اليوتيوبرز
                </CardTitle>
                <Badge variant="secondary">{filteredYoutubers.length} يوتيوبر</Badge>
              </div>
              <div className="relative mt-4">
                <Input
                  type="text"
                  placeholder="ابحث عن يوتيوبر..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredYoutubers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {searchQuery ? `لا توجد نتائج لـ "${searchQuery}"` : 'لا يوجد يوتيوبرز'}
                  </p>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3">
                    {filteredYoutubers.map((youtuber) => {
                      const videoCount = getTranscriptCount(youtuber.id);
                      return (
                        <div key={youtuber.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={youtuber.avatar_url} />
                              <AvatarFallback>{youtuber.arabic_name?.charAt(0) || 'Y'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold truncate">{youtuber.arabic_name}</p>
                                {youtuber.category && <Badge variant="secondary" className="text-xs">{youtuber.category}</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{youtuber.english_name}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {videoCount} فيديو
                                </span>
                                <div className="flex items-center gap-2">
                                  <span>الترتيب:</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    className="w-16 h-7 text-xs"
                                    defaultValue={youtuber.rank || 0}
                                    onBlur={(e) => {
                                      const val = e.target.value;
                                      const rankValue = val === "" ? 0 : parseInt(val);
                                      if (!isNaN(rankValue)) {
                                        updateRank.mutate({ id: youtuber.id, rank: rankValue });
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const val = e.currentTarget.value;
                                        const rankValue = val === "" ? 0 : parseInt(val);
                                        if (!isNaN(rankValue)) {
                                          updateRank.mutate({ id: youtuber.id, rank: rankValue });
                                        }
                                        e.currentTarget.blur();
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(youtuber.id);
                                toast({ title: "تم النسخ", description: "تم نسخ معرف اليوتيوبر" });
                              }}
                            >
                              نسخ ID
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(youtuber.id)}>
                              <Trash2 className="h-4 w-4" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
        <Sidebar />
      </div>

      {/* Delete YouTuber Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right space-y-3">
              <p>هل أنت متأكد من حذف اليوتيوبر <strong>{youtuberToDeleteData?.arabic_name}</strong>؟</p>
              {transcriptsToDelete > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">سيتم حذف <strong>{transcriptsToDelete}</strong> فيديو مرتبط</p>
                </div>
              )}
              <p className="text-sm">هذا الإجراء لا يمكن التراجع عنه.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              حذف نهائياً
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Transcript Dialog */}
      <AlertDialog open={deleteTranscriptDialogOpen} onOpenChange={setDeleteTranscriptDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا النص؟</AlertDialogTitle>
            <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={async () => {
                if (transcriptToDelete) {
                  await deleteTranscript.mutateAsync(transcriptToDelete);
                  setDeleteTranscriptDialogOpen(false);
                  setTranscriptToDelete(null);
                }
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Transcripts Dialog */}
      <AlertDialog open={deleteAllTranscriptsDialogOpen} onOpenChange={setDeleteAllTranscriptsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف جميع النصوص؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف جميع نصوص هذا اليوتيوبر نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={async () => {
                if (selectedYoutuberForTranscripts) {
                  await deleteAllTranscripts.mutateAsync(selectedYoutuberForTranscripts);
                  setDeleteAllTranscriptsDialogOpen(false);
                }
              }}
            >
              حذف الكل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Manage;
