import HeroSection from "../components/Home/HeroSection";
import TrustedBy from "../components/Home/TrustedBy";
import LearningSection from "../components/Home/LearningSection";
import TrendsSection from "../components/Home/TrendsSection";

export default function Home() {
  return (
    <main className="bg-background text-white">
      <HeroSection />
      <TrustedBy />
      <LearningSection />
      <TrendsSection />
    </main>
  );
}
