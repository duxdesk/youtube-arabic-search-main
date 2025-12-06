import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileJson, FileSpreadsheet, Upload, AlertTriangle, Info, Users, FileText, Download, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAddYoutuber, useAddTranscript, useYoutubers } from "@/lib/supabase-hooks";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const addYoutuber = useAddYoutuber();
  const addTranscript = useAddTranscript();
  const { data: youtubers } = useYoutubers();
  const [activeTab, setActiveTab] = useState("transcripts");
  const [showYoutuberIds, setShowYoutuberIds] = useState(false);

  // Youtuber form state
  const [youtuberForm, setYoutuberForm] = useState({
    name_ar: "",
    name_en: "",
    avatar: "",
    subscriber_count: "",
    category: "",
    description: "",
  });

  // Transcript form state
  const [transcriptForm, setTranscriptForm] = useState({
    youtuber_id: "",
    video_title: "",
    video_id: "",
    transcript: "",
    published_at: "",
  });

  // Bulk import state
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [youtuberFile, setYoutuberFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportingYoutubers, setIsImportingYoutubers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAddYoutuber = async (e: React.FormEvent) => {
    e.preventDefault();
    await addYoutuber.mutateAsync(youtuberForm);
    setYoutuberForm({
      name_ar: "",
      name_en: "",
      avatar: "",
      subscriber_count: "",
      category: "",
      description: "",
    });
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jsonFile) {
      toast({
        title: "خطأ",
        description: "يرجى تحميل ملف JSON",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const fileContent = await jsonFile.text();
      const transcripts = JSON.parse(fileContent);

      if (!Array.isArray(transcripts)) {
        throw new Error("الملف يجب أن يحتوي على مصفوفة من النصوص");
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      const transcriptsToInsert = [];

      for (const item of transcripts) {
        try {
          const youtuber = youtubers?.find(y => y.id === item.youtuber_id);

          if (!youtuber) {
            const error = `لم يتم العثور على يوتيوبر بالمعرف: "${item.youtuber_id}"`;
            errors.push(error);
            errorCount++;
            continue;
          }

          const transcriptText = item.timestamps
            ?.map((ts: any) => ts.text)
            .join(' ') || item.transcript || '';

          transcriptsToInsert.push({
            youtuber_id: item.youtuber_id,
            video_title: item.video_title,
            video_id: item.video_id,
            transcript: transcriptText,
            published_at: item.publish_date || item.published_at || new Date().toISOString().split('T')[0],
          });
        } catch (error) {
          errors.push(`خطأ في معالجة الفيديو: ${item.video_title || 'unknown'}`);
          errorCount++;
        }
      }

      if (transcriptsToInsert.length > 0) {
        const { error } = await supabase
          .from('transcripts')
          .insert(transcriptsToInsert);

        if (error) throw error;
        successCount = transcriptsToInsert.length;
      }

      toast({
        title: "اكتمل الاستيراد",
        description: `تم استيراد ${successCount} نص بنجاح. فشل ${errorCount} نص.`,
      });

      setJsonFile(null);
    } catch (error) {
      toast({
        title: "خطأ في الاستيراد",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء استيراد النصوص",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
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

  const downloadSampleCSV = () => {
    const csv = "youtuber_id,video_title,video_url,video_id,publish_date,duration,transcript\npaste_youtuber_id_here,عنوان الفيديو,https://youtube.com/watch?v=VIDEO_ID,VIDEO_ID,2024-01-15,15:30,النص الأول هنا النص الثاني هنا";
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transcripts.csv';
    a.click();
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
      let youtubersList: any[] = [];

      if (youtuberFile.name.endsWith('.json')) {
        youtubersList = JSON.parse(fileContent);
      } else if (youtuberFile.name.endsWith('.csv')) {
        const lines = fileContent.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          youtubersList.push(obj);
        }
      }

      if (!Array.isArray(youtubersList) || youtubersList.length === 0) {
        throw new Error("الملف يجب أن يحتوي على قائمة من اليوتيوبرز");
      }

      const youtubersToInsert = youtubersList.map(item => ({
        name_ar: item.arabic_name || item.name_ar || item.nameAr || '',
        name_en: item.english_name || item.name_en || item.nameEn || '',
        avatar: item.avatar_url || item.avatar || '',
        subscriber_count: item.subscriber_count || item.subscriberCount || '0',
        category: item.category || '',
        description: item.description || null,
      })).filter(y => y.name_ar && y.name_en);

      if (youtubersToInsert.length === 0) {
        throw new Error("لم يتم العثور على بيانات صالحة");
      }

      const { error } = await supabase
        .from('youtubers')
        .insert(youtubersToInsert);

      if (error) throw error;

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

  const downloadYoutuberSampleCSV = () => {
    const csv = "name_ar,name_en,avatar,subscriber_count,category,description\nأحمد سعد زايد,Ahmed Saad Zayed,https://example.com/avatar.jpg,1.5M,تعليم,قناة تعليمية";
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_youtubers.csv';
    a.click();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex gap-8">
        <main className="flex-1">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">رفع البيانات</h1>
            <p className="text-muted-foreground">
              ارفع ملفات JSON أو CSV لإضافة اليوتيوبرز والنصوص
            </p>
          </div>

          {/* File Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="border-border bg-card hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">ملفات CSV</h3>
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  ارفع ملف CSV (Excel). الصف الأول يجب أن يحتوي على أسماء الأعمدة.
                </p>
              </CardContent>
            </Card>

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
              <TabsTrigger 
                value="youtubers" 
                className="data-[state=active]:bg-background"
              >
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
                      انسخ الـ ID الصحيح من هنا واستخدمه في ملف JSON/CSV
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowYoutuberIds(!showYoutuberIds)}
                >
                  {showYoutuberIds ? "إخفاء" : "إظهار"}
                </Button>
              </div>
              
              {showYoutuberIds && youtubers && youtubers.length > 0 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {youtubers.map((youtuber) => (
                    <div 
                      key={youtuber.id} 
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
                    >
                      <span className="font-medium">{youtuber.name_ar}</span>
                      <code 
                        className="bg-background px-2 py-1 rounded border cursor-pointer hover:bg-muted"
                        onClick={() => {
                          navigator.clipboard.writeText(youtuber.id);
                          toast({ title: "تم النسخ!", description: `تم نسخ معرف ${youtuber.name_ar}` });
                        }}
                      >
                        {youtuber.id}
                      </code>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Section */}
          {activeTab === "transcripts" && (
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
                  <p className="text-amber-600 flex items-center gap-1">
                    <span>💡</span>
                    <span className="underline">(للفيديوهات المقسمة)</span>
                    <span>يمكن رفع عدة ملفات بنفس video_id</span>
                  </p>
                </div>

                <form onSubmit={handleBulkImport} className="space-y-4">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={(e) => setJsonFile(e.target.files?.[0] || null)}
                    className="text-right"
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isImporting || !jsonFile}
                  >
                    <Upload className="h-4 w-4 ml-2" />
                    {isImporting ? "جاري الرفع..." : "رفع الملف"}
                  </Button>
                </form>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={downloadSampleJSON}>
                    <Download className="h-4 w-4 ml-2" />
                    تحميل نموذج JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
                    <Download className="h-4 w-4 ml-2" />
                    تحميل نموذج CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* YouTubers Upload Section */}
          {activeTab === "youtubers" && (
            <div className="space-y-6">
              {/* Bulk Upload Card */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    رفع قائمة يوتيوبرز (CSV/JSON)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm mb-6">
                    <p>
                      <span className="font-medium">الحقول المطلوبة:</span>{" "}
                      <span className="text-muted-foreground">name_ar, name_en, avatar, subscriber_count, category</span>
                    </p>
                    <p>
                      <span className="font-medium">الحقول الاختيارية:</span>{" "}
                      <span className="text-muted-foreground">description</span>
                    </p>
                  </div>

                  <form onSubmit={handleBulkYoutuberImport} className="space-y-4">
                    <Input
                      type="file"
                      accept=".json,.csv"
                      onChange={(e) => setYoutuberFile(e.target.files?.[0] || null)}
                      className="text-right"
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isImportingYoutubers || !youtuberFile}
                    >
                      <Upload className="h-4 w-4 ml-2" />
                      {isImportingYoutubers ? "جاري الرفع..." : "رفع الملف"}
                    </Button>
                  </form>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={downloadYoutuberSampleJSON}>
                      <Download className="h-4 w-4 ml-2" />
                      تحميل نموذج JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadYoutuberSampleCSV}>
                      <Download className="h-4 w-4 ml-2" />
                      تحميل نموذج CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Manual Add Card */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    إضافة يوتيوبر يدوياً
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddYoutuber} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="الاسم بالعربية"
                        value={youtuberForm.name_ar}
                        onChange={(e) => setYoutuberForm({ ...youtuberForm, name_ar: e.target.value })}
                        required
                        className="text-right"
                      />
                      <Input
                        placeholder="الاسم بالإنجليزية"
                        value={youtuberForm.name_en}
                        onChange={(e) => setYoutuberForm({ ...youtuberForm, name_en: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="رابط الصورة الشخصية"
                        value={youtuberForm.avatar}
                        onChange={(e) => setYoutuberForm({ ...youtuberForm, avatar: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="عدد المشتركين"
                        value={youtuberForm.subscriber_count}
                        onChange={(e) => setYoutuberForm({ ...youtuberForm, subscriber_count: e.target.value })}
                        required
                        className="text-right"
                      />
                      <Input
                        placeholder="الفئة"
                        value={youtuberForm.category}
                        onChange={(e) => setYoutuberForm({ ...youtuberForm, category: e.target.value })}
                        required
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
                    <Button type="submit" className="w-full" disabled={addYoutuber.isPending}>
                      <Users className="h-4 w-4 ml-2" />
                      {addYoutuber.isPending ? "جاري الإضافة..." : "إضافة يوتيوبر"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
        
        <Sidebar />
      </div>
    </div>
  );
};

export default Dashboard;
