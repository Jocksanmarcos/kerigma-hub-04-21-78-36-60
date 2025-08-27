import { useEffect } from 'react';

export const useSmoothScrolling = () => {
  useEffect(() => {
    // Enable smooth scrolling for the entire document
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'smooth';

    // Handle anchor links for smooth scrolling
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.hash && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const element = document.querySelector(target.hash);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    };

    // Add event listeners to all anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', handleAnchorClick);
    });

    // Cleanup function
    return () => {
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      anchorLinks.forEach(link => {
        link.removeEventListener('click', handleAnchorClick);
      });
    };
  }, []);

  // Utility function to scroll to element
  const scrollToElement = (elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
    }
  };

  // Utility function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return {
    scrollToElement,
    scrollToTop,
  };
};