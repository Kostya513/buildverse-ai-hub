import { useState, useEffect, useCallback } from "react";
import Header from "@/components/buildverse/Header";
import LeftLauncher from "@/components/buildverse/LeftLauncher";
import CenterZone from "@/components/buildverse/CenterZone";
import RightSidebar from "@/components/buildverse/RightSidebar";
import MobileBar from "@/components/buildverse/MobileBar";
import Footer from "@/components/buildverse/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/hooks/useChats";

const Index = () => {
  const [activeSection, setActiveSection] = useState("chat");
  const { user, profile } = useAuth();
  const chatHook = useChats();

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

  // Load chats on auth
  useEffect(() => {
    if (user) chatHook.loadChats();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onHomeClick={goHome} onNavigate={setActiveSection} />

      <div className="flex-1 flex pt-16 pb-20 lg:pb-2 px-2 md:px-4 gap-3 max-w-[1600px] mx-auto w-full">
        <LeftLauncher activeId={activeSection} onSelect={setActiveSection} />
        <CenterZone
          activeSection={activeSection}
          onRequestAuth={() => {}}
          onNavigate={setActiveSection}
          userRole={profile?.role}
          chatHook={chatHook}
        />
        {activeSection !== "chat" && (
          <RightSidebar
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            currentChatId={chatHook.currentChatId}
          />
        )}
      </div>

      <Footer />
      <MobileBar activeId={activeSection} onSelect={setActiveSection} />
    </div>
  );
};

export default Index;
