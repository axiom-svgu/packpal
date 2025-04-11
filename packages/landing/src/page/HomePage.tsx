import Navbar from "@/components/sections/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/sections/Footer";

export default function HomePage() {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main>
				<HeroSection />
				<FeaturesSection />
				<TestimonialsSection />
				<CTASection />
			</main>
			<Footer />
		</div>
	);
}
