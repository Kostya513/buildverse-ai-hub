import { useState } from "react";
import Header from "@/components/buildverse/Header";
import LeftLauncher from "@/components/buildverse/LeftLauncher";
import CenterZone from "@/components/buildverse/CenterZone";
import RightSidebar from "@/components/buildverse/RightSidebar";
import MobileBar from "@/components/buildverse/MobileBar";
import Footer from "@/components/buildverse/Footer";
import AuthModal from "@/components/buildverse/AuthModal";

const Index = () => {
  const [activeSection, setActiveSection] = useState("geo");
  const [authModal, setAuthModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex pt-16 pb-20 lg:pb-4 px-2 md:px-4 gap-3 max-w-[1600px] mx-auto w-full">
        <LeftLauncher activeId={activeSection} onSelect={setActiveSection} />
        <CenterZone activeSection={activeSection} onRequestAuth={() => setAuthModal(true)} />
        <RightSidebar />
      </div>

      <Footer />
      <MobileBar activeId={activeSection} onSelect={setActiveSection} />
      <AuthModal open={authModal} onClose={() => setAuthModal(false)} />
    </div>
  );
};

export default Index;
