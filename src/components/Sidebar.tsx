import { useState } from "react";
import { Home, Upload, Settings, Mail, Copy, Check } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "الرئيسية", icon: Home, path: "/" },
  { title: "رفع البيانات", icon: Upload, path: "/dashboard" },
  { title: "إدارة البيانات", icon: Settings, path: "/manage" },
];

const Sidebar = () => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("myprojectytsearch@proton.me");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-64 shrink-0">
      <nav className="sticky top-8 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-right",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}

        <Dialog>
          <DialogTrigger asChild>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-right text-muted-foreground hover:bg-muted hover:text-foreground mt-4"
            >
              <Mail className="h-5 w-5" />
              <span>تواصل مع المسؤول</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right flex items-center gap-2">
                <Mail className="h-5 w-5" />
                تواصل مع المسؤول
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2 rtl:space-x-reverse mt-4">
              <div className="grid flex-1 gap-2">
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                  <span className="text-sm font-mono select-all">myprojectytsearch@proton.me</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </nav>
    </aside>
  );
};

export default Sidebar;