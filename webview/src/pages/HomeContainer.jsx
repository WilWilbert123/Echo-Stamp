import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import '../styles/HomeContainer.css';
import CTASection from './CTASection';
import FeatureSection from './FeatureSection';
import LandingPage from './LandingPage';

const HomeContainer = forwardRef(({ onExplore }, ref) => {
  const containerRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Expose scrolling logic to App.jsx
  useImperativeHandle(ref, () => ({
    scrollToSection: (index) => {
      const sections = containerRef.current.querySelectorAll('.snap-section');
      sections[index]?.scrollIntoView({ behavior: 'smooth' });
    }
  }));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveIdx(parseInt(entry.target.getAttribute('data-index')));
          }
        });
      },
      { threshold: 0.6 }
    );

    const sections = containerRef.current.querySelectorAll('.snap-section');
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="scroll-snap-container" ref={containerRef}>
      <section className="snap-section" data-index="0"><LandingPage onExplore={onExplore} /></section>
      <section className="snap-section" data-index="1"><FeatureSection /></section>
      <section className="snap-section" data-index="2"><CTASection onExplore={onExplore} /></section>

      {/* Side Dots Indicators */}
      <div className="scroll-dots">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`dot ${activeIdx === i ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
});

export default HomeContainer;