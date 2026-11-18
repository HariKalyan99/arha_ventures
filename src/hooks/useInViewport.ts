import { useEffect, useState, type RefObject } from 'react'

/** True while the element intersects the viewport (expanded by rootMargin). */
export function useInViewport(ref: RefObject<Element | null>, rootMargin = '0px', once = false) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) observer.disconnect()
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin, once])
  return inView
}
