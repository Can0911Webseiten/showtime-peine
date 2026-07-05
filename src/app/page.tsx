import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { DamenSection } from "@/components/sections/damen-section";
import { WhyUsSection } from "@/components/sections/why-us-section";
import { TeamSection } from "@/components/sections/team-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { CtaSection } from "@/components/sections/cta-section";

export default async function Home() {
  const [services, staff, user] = await Promise.all([
    db.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.user.findMany({
      where: { role: "STAFF", active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getCurrentUser(),
  ]);

  return (
    <main>
      <HeroSection
        services={services}
        staff={staff}
        currentUser={
          user
            ? {
                id: user.id,
                role: user.role as "CUSTOMER" | "OWNER" | "STAFF",
                phone: user.phone,
              }
            : null
        }
      />
      <ServicesSection services={services} />
      <DamenSection />
      <WhyUsSection />
      <TeamSection />
      <GallerySection />
      <CtaSection />
    </main>
  );
}
