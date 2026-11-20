import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Shared motion language: long, decelerating eases that read as "settling" rather than bouncing. */
gsap.defaults({ ease: 'expo.out', duration: 1.4 })

/* iOS URL-bar show/hide used to reflow sticky tour length mid-gesture → jitter. */
ScrollTrigger.config({ ignoreMobileResize: true })

export const MOTION_QUERY = '(prefers-reduced-motion: no-preference)'

export { gsap, ScrollTrigger, useGSAP }
