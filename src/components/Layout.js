import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search as SearchIcon, Home, Upload, Settings, Scissors } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "الرئيسية",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "منشئ الفيديوهات القصيرة",
    url: createPageUrl("ShortsCreator"),
    icon: Scissors,
  },
  {
    title: "رفع البيانات",
    url: createPageUrl("UploadData"),
    icon: Upload,
  },
  {
    title: "إدارة النصوص",
    url: createPageUrl("TranscriptsManager"),
    icon: Settings,
  },
];

export default function Layout({ children, youtuber }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --sidebar-width: 16rem;
        }
        body {
          direction: rtl;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-amber-50 via-orange-50 to-red-50" dir="rtl">
        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center gap-4 justify-end">
              <h1 className="text-xl font-bold text-gray-900">بحث في نصوص</h1>
              <SidebarTrigger className="hover:bg-orange-100 p-2 rounded-lg transition-colors duration-200" />
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>

        <Sidebar className="border-l border-orange-200">
          <SidebarHeader className="border-b border-orange-200 p-6">
            <div className="flex items-center gap-3 justify-start">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <SearchIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900">بحث في نصوص</h2>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-orange-100 hover:text-orange-700 transition-all duration-200 rounded-lg mb-1 ${location.pathname === item.url ? 'bg-orange-100 text-orange-700 font-semibold' : ''
                          }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3 justify-start">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Header for Youtuber (Only if youtuber exists) */}
        {youtuber && (
          <header className="bg-white shadow-sm border-b border-purple-200 px-4 py-3 sticky top-0 z-20">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <div className="flex items-center gap-3">
                {youtuber.avatar_url ? (
                  <img src={youtuber.avatar_url} alt={youtuber.arabic_name} className="w-12 h-12 rounded-full object-cover border-2 border-purple-200" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {youtuber.arabic_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{youtuber.arabic_name}</h1>
                  <p className="text-xs text-gray-500">{youtuber.english_name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">قائمة</Button>
                <Button variant="ghost" size="sm">إعدادات</Button>
              </div>
            </div>
          </header>
        )}
      </div>
    </SidebarProvider>
  );
}