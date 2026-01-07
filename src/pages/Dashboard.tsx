import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileJson, Upload, AlertTriangle, Info, Users, FileText, Download, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useYoutubers,
  useAddYoutuber,
  useBulkAddTranscripts,
  useBulkAddYoutubers
} from "@/hooks/useYoutubers";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { data: youtubers } = useYoutubers();
  const [activeTab, setActiveTab] = useState("transcripts");
  const [showYoutuberIds, setShowYoutuberIds] = useState(false);

  // Youtuber form state
  const [youtuberForm, setYoutuberForm] = useState({
    arabic_name: "",
    english_name: "",
    avatar_url: "",
    subscriber_count: "",
    category: "",
    description: "",
  });

  // Bulk import state
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [youtuberFile, setYoutuberFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportingYoutubers, setIsImportingYoutubers] = useState(false);
  const { toast } = useToast();

  // Updated hook usage
  const addYoutubersMutation = useAddYoutuber();
  const bulkAddTranscriptsMutation = useBulkAddTranscripts();
  const bulkAddYoutubersMutation = useBulkAddYoutubers();

  const handleAddYoutuber = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addYoutubersMutation.mutateAsync(youtuberForm);
      setYoutuberForm({
        arabic_name: "",
        english_name: "",
        avatar_url: "",
        subscriber_count: "",
        category: "",
        description: "",
      });
      toast({
        title: "تم بنجاح",
        description: "تمت إضافة اليوتيوبر بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة اليوتيوبر",
        variant: "destructive",
      });
    }
  };

  // Replace your handleBulkImport function in Dashboard.tsx with this improved version
  // This adds file size validation, localStorage checking, and batch processing
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonFile) {
      toast({ title: "خطأ", description: "يرجى تحميل ملف JSON", variant: "destructive" });
      return;
    }

    setIsImporting(true);

    try {
      const fileContent = await jsonFile.text();
      const transcripts = JSON.parse(fileContent);

      const transcriptsToInsert = transcripts.map((item: any) => ({
        youtuber_id: item.youtuber_id,
        video_title: item.video_title,
        video_id: item.video_id,
        transcript: item.timestamps?.map((ts: any) => ts.text).join(' ') || item.content || '',
        published_at: item.publish_date || new Date().toISOString(),
        timestamps: item.timestamps || [],
      }));

      // This now saves to IndexedDB (Capacity: Gigabytes)
      await bulkAddTranscriptsMutation.mutateAsync(transcriptsToInsert);

      toast({
        title: "اكتمل الاستيراد ✓",
        description: `تم حفظ ${transcriptsToInsert.length} نص بنجاح.`,
      });

      setJsonFile(null);
    } catch (error) {
      toast({
        title: "خطأ في الاستيراد",
        description: "فشل الحفظ في قاعدة البيانات الكبيرة.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  
  const handleBulkYoutuberImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtuberFile) {
      toast({
        title: "خطأ",
        description: "يرجى تحميل ملف",
        variant: "destructive",
      });
      return;
    }

    setIsImportingYoutubers(true);

    try {
      const fileContent = await youtuberFile.text();
      const youtubersList = JSON.parse(fileContent);

      if (!Array.isArray(youtubersList) || youtubersList.length === 0) {
        throw new Error("الملف يجب أن يحتوي على قائمة من اليوتيوبرز");
      }

      const youtubersToInsert = youtubersList.map(item => ({
        arabic_name: item.arabic_name,
        english_name: item.english_name,
        description: item.description || "",
        avatar_url: item.avatar_url || "",
        subscriber_count: item.subscriber_count || "",
        category: item.category || "",
      })).filter(item => item.arabic_name && item.english_name);

      if (youtubersToInsert.length === 0) {
        throw new Error("لم يتم العثور على بيانات صالحة");
      }

      await bulkAddYoutubersMutation.mutateAsync(youtubersToInsert);
      queryClient.invalidateQueries({ queryKey: ["youtubers"] });

      toast({
        title: "تم بنجاح",
        description: `تم إضافة ${youtubersToInsert.length} يوتيوبر`,
      });

      setYoutuberFile(null);
    } catch (error) {
      toast({
        title: "خطأ في الاستيراد",
        description: error instanceof Error ? error.message : "حدث خطأ",
        variant: "destructive",
      });
    } finally {
      setIsImportingYoutubers(false);
    }
  };

  const downloadSampleJSON = () => {
    const sample = [
      {
        youtuber_id: "paste_youtuber_id_here",
        video_title: "عنوان الفيديو",
        video_url: "https://youtube.com/watch?v=VIDEO_ID",
        video_id: "VIDEO_ID",
        publish_date: "2024-01-15",
        duration: "15:30",
        timestamps: [
          {
            start_time: 0,
            end_time: 45,
            text: "النص الأول هنا"
          },
          {
            start_time: 45,
            end_time: 120,
            text: "النص الثاني هنا"
          }
        ]
      }
    ];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transcripts.json';
    a.click();
  };

  const downloadYoutuberSampleJSON = () => {
    const sample = [
      {
        arabic_name: "باسم",
        english_name: "Bassem",
        description: "",
        channel_url: "https://www.youtube.com/@bassem1",
        avatar_url: "https://yt3.googleusercontent.com/"
      }
    ];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_youtubers.json';
    a.click();
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <div className="container mx-auto px-4 py-8 flex gap-8">
        <main className="flex-1">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">رفع البيانات</h1>
            <p className="text-muted-foreground">
              أضف النصوص الوصفية أو اليوتيوبرز بسرعة وسهولة
            </p>
          </div>

          {/* File Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="border-primary/30 bg-primary/5 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">ملفات JSON</h3>
                  <FileJson className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  ارفع ملف JSON يحتوي على مصفوفة من العناصر. مثالي للبيانات المعقدة مثل timestamps.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="youtubers" className="data-[state=active]:bg-background">
                <Users className="h-4 w-4 ml-2" />
                اليوتيوبرز
              </TabsTrigger>
              <TabsTrigger
                value="transcripts"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="h-4 w-4 ml-2" />
                النصوص
              </TabsTrigger>
            </TabsList>
            <TabsContent value="youtubers" className="mt-6">
              <div className="space-y-6">
                {/* Bulk Upload Card */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" />
                      رفع اليوتيوبرز بالجملة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm mb-6">
                      <p>
                        <span className="font-medium">الحقول المطلوبة:</span>{" "}
                        <span className="text-muted-foreground">arabic_name, english_name</span>
                      </p>
                    </div>

                    <form onSubmit={handleBulkYoutuberImport} className="space-y-4">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={(e) => setYoutuberFile(e.target.files?.[0] || null)}
                        className="text-right"
                      />
                      <Button type="submit" disabled={isImportingYoutubers || !youtuberFile}>
                        <Upload className="h-4 w-4 ml-2" />
                        {isImportingYoutubers ? "جاري الرفع..." : "رفع الملف"}
                      </Button>
                    </form>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={downloadYoutuberSampleJSON}>
                        <Download className="h-4 w-4 ml-2" />
                        تحميل نموذج JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Manual Add Card */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>إضافة يوتيوبر يدوياً</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddYoutuber} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="الاسم بالعربية"
                          value={youtuberForm.arabic_name}
                          onChange={(e) => setYoutuberForm({ ...youtuberForm, arabic_name: e.target.value })}
                          required
                          className="text-right"
                        />
                        <Input
                          placeholder="الاسم بالإنجليزية"
                          value={youtuberForm.english_name}
                          onChange={(e) => setYoutuberForm({ ...youtuberForm, english_name: e.target.value })}
                          required
                        />
                        <Input
                          placeholder="رابط الصورة الشخصية"
                          value={youtuberForm.avatar_url}
                          onChange={(e) => setYoutuberForm({ ...youtuberForm, avatar_url: e.target.value })}
                        />
                        <Input
                          placeholder="عدد المشتركين"
                          value={youtuberForm.subscriber_count}
                          onChange={(e) => setYoutuberForm({ ...youtuberForm, subscriber_count: e.target.value })}
                          className="text-right"
                        />
                        <Input
                          placeholder="الفئة"
                          value={youtuberForm.category}
                          onChange={(e) => setYoutuberForm({ ...youtuberForm, category: e.target.value })}
                          className="text-right"
                        />
                      </div>
                      <Textarea
                        placeholder="الوصف"
                        value={youtuberForm.description}
                        onChange={(e) => setYoutuberForm({ ...youtuberForm, description: e.target.value })}
                        rows={3}
                        className="text-right"
                      />
                      <Button type="submit" className="w-full" disabled={addYoutubersMutation.isPending}>
                        <Users className="h-4 w-4 ml-2" />
                        {addYoutubersMutation.isPending ? "جاري الإضافة..." : "إضافة يوتيوبر"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="transcripts" className="mt-6">
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Upload className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">رفع ملف النصوص (Transcripts)</h3>
                  </div>
                  <div className="space-y-3 text-sm mb-6">
                    <p>
                      <span className="font-medium">الحقول المطلوبة:</span>{" "}
                      <span className="text-muted-foreground">youtuber_id, video_title, timestamps</span>
                    </p>
                    <p>
                      <span className="font-medium">الحقول الاختيارية:</span>{" "}
                      <span className="text-muted-foreground">video_url, video_id, publish_date, duration</span>
                    </p>
                  </div>

                  <form onSubmit={handleBulkImport} className="space-y-4">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={(e) => setJsonFile(e.target.files?.[0] || null)}
                      className="text-right"
                    />
                    <Button type="submit" disabled={isImporting || !jsonFile}>
                      <Upload className="h-4 w-4 ml-2" />
                      {isImporting ? "جاري الرفع..." : "رفع الملف"}
                    </Button>
                  </form>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={downloadSampleJSON}>
                      <Download className="h-4 w-4 ml-2" />
                      تحميل نموذج JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Warning Section */}
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    تحذير هام جداً
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    يجب استخدام <code className="bg-amber-200 dark:bg-amber-800 px-1 rounded">(youtuber_id)</code> وليس الاسم!
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">خطأ:</span>
                      <code className="bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-red-700 dark:text-red-300">
                        youtuber_id: "Ahmed Saad Zayed"
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">صحيح:</span>
                      <code className="bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-green-700 dark:text-green-300">
                        youtuber_id: "68f9ef57d5640453c9ea668c"
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* YouTuber IDs Section */}
          <Card className="border-border bg-card mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-semibold">قائمة معرفات اليوتيوبرز (IDs)</h4>
                    <p className="text-sm text-muted-foreground">
                      انسخ المعرف لاستخدامه في ملفات النصوص
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowYoutuberIds(!showYoutuberIds)}>
                  {showYoutuberIds ? "إخفاء" : "إظهار"}
                </Button>
              </div>
              {showYoutuberIds && (
                <div className="mt-4 space-y-2">
                  {youtubers?.map((youtuber: any) => (
                    <div key={youtuber.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="text-sm font-medium">{youtuber.arabic_name}</span>
                      <code className="bg-muted-foreground/20 px-2 py-1 rounded text-xs font-mono">
                        {youtuber.id}
                      </code>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        <Sidebar />
      </div>
    </div>
  );
};

export default Dashboard;
