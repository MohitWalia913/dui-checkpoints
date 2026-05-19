import { Footer } from "@/components/global/footer";
import { Header } from "@/components/global/header";
import { AppShowcase } from "@/components/homepage/app-showcase";
import { ReportCheckpoint } from "@/components/homepage/report-checkpoint";
import { Testimonials } from "@/components/homepage/testimonials";
import { Coverage } from "@/components/homepage/coverage";
import { Features } from "@/components/homepage/features";
import { Hero } from "@/components/homepage/hero";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Features />
      <Coverage />
      <AppShowcase />
      <Testimonials />
      <ReportCheckpoint />
      <Footer />
    </main>
  );
}
