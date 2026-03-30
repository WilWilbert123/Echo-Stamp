import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import '../styles/HomeContainer.css';
import CTASection from './CTASection';
import FeatureSection from './FeatureSection';
import LandingPage from './LandingPage';
import RatingsSection from './RatingsSection';

const HomeContainer = forwardRef(({ onExplore }, ref) => {
  const containerRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Centralized star background logic
  const stars = useMemo(() => 
    Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1 + 'px',
      duration: 3 + Math.random() * 4 + 's',
      delay: Math.random() * 5 + 's',
    })), []);

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
      {/* Global Fixed Star Background */}
      <div className="stars-container">
        {stars.map(star => (
          <div 
            key={star.id} 
            className="star" 
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDuration: star.duration,
              animationDelay: star.delay
            }}
          />
        ))}
      </div>

      <section className="snap-section" data-index="0"><LandingPage onExplore={onExplore} /></section>
      <section className="snap-section" data-index="1"><FeatureSection /></section>
      <section className="snap-section" data-index="2"><RatingsSection /></section>
      <section className="snap-section" data-index="3">
        <CTASection scrollTo={(index) => {
          const sections = containerRef.current.querySelectorAll('.snap-section');
          sections[index]?.scrollIntoView({ behavior: 'smooth' });
        }} />
      </section>

      {/* Side Dots Indicators */}
      <div className="scroll-dots">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`dot ${activeIdx === i ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
});

export default HomeContainer;