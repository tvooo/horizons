import { Menu } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { RootStore } from 'shared'
import { api } from './api/client'
import { AddListModal } from './components/AddListModal'
import { DebugPanel } from './components/DebugPanel'
import { FocusModeUI } from './components/FocusModeUI'
import { ListView } from './components/ListView'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Sidebar } from './components/sidebar/Sidebar'
import { useGlobalKeyboardShortcut } from './hooks/useGlobalKeyboardShortcut'
import { DebugStore } from './models/DebugStore'
import { DebugStoreProvider, useDebugStore } from './models/DebugStoreContext'
import { RootStoreProvider, useRootStore } from './models/RootStoreContext'
import { Archive } from './pages/Archive'
import { Inbox } from './pages/Inbox'
import { JoinWorkspace } from './pages/JoinWorkspace'
import { Now } from './pages/Now'
import { OnIce } from './pages/OnIce'
import { Settings } from './pages/Settings'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import { Upcoming } from './pages/Upcoming'

const AuthenticatedApp = observer(() => {
  const store = useRootStore()
  const debugStore = useDebugStore()
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const location = useLocation()

  const toggleDebugPanel = useCallback(() => {
    debugStore.toggle()
  }, [debugStore])

  useGlobalKeyboardShortcut({ key: 'd', ctrl: true, shift: true }, toggleDebugPanel)

  // Close mobile sidebar on navigation
  // biome-ignore lint/correctness/useExhaustiveDependencies: setIsMobileSidebarOpen is stable from useState
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    store.loadData()
  }, [store])

  if (store.loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`flex h-screen w-screen flex-col overflow-hidden ${debugStore.isOpen ? 'pb-7' : ''}`}
      >
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            onAddListClick={() => setIsAddListModalOpen(true)}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <div className="relative flex flex-1 flex-col overflow-hidden">
            {/* Hamburger Menu Button - Only visible on mobile */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="absolute top-4 left-4 z-10 rounded-lg bg-white p-2 text-gray-700 shadow-md hover:bg-gray-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            <Routes>
              <Route path="/" element={<Navigate to="/upcoming" replace />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/now" element={<Now />} />
              <Route path="/upcoming" element={<Upcoming />} />
              <Route path="/on-ice" element={<OnIce />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/list/:listId" element={<ListView />} />
            </Routes>
          </div>
        </div>
      </div>

      <AddListModal isOpen={isAddListModalOpen} onClose={() => setIsAddListModalOpen(false)} />

      <FocusModeUI />

      <DebugPanel />
    </>
  )
})

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Join workspace route (protected, but without sidebar) */}
      <Route
        path="/join/:code"
        element={
          <ProtectedRoute>
            <JoinWorkspace />
          </ProtectedRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  const rootStore = useMemo(() => new RootStore(api), [])
  const debugStore = useMemo(() => new DebugStore(), [])

  return (
    <RootStoreProvider value={rootStore}>
      <DebugStoreProvider value={debugStore}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DebugStoreProvider>
    </RootStoreProvider>
  )
}

export default App
