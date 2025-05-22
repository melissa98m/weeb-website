import HeroSection from "../components/Home/HeroSection";
import TrustedBy from "../components/Home/TrustedBy";
import LearningSection from "../components/Home/LearningSection";
import TrendsSection from "../components/Home/TrendsSection";
import { useTheme } from "../context/ThemeContext";



export default function Home() {

  return (
    <>
      <HeroSection />
      <TrustedBy />
      <LearningSection />
      <TrendsSection />
    </>
  );
}
