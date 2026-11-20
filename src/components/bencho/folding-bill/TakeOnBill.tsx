import { Particles } from '../particles/Particles'

/**
 * Bencho Particles seated on the Services “take on.” phrase —
 * hover scatters dots; press for a shockwave into the next shape.
 */
export function TakeOnBill() {
  return (
    <span className="relative z-10 inline-block align-baseline leading-[1.05]">
      <em className="relative z-0 text-cream">take on.</em>
      <span
        className="pointer-events-auto absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-[46%]"
        aria-hidden
      >
        <Particles shape="Circle" grain="Fine" reach={80} force={60} className="ptc--inline" />
      </span>
    </span>
  )
}
