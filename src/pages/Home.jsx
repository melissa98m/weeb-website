import { lazy, Suspense } from "react";
import HeroSection from "../components/Home/HeroSection";
import LearningSection from "../components/Home/LearningSection";
import TrendsSection from "../components/Home/TrendsSection";

// Lazy load TrustedBy car il contient des composants Icon volumineux non critiques
const TrustedBy = lazy(() => import("../components/Home/TrustedBy"));

export default function Home() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<div className="text-center py-12"><div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-6" /></div>}>
        <TrustedBy />
      </Suspense>
      <LearningSection />
      <TrendsSection />
    </>
  );
}
