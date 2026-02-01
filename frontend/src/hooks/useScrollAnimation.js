import { useInView } from 'framer-motion';
import { useRef } from 'react';

export const useScrollAnimation = (once = true) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-50px" });
  return { ref, isInView };
};
