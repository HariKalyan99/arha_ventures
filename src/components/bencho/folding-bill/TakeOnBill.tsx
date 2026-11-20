import { FoldingBill } from './FoldingBill'
import './FoldingBill.css'

const W = 260
const H = 184

/**
 * Folding bill laid on the Services “take on.” phrase —
 * grab, drag and fold; canvas spills into the section for play.
 */
export function TakeOnBill() {
  return (
    <span className="relative z-10 inline-block align-baseline leading-[1.05]">
      <em className="relative z-0 text-cream">take on.</em>
      <span
        className="pointer-events-auto absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-[48%]"
        style={{ width: W, height: H }}
        aria-hidden
      >
        <FoldingBill print="Plain" stiffness={40} settle={0} width={W} height={H} />
      </span>
    </span>
  )
}
