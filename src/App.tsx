/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
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
import { LoadingScreen } from './components/LoadingScreen';
import { TempAdminPortal } from './components/TempAdminPortal';
import { SiteConfigProvider } from './context/SiteConfigContext';

function isAdminLocation(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.pathname === '/admin' ||
    window.location.pathname === '/admin/' ||
    window.location.hash === '#admin'
  );
}

export default function App() {
  const [presetSubject, setPresetSubject] = useState<string>('');
  const [adminOpen, setAdminOpen] = useState<boolean>(() => isAdminLocation());

  useEffect(() => {
    const syncRoute = () => {
      setAdminOpen(isAdminLocation());
    };
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  const openAdmin = () => {
    setAdminOpen(true);
    if (window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const closeAdmin = () => {
    setAdminOpen(false);
    if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
      window.history.pushState(null, '', '/');
    } else if (window.location.hash === '#admin') {
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <SiteConfigProvider>
      <div className="min-h-screen bg-white text-slate-900">
        <LoadingScreen />
        <CustomCursor />

        {adminOpen ? (
          <TempAdminPortal onClose={closeAdmin} />
        ) : (
          <>
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
              <ApproachSection onOpenAdmin={openAdmin} />
              <PublicationsSection
                onSelectCollaborationTopic={(subject) => setPresetSubject(subject)}
              />
              <ContactSection presetSubject={presetSubject} />
            </main>

            <Footer onOpenAdmin={openAdmin} />
          </>
        )}
      </div>
    </SiteConfigProvider>
  );
}
