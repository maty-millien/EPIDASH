import "@/frontend/App.css"
import { Dashboard } from "@/frontend/components/dashboard/Dashboard"
import { ProjectDetails } from "@/frontend/components/project-details/ProjectDetails"
import { ErrorState } from "@/frontend/components/ui/ErrorState"
import { LoadingState } from "@/frontend/components/ui/LoadingState"
import type { EpitestResult } from "@/shared/types/api"
import type { ProcessedProject, View } from "@/shared/types/ui"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"

const { electronAPI } = window

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [apiData, setApiData] = useState<EpitestResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<View>({ type: "dashboard" })

  const handleSelectProject = useCallback((project: ProcessedProject) => {
    setCurrentView({ type: "project-details", project })
  }, [])

  const handleBackToDashboard = useCallback(() => {
    setCurrentView({ type: "dashboard" })
  }, [])

  const fetchData = useCallback(async () => {
    setFetching(true)
    setError(null)
    try {
      const data = (await electronAPI.fetchEpitestData()) as EpitestResult[]
      setApiData(data)
    } catch (err) {
      const errorMsg = String(err)
      // Token expired or invalid - clear session and trigger re-login
      if (errorMsg.includes("403")) {
        setIsLoggedIn(false)
        await electronAPI.reauth()
      } else {
        setError(errorMsg)
      }
    } finally {
      setFetching(false)
    }
  }, [])

  // Check initial auth state and auto-login
  useEffect(() => {
    const initAuth = async () => {
      const loggedIn = await electronAPI.isLoggedIn()

      if (loggedIn) {
        setIsLoggedIn(true)
        setLoading(false)
      } else {
        try {
          await electronAPI.startLogin()
        } catch (err) {
          setError(String(err))
        }
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Fetch data automatically when logged in
  useEffect(() => {
    if (!isLoggedIn) return
    fetchData()
  }, [isLoggedIn, fetchData])

  if (loading || !isLoggedIn) {
    return null
  }

  return (
    <div className="bg-void min-h-screen font-sans">
      {/* Drag region for window movement (Electron style) */}
      <div className="from-void fixed top-0 right-0 left-0 z-50 h-8 bg-linear-to-b to-transparent [-webkit-app-region:drag]" />

      {/* Main content */}
      <main className="pt-8">
        <AnimatePresence mode="wait">
          {fetching && !apiData && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LoadingState />
            </motion.div>
          )}

          {error && !apiData && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ErrorState message={error} onRetry={fetchData} />
            </motion.div>
          )}

          {apiData && currentView.type === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard
                data={apiData}
                onRefresh={fetchData}
                isRefreshing={fetching}
                onSelectProject={handleSelectProject}
              />
            </motion.div>
          )}

          {apiData && currentView.type === "project-details" && (
            <motion.div
              key="project-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <ProjectDetails
                project={currentView.project}
                onBack={handleBackToDashboard}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
