import MetroHero from "@/components/ui/scroll-locked-video-hero"
import Footer from "@/components/Footer"
import { SKILLS, CLOSING_START } from "@/data/skills"

export default function App() {
  return (
    <main id="top">
      <MetroHero
        videoSrc="/Background.mp4"
        poster="/Background-poster.jpg"
        title="CONSTRUYO LO QUE IMAGINAS"
        tagline="Del código al circuito."
        scrollHint="DESLIZA"
        chapters={SKILLS}
        taglineStart={CLOSING_START}
        signature={false}
      />
      <Footer />
    </main>
  )
}