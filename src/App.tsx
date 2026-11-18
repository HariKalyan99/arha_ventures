import { lazy } from 'react'
import { Route, Routes } from 'react-router'
import { SmoothScroll } from './components/layout/SmoothScroll'
import { Layout } from './components/layout/Layout'

const HomePage = lazy(() => import('./pages/HomePage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ProjectPage = lazy(() => import('./pages/ProjectPage'))
const StudioPage = lazy(() => import('./pages/StudioPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const AtelierPage = lazy(() => import('./pages/AtelierPage'))
const JournalPage = lazy(() => import('./pages/JournalPage'))
const ArticlePage = lazy(() => import('./pages/ArticlePage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export default function App() {
  return (
    <SmoothScroll>
      <div className="grain">
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:slug" element={<ProjectPage />} />
            <Route path="studio" element={<StudioPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="atelier" element={<AtelierPage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="journal/:slug" element={<ArticlePage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<LegalPage document="privacy" />} />
            <Route path="terms" element={<LegalPage document="terms" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </div>
    </SmoothScroll>
  )
}
