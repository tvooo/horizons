import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AddListModal } from './components/AddListModal'
import { ListView } from './components/ListView'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Sidebar } from './components/Sidebar'
import { RootStore, RootStoreProvider, useRootStore } from './models/RootStore'
import { Inbox } from './pages/Inbox'
import { Now } from './pages/Now'
import { OnIce } from './pages/OnIce'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import { Upcoming } from './pages/Upcoming'

const AppContent = observer(() => {
  const store = useRootStore()
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false)

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
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex h-screen w-screen flex-col overflow-hidden">
                {/* Top Navigation Bar */}
                <div className="h-16 border-gray-300 border-b bg-white" />

                <div className="flex flex-1 overflow-hidden">
                  <Sidebar onAddListClick={() => setIsAddListModalOpen(true)} />

                  {/* Main Content Area */}
                  <Routes>
                    <Route path="/" element={<Navigate to="/upcoming" replace />} />
                    <Route path="/inbox" element={<Inbox />} />
                    <Route path="/now" element={<Now />} />
                    <Route path="/upcoming" element={<Upcoming />} />
                    <Route path="/on-ice" element={<OnIce />} />
                    <Route path="/list/:listId" element={<ListView />} />
                  </Routes>
                </div>
              </div>

              <AddListModal
                isOpen={isAddListModalOpen}
                onClose={() => setIsAddListModalOpen(false)}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
})

function App() {
  const rootStore = useMemo(() => new RootStore(), [])

  return (
    <RootStoreProvider value={rootStore}>
      <AppContent />
    </RootStoreProvider>
  )
}

export default App
