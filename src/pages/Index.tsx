import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import UserTypesSection from "@/components/sections/UserTypesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import ListingsSection from "@/components/sections/ListingsSection";
import CTASection from "@/components/sections/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <UserTypesSection />
        <HowItWorksSection />
        <ListingsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
