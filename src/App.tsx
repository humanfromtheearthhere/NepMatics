/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { DivisionsSection } from './components/DivisionsSection';
import { FeaturedResearchSection } from './components/FeaturedResearchSection';
import { ApproachSection } from './components/ApproachSection';
import { PublicationsSection } from './components/PublicationsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';

export default function App() {
  const [presetSubject, setPresetSubject] = useState<string>('');

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <CustomCursor />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[#D9480F] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <DivisionsSection
          onSelectCollaborationTopic={(subject) => setPresetSubject(subject)}
        />
        <FeaturedResearchSection />
        <ApproachSection />
        <PublicationsSection
          onSelectCollaborationTopic={(subject) => setPresetSubject(subject)}
        />
        <ContactSection presetSubject={presetSubject} />
      </main>

      <Footer />
    </div>
  );
}
