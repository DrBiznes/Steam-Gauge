// src/App.tsx

import { Layout } from "@/components/layout/Layout"
import { Routes, Route } from "react-router-dom"
import { Home } from "@/home/Home"
import { GaugePage } from "@/gauge/GaugePage"
import { GuessPage } from "@/guess/GuessPage"  // Add this import

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gauge" element={<GaugePage />}>
          <Route path="top100in2weeks" element={<GaugePage />} />
          <Route path="top100forever" element={<GaugePage />} />
          <Route path="genre/:genre" element={<GaugePage />} />
        </Route>
        {/* Add these new routes for Artfuscation */}
        <Route path="/artfuscation" element={<GuessPage />}>
          <Route path="top100in2weeks" element={<GuessPage />} />
          <Route path="top100forever" element={<GuessPage />} />
          <Route path="genre/:genre" element={<GuessPage />} />
        </Route>
        <Route path="/about" element={<div>About Page</div>} />
      </Routes>
    </Layout>
  )
}

export default App