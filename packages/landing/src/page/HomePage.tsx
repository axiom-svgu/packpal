import Navbar from "@/components/sections/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/sections/Footer";
import BackgroundElements from "@/components/BackgroundElements";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <BackgroundElements />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer className="relative z-10" />
    </div>
  );
}
