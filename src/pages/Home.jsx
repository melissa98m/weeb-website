import HeroSection from "../components/Home/HeroSection";
import TrustedBy from "../components/Home/TrustedBy";
import LearningSection from "../components/Home/LearningSection";
import TrendsSection from "../components/Home/TrendsSection";
import { useTheme } from "../context/ThemeContext";


export default function Home() {

  const { theme } = useTheme();
  return (
    <main className={`${theme === 'dark' ? 'bg-background text-white' : 'bg-light text-dark'}`}>
      <HeroSection />
      <TrustedBy />
      <LearningSection />
      <TrendsSection />
    </main>
  );
}
