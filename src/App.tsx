import { Layout } from "@/components/layout/Layout"
import { Routes, Route } from "react-router-dom"
import { Home } from "@/home/Home"
import { GaugePage } from "@/components/gauge/GaugePage"

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/steam-gauge" element={<GaugePage />} />
        <Route path="/steam-guess" element={<div>Coming Soon</div>} />
        <Route path="/about" element={<div>About Page</div>} />
      </Routes>
    </Layout>
  )
}

export default App
