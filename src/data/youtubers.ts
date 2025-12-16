export interface Youtuber {
  id: string;
  nameAr: string;
  nameEn: string;
  avatar: string;
  subscriberCount: string;
  category: string;
  description: string;
}

export interface VideoTranscript {
  id: string;
  youtuberId: string;
  videoTitle: string;
  videoId: string;
  transcript: string;
  publishedAt: string;
}

export const youtubers: Youtuber[] = [
  {
    id: "1",
    nameAr: "أحمد الشقيري",
    nameEn: "Ahmad Al Shugairi",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
    subscriberCount: "5.2M",
    category: "ثقافة ومجتمع",
    description: "محتوى ثقافي واجتماعي هادف"
  },
  {
    id: "2",
    nameAr: "محمد صلاح",
    nameEn: "Mohamed Salah",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop",
    subscriberCount: "3.8M",
    category: "رياضة",
    description: "محتوى رياضي وتحفيزي"
  },
  {
    id: "3",
    nameAr: "نور الدين",
    nameEn: "Nour Eldeen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    subscriberCount: "2.1M",
    category: "تعليم",
    description: "دروس تعليمية متنوعة"
  },
  {
    id: "4",
    nameAr: "سارة العتيبي",
    nameEn: "Sara Alotaibi",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    subscriberCount: "1.9M",
    category: "طبخ ومطبخ",
    description: "وصفات عربية تقليدية وعصرية"
  },
  {
    id: "5",
    nameAr: "عمر السومة",
    nameEn: "Omar Alsoma",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    subscriberCount: "4.5M",
    category: "ترفيه",
    description: "محتوى ترفيهي كوميدي"
  },
  {
    id: "6",
    nameAr: "ليلى القحطاني",
    nameEn: "Layla Alqahtani",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    subscriberCount: "2.7M",
    category: "تقنية",
    description: "مراجعات وشروحات تقنية"
  },
];

export const sampleTranscripts: VideoTranscript[] = [
  {
    id: "t1",
    youtuberId: "1",
    videoTitle: "رحلة التغيير - الحلقة 1",
    videoId: "abc123",
    transcript: "السلام عليكم ورحمة الله وبركاته، في هذه الحلقة سنتحدث عن أهمية التغيير في حياتنا اليومية. التغيير هو سنة الحياة، وكل إنسان يحتاج إلى تطوير نفسه باستمرار. اليوم سنتعلم كيف نبدأ رحلة التغيير الإيجابي ونحقق أهدافنا.",
    publishedAt: "2024-01-15"
  },
  {
    id: "t2",
    youtuberId: "1",
    videoTitle: "قوة العادات الصغيرة",
    videoId: "def456",
    transcript: "مرحباً بكم في حلقة جديدة. اليوم نتكلم عن العادات الصغيرة وكيف تصنع الفارق الكبير. العادة الصغيرة مثل قراءة عشر دقائق يومياً يمكن أن تغير حياتك بشكل كامل. دعونا نتعلم كيف نبني عادات إيجابية تدوم.",
    publishedAt: "2024-01-20"
  },
  {
    id: "t3",
    youtuberId: "2",
    videoTitle: "التحدي والإصرار في الرياضة",
    videoId: "ghi789",
    transcript: "أهلاً وسهلاً بكم جميعاً. في هذا الفيديو سأشارككم قصتي مع التحديات في مسيرتي الرياضية. كل رياضي يمر بلحظات صعبة، لكن الإصرار والتصميم هما المفتاح. تذكروا دائماً: النجاح يأتي بعد الصبر والعمل الجاد.",
    publishedAt: "2024-02-01"
  },
  {
    id: "t4",
    youtuberId: "3",
    videoTitle: "أساسيات البرمجة للمبتدئين",
    videoId: "jkl012",
    transcript: "مرحباً بكم في درس اليوم عن البرمجة. سنتعلم اليوم أساسيات البرمجة بلغة بايثون. البرمجة ليست صعبة كما يظن البعض، المهم الممارسة المستمرة. لنبدأ بكتابة أول برنامج لنا ونفهم كيف تعمل الأكواد.",
    publishedAt: "2024-02-10"
  },
];
