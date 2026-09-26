"use client"

import { useEffect, useRef, useState } from "react"

// ─────────────────────────────────────────────────────────────
// THE CITY OPENS — sticky scroll-scrub video hero
//
// The video is pinned with `position: sticky` inside a taller
// section, so scrolling is 100% native: wheel, trackpad, touch,
// keyboard and scrollbar all work, and the user can move back up
// at any time. Scroll position inside the section maps linearly
// to video.currentTime (forward and backward).
//
// Chapters are overlaid on top of the footage and fade in/out in
// step with the video: each one owns a [start, end] window in
// VIDEO SECONDS, so the copy is tied to the timeline rather than
// to raw scroll distance.
//
// Performance notes:
//  - No wheel/touch interception, so the browser never fights us.
//  - A single rAF loop runs only while the eased value is still
//    catching up, then stops — no idle rAF churn.
//  - Seeks are de-duplicated while the previous seek is pending,
//    and the video is encoded with short-GOP keyframes so each
//    seek is cheap.
// ─────────────────────────────────────────────────────────────

export interface Chapter {
  id: string
  index: string
  title: string
  claim: string
  description: string
  tags: string[]
  accent: string
  /** Video time (seconds) where this chapter starts fading in. */
  start: number
  /** Video time (seconds) where this chapter starts fading out. */
  end: number
}

export interface MetroHeroProps {
  videoSrc?: string
  poster?: string
  title?: string
  scrollHint?: string
  tagline?: string
  /** Closing tagline window, in video seconds. */
  taglineStart?: number
  signature?: { name: string; url: string } | false
  /** Copy overlaid on the footage, each timed to a window of the video. */
  chapters?: Chapter[]
  /** Scroll distance (px) that scrubs the whole video. Smaller = snappier. */
  scrubDistance?: number
  /** Cross-fade length (seconds) at each chapter edge. */
  chapterFade?: number
  className?: string
  style?: React.CSSProperties
}

const DEFAULT_VIDEO = "/Background.mp4"
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace"

const COL_BG = "#05070d"
const COL_TEXT = "#f2f4f8"

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export default function MetroHero({
  videoSrc = DEFAULT_VIDEO,
  poster,
  title = "THE CITY OPENS",
  scrollHint = "SCROLL",
  tagline = "Every door in the city is already open.",
  taglineStart = 0,
  signature = false,
  chapters = [],
  scrubDistance = 2600,
  chapterFade = 0.5,
  className,
  style,
}: MetroHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([])
  const railRefs = useRef<(HTMLDivElement | null)[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const section = sectionRef.current
    if (!video || !section) return

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

    let duration = 0
    let rafId = 0
    let running = false
    let targetProgress = 0
    let currentProgress = 0
    let isSeeking = false
    let pendingTime: number | null = null

    const onLoadedData = () => {
      duration = video.duration || 0
      setReady(true)
      render(currentProgress)
    }
    video.addEventListener("loadeddata", onLoadedData)

    // iOS Safari often won't buffer any video data — even with
    // preload="auto" — until playback actually starts, to save mobile
    // data. Since we only ever seek (never call play() elsewhere), the
    // video can stay permanently blank on iPhone. Force a silent
    // play-then-immediately-pause on mount to kick off real loading.
    const kickstartLoad = () => {
      const p = video.play()
      if (p && typeof p.then === "function") {
        p.then(() => video.pause()).catch(() => {})
      } else {
        video.pause()
      }
    }
    kickstartLoad()

    const onSeeked = () => {
      isSeeking = false
      if (pendingTime !== null) {
        const t = pendingTime
        pendingTime = null
        isSeeking = true
        video.currentTime = t
      }
    }
    video.addEventListener("seeked", onSeeked)

    const seekTo = (t: number) => {
      if (isSeeking) {
        pendingTime = t
        return
      }
      isSeeking = true
      video.currentTime = t
    }

    function render(p: number) {
      const tSec = duration > 0 ? p * duration : 0

      if (duration > 0) seekTo(p * duration)

      if (videoRef.current) {
        videoRef.current.style.transform = `scale(${1 + p * 0.06})`
      }

      if (titleRef.current) {
        const t = 1 - clamp(tSec / 0.7, 0, 1)
        titleRef.current.style.opacity = String(t)
        titleRef.current.style.transform = `translateY(${(1 - t) * -24}px) scale(${0.96 + t * 0.04})`
        titleRef.current.style.filter = `blur(${(1 - t) * 10}px)`
      }

      if (hintRef.current) {
        hintRef.current.style.opacity = p > 0.002 ? "0" : "1"
      }

      for (let i = 0; i < chapters.length; i++) {
        const c = chapters[i]
        const el = chapterRefs.current[i]
        if (!el) continue
        const o = Math.min(
          clamp((tSec - c.start) / chapterFade, 0, 1),
          clamp((c.end - tSec) / chapterFade, 0, 1),
        )
        el.style.opacity = String(o)
        el.style.transform = `translateY(${(1 - o) * 26}px)`
        el.style.filter = `blur(${(1 - o) * 8}px)`
        el.style.visibility = o <= 0.001 ? "hidden" : "visible"

        const rail = railRefs.current[i]
        if (rail) rail.style.opacity = String(0.28 + o * 0.72)
      }

      if (taglineRef.current) {
        const t = clamp((tSec - taglineStart) / 0.6, 0, 1)
        taglineRef.current.style.opacity = String(t)
        taglineRef.current.style.transform = `translateY(${(1 - t) * 20}px) scale(${0.97 + t * 0.03})`
        taglineRef.current.style.filter = `blur(${(1 - t) * 8}px)`
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${p})`
      }
    }

    function tick() {
      const diff = targetProgress - currentProgress
      if (Math.abs(diff) < 0.0004) {
        currentProgress = targetProgress
        render(currentProgress)
        running = false
        rafId = 0
        return
      }
      currentProgress += diff * 0.24
      render(currentProgress)
      rafId = requestAnimationFrame(tick)
    }

    function kick() {
      if (reduceMotion) {
        currentProgress = targetProgress
        render(currentProgress)
        return
      }
      if (!running) {
        running = true
        rafId = requestAnimationFrame(tick)
      }
    }

    const measure = () => {
      const total = section.offsetHeight - window.innerHeight
      const p = total > 0 ? clamp(-section.getBoundingClientRect().top / total, 0, 1) : 0
      targetProgress = p
      kick()
    }

    measure()
    window.addEventListener("scroll", measure, { passive: true })
    window.addEventListener("resize", measure)
    window.addEventListener("orientationchange", measure)

    return () => {
      video.removeEventListener("loadeddata", onLoadedData)
      video.removeEventListener("seeked", onSeeked)
      window.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
      window.removeEventListener("orientationchange", measure)
      cancelAnimationFrame(rafId)
    }
  }, [scrubDistance, chapters, chapterFade, taglineStart])

  return (
    <section
      ref={sectionRef}
      className={className}
      style={{
        position: "relative",
        height: `calc(${scrubDistance}px + 100dvh)`,
        width: "100%",
        background: COL_BG,
        ...style,
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100dvh",
          width: "100%",
          overflow: "hidden",
          background: COL_BG,
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          poster={poster}
          muted
          playsInline
          preload="auto"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: ready ? 1 : 0,
            transformOrigin: "center center",
            willChange: "transform",
            transition: "opacity 0.6s ease",
            pointerEvents: "none",
          }}
        />

        {/* Top/bottom vignette so overlays stay legible on any frame. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5,7,13,0.45), rgba(5,7,13,0) 28%, rgba(5,7,13,0.2) 68%, rgba(5,7,13,0.7))",
            pointerEvents: "none",
          }}
        />

        {/* Left scrim: keeps the chapter column readable while the board stays visible. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(5,7,13,0.86) 0%, rgba(5,7,13,0.55) 38%, rgba(5,7,13,0.12) 62%, rgba(5,7,13,0) 78%)",
            pointerEvents: "none",
          }}
        />

        <div
          ref={titleRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 6%",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: "clamp(30px, 7vw, 96px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: COL_TEXT,
              textShadow: "0 4px 30px rgba(0,0,0,0.5)",
              display: "inline-block",
              willChange: "transform, filter, opacity",
            }}
          >
            {title}
          </span>
        </div>

        {/* ── Chapters: the capabilities, over the footage ── */}
        {chapters.map((c, i) => (
          <div
            key={c.id}
            ref={(el) => {
              chapterRefs.current[i] = el
            }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              padding: "0 clamp(22px, 7vw, 96px)",
              opacity: 0,
              visibility: "hidden",
              pointerEvents: "none",
              willChange: "transform, filter, opacity",
            }}
          >
            <div style={{ maxWidth: 620 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: "clamp(28px, 4vw, 44px)",
                    lineHeight: 1,
                    color: c.accent,
                  }}
                >
                  {c.index}
                </span>
                <span
                  style={{
                    height: 1,
                    width: "clamp(40px, 8vw, 90px)",
                    background: `${c.accent}66`,
                  }}
                />
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.28em",
                    color: "rgba(242,244,248,0.55)",
                  }}
                >
                  {c.index} / {String(chapters.length).padStart(2, "0")}
                </span>
              </div>

              <h3
                style={{
                  margin: 0,
                  fontFamily: SANS,
                  fontWeight: 800,
                  fontSize: "clamp(28px, 4.4vw, 56px)",
                  lineHeight: 1.04,
                  letterSpacing: "-0.02em",
                  color: COL_TEXT,
                  textShadow: "0 4px 30px rgba(0,0,0,0.55)",
                }}
              >
                {c.title}
              </h3>

              <p
                style={{
                  margin: "14px 0 0",
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: "clamp(15px, 1.7vw, 20px)",
                  color: c.accent,
                }}
              >
                {c.claim}
              </p>

              <p
                style={{
                  margin: "16px 0 0",
                  maxWidth: 520,
                  fontFamily: SANS,
                  fontSize: "clamp(14px, 1.5vw, 17px)",
                  lineHeight: 1.6,
                  color: "rgba(242,244,248,0.72)",
                }}
              >
                {c.description}
              </p>

              <ul
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  margin: "22px 0 0",
                  padding: 0,
                  listStyle: "none",
                }}
              >
                {c.tags.map((tag) => (
                  <li
                    key={tag}
                    style={{
                      border: `1px solid ${c.accent}40`,
                      borderRadius: 999,
                      padding: "4px 12px",
                      fontFamily: SANS,
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                      color: "rgba(242,244,248,0.82)",
                    }}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {/* Right rail: the running index, so progress is legible at a glance. */}
        {chapters.length > 0 && (
          <div
            className="metro-rail"
            style={{
              position: "absolute",
              right: "clamp(18px, 3vw, 40px)",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              pointerEvents: "none",
            }}
          >
            {chapters.map((c, i) => (
              <div
                key={c.id}
                ref={(el) => {
                  railRefs.current[i] = el
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 8,
                  opacity: 0.28,
                  transition: "opacity 0.25s ease",
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "rgba(242,244,248,0.7)",
                  }}
                >
                  {c.index}
                </span>
                <span
                  style={{
                    display: "block",
                    width: 22,
                    height: 2,
                    borderRadius: 2,
                    background: c.accent,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {tagline && (
          <div
            ref={taglineRef}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 8%",
              textAlign: "center",
              opacity: 0,
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: "clamp(20px, 3.4vw, 40px)",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                color: COL_TEXT,
                textShadow: "0 4px 24px rgba(0,0,0,0.5)",
              }}
            >
              {tagline}
            </span>
          </div>
        )}

        <div
          ref={hintRef}
          style={{
            position: "absolute",
            left: "50%",
            bottom: "clamp(20px, 6vh, 48px)",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            color: "rgba(240,244,248,0.75)",
            fontFamily: SANS,
            fontSize: "clamp(10px, 1.4vw, 12px)",
            fontWeight: 600,
            letterSpacing: "0.3em",
            transition: "opacity 0.4s ease",
            pointerEvents: "none",
          }}
        >
          <span>{scrollHint}</span>
          <svg
            width="14"
            height="18"
            viewBox="0 0 14 18"
            style={{ animation: "metro-hero-bounce 1.6s ease-in-out infinite" }}
          >
            <style>{`
              @keyframes metro-hero-bounce {
                0%, 100% { transform: translateY(0); opacity: 0.5; }
                50% { transform: translateY(5px); opacity: 1; }
              }
            `}</style>
            <path
              d="M7 1 L7 17 M2 12 L7 17 L12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Thin progress line — fills as the video advances. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 2,
            background: "rgba(255,255,255,0.12)",
          }}
        >
          <div
            ref={progressBarRef}
            style={{
              height: "100%",
              width: "100%",
              background: "linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.95))",
              transform: "scaleX(0)",
              transformOrigin: "left center",
            }}
          />
        </div>

        {signature && (
          <span
            style={{
              position: "absolute",
              right: "clamp(12px, 2.5vw, 24px)",
              bottom: "clamp(10px, 2vw, 18px)",
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: "clamp(11px, 1.4vw, 13px)",
              letterSpacing: "0.01em",
              color: "rgba(220,224,232,0.6)",
              zIndex: 2,
            }}
          >
            by{" "}
            <a
              href={signature.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "rgba(220,224,232,0.6)",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.color = COL_TEXT
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.color = "rgba(220,224,232,0.6)"
              }}
            >
              {signature.name}
            </a>
          </span>
        )}
      </div>
    </section>
  )
}