import { useState, useCallback } from "react";
import Header from "@/components/buildverse/Header";
import LeftLauncher from "@/components/buildverse/LeftLauncher";
import CenterZone from "@/components/buildverse/CenterZone";
import RightSidebar from "@/components/buildverse/RightSidebar";
import MobileBar from "@/components/buildverse/MobileBar";
import Footer from "@/components/buildverse/Footer";
import { HeroSection } from "@/components/HeroSection";  // ← Изменено!
import AuthModal from "@/components/buildverse/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/hooks/useChats";
import { useEffect } from "react";

const Index = () => {
  const [activeSection, setActiveSection] = useState("chat");
  const { user, profile } = useAuth();
  const chatHook = useChats();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const goHome = () => setActiveSection("chat");

  const handleNewChat = useCallback(async () => {
    if (!user) return;
    await chatHook.createChat();
    setActiveSection("chat");
  }, [user, chatHook]);

  const handleSelectChat = useCallback(async (chatId: string) => {
    await chatHook.loadMessages(chatId);
    setActiveSection("chat");
  }, [chatHook]);

  useEffect(() => {
    if (user) chatHook.loadChats();
  }, [user]);

  const isHomePage = activeSection === "chat";

  return (
    <div className="min-h-screen flex flex-col">
      <Header onHomeClick={goHome} onNavigate={setActiveSection} />

      {/* Hero-секция - только на главной */}
      {isHomePage && (
        <div style={{ marginTop: '48px' }}>
          <HeroSection onStartProject={() => setAuthModalOpen(true)} />
        </div>
      )}

      {/* Основной контейнер */}
      <div className="flex-1 flex pt-2 pb-20 lg:pb-0">
        {/* Левая панель - фиксированная */}
        <div className="hidden lg:block fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-40">
          <LeftLauncher activeId={activeSection} onSelect={setActiveSection} />
        </div>

        {/* Центральная зона - прокручиваемая */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{
            marginLeft: '64px',
            marginRight: sidebarExpanded ? '256px' : '48px',
          }}
        >
          <div className="px-2 md:px-4 max-w-[1800px] mx-auto">
            <CenterZone
              activeSection={activeSection}
              onRequestAuth={() => setAuthModalOpen(true)}
              onNavigate={setActiveSection}
              userRole={profile?.role}
              chatHook={chatHook}
            />
          </div>
          <Footer />
        </div>

        {/* Правая панель - фиксированная */}
        <div className="hidden lg:block fixed right-0 top-14 h-[calc(100vh-3.5rem)] z-40">
          <RightSidebar
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            currentChatId={chatHook.currentChatId}
            expanded={sidebarExpanded}
            onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)}
            chatHook={chatHook}
            onOpenSettings={() => setActiveSection("settings")}
          />
        </div>
      </div>

      <MobileBar activeId={activeSection} onSelect={setActiveSection} />
      
      {/* Модальное окно авторизации */}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Index;