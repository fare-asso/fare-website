'use client';

import { useEffect, useRef, useState } from "react";


export default function AnimatedNumber ({ end, duration } : { end: number, duration: number}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number | null>(null);

  const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let startTime: number | null = null;
          const animate = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const elapsedTime = (currentTime - startTime) / 1000; // en secondes
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = easeOutQuart(progress);
            const currentCount = Math.round(easedProgress * end);

            setCount(currentCount);

            if (progress < 1) {
              animationRef.current = requestAnimationFrame(animate);
            }
          };

          animationRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [end, duration]);

  return <span ref={ref}>{count}</span>;
}