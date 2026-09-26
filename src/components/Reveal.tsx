import { useEffect, useRef, useState, type ReactNode } from "react"

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(28px)",
        filter: shown ? "none" : "blur(6px)",
        transition: `opacity 0.9s ease ${delay}ms, transform 0.9s cubic-bezier(0.2,0.7,0.2,1) ${delay}ms, filter 0.9s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}