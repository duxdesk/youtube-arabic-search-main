import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useYoutubers, useTranscripts, useDeleteYoutuber, useUpdateYoutuberRank, useDeleteTranscript, useDeleteAllTranscripts } from "@/lib/local-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Users, Video, Trash2, Search, AlertTriangle } from "lucide-react";
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

const Manage = () => {
  const { data: youtubers } = useYoutubers();
  const { data: transcripts } = useTranscripts();
  const deleteYoutuber = useDeleteYoutuber();
  const deleteTranscript = useDeleteTranscript();
  const deleteAllTranscripts = useDeleteAllTranscripts();
  const updateRank = useUpdateYoutuberRank();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [youtuberToDelete, setYoutuberToDelete] = useState<string | null>(null);

  // Transcript management state
  const [selectedYoutuberForTranscripts, setSelectedYoutuberForTranscripts] = useState<string | null>(null);
  const [transcriptToDelete, setTranscriptToDelete] = useState<string | null>(null);
  const [deleteTranscriptDialogOpen, setDeleteTranscriptDialogOpen] = useState(false);
  const [deleteAllTranscriptsDialogOpen, setDeleteAllTranscriptsDialogOpen] = useState(false);

  const transcriptCount = transcripts?.length || 0;

  // Get transcript count per youtuber
  const getTranscriptCount = (youtuberId: string) => {
    return transcripts?.filter(t => t.youtuber_id === youtuberId).length || 0;
  };

  // Filter youtubers by search
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
    }
  };

  const youtuberToDeleteData = youtubers?.find(y => y.id === youtuberToDelete);
  const transcriptsToDelete = getTranscriptCount(youtuberToDelete || "");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 flex gap-8">
        <main className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            إدارة البيانات
          </h1>

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
                  {transcriptCount}
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
                  {transcriptCount}
                </p>
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
                {/* YouTuber Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">اختر اليوتيوبر:</label>
                  <div className="max-w-3xl mx-auto">
                    <div
                      className="grid grid-flow-col auto-cols-[32%] gap-2 overflow-x-auto pb-2 snap-x scroll-smooth"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      <style>
                        {`
                          ::-webkit-scrollbar {
                            height: 4px;
                          }
                          ::-webkit-scrollbar-track {
                            background: transparent;
                          }
                          ::-webkit-scrollbar-thumb {
                            background-color: rgba(156, 163, 175, 0.3);
                            border-radius: 20px;
                          }
                          ::-webkit-scrollbar-thumb:hover {
                            background-color: rgba(156, 163, 175, 0.5);
                          }
                        `}
                      </style>
                      {youtubers?.map((youtuber) => (
                        <Button
                          key={youtuber.id}
                          variant={selectedYoutuberForTranscripts === youtuber.id ? "default" : "outline"}
                          onClick={() => setSelectedYoutuberForTranscripts(youtuber.id)}
                          className="w-full justify-start gap-2 px-3 snap-start"
                        >
                          <Avatar className="h-5 w-5 shrink-0">
                            <AvatarImage src={youtuber.avatar_url} />
                            <AvatarFallback>{youtuber.arabic_name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="truncate text-sm">{youtuber.arabic_name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Transcripts List */}
                {selectedYoutuberForTranscripts && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        قائمة النصوص ({transcripts?.filter(t => t.youtuber_id === selectedYoutuberForTranscripts).length || 0})
                      </h3>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteAllTranscriptsDialogOpen(true)}
                        disabled={!transcripts?.some(t => t.youtuber_id === selectedYoutuberForTranscripts)}
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف جميع النصوص
                      </Button>
                    </div>

                    <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                      {transcripts
                        ?.filter(t => t.youtuber_id === selectedYoutuberForTranscripts)
                        .map((transcript) => (
                          <div key={transcript.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium truncate">{transcript.video_title}</p>
                                <p className="text-xs text-muted-foreground font-mono">{transcript.video_id}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setTranscriptToDelete(transcript.id);
                                setDeleteTranscriptDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      {transcripts?.filter(t => t.youtuber_id === selectedYoutuberForTranscripts).length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          لا توجد نصوص لهذا اليوتيوبر
                        </div>
                      )}
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
                <Badge variant="secondary">
                  {filteredYoutubers.length} يوتيوبر
                </Badge>
              </div>

              {/* Search */}
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
                  filteredYoutubers.map((youtuber) => {
                    const videoCount = getTranscriptCount(youtuber.id);

                    return (
                      <div
                        key={youtuber.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Avatar */}
                          <Avatar className="h-12 w-12 ring-2 ring-border">
                            <AvatarImage src={youtuber.avatar_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {youtuber.arabic_name?.charAt(0) || 'Y'}
                            </AvatarFallback>
                          </Avatar>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground truncate">
                                {youtuber.arabic_name}
                              </p>
                              {youtuber.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {youtuber.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {youtuber.english_name}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {videoCount} فيديو
                              </span>
                              {youtuber.subscriber_count && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {youtuber.subscriber_count}
                                </span>
                              )}
                              <div className="flex items-center gap-2 mr-auto">
                                <span className="text-xs text-muted-foreground">الترتيب:</span>
                                <Input
                                  type="number"
                                  className="w-16 h-7 text-xs"
                                  defaultValue={youtuber.rank || ""}
                                  onBlur={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val)) {
                                      updateRank.mutate({ id: youtuber.id, rank: val });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const val = parseInt(e.currentTarget.value);
                                      if (!isNaN(val)) {
                                        updateRank.mutate({ id: youtuber.id, rank: val });
                                        e.currentTarget.blur();
                                      }
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              navigator.clipboard.writeText(youtuber.id);
                            }}
                          >
                            نسخ ID
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(youtuber.id)}
                            className="gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </main>

        <Sidebar />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right space-y-3">
              <p className="text-base">
                هل أنت متأكد من حذف اليوتيوبر <strong>{youtuberToDeleteData?.arabic_name}</strong>؟
              </p>

              {transcriptsToDelete > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    تحذير!
                  </p>
                  <p className="text-sm mt-1">
                    سيتم حذف <strong>{transcriptsToDelete}</strong> فيديو مرتبط بهذا اليوتيوبر
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                هذا الإجراء لا يمكن التراجع عنه.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
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
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف النص نهائياً.
            </AlertDialogDescription>
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
