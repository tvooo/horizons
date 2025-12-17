import {
  CalendarDaysIcon,
  Folder,
  IceCreamConeIcon,
  InboxIcon,
  List as ListIcon,
  Target,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { Inbox } from './components/Inbox'
import { ListView } from './components/ListView'
import { OnIce } from './components/OnIce'
import { Upcoming } from './components/Upcoming'
import { lists } from './mockData'
import type { Area, List } from './types'

function App() {
  const [_health, setHealth] = useState<string>('')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealth(data.status))
      .catch((err) => console.error(err))
  }, [])

  const areas = lists.filter((list): list is Area => list.type === 'area')
  const standaloneList = lists.filter(
    (list) => list.type !== 'area' && !('areaId' in list && list.areaId),
  )
  const getListsForArea = (areaId: string) => {
    return lists.filter(
      (list) => list.type !== 'area' && 'areaId' in list && list.areaId === areaId,
    )
  }

  const renderListItem = (list: List, isNested = false) => {
    const IconComponent =
      list.type === 'area' ? Folder : list.type === 'project' ? Target : ListIcon

    return (
      <NavLink
        key={list.id}
        to={`/list/${list.id}`}
        className={({ isActive }) =>
          `${isNested ? 'ml-4' : ''} flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 text-sm hover:bg-gray-100 ${
            isActive ? 'bg-blue-50 text-blue-900' : ''
          }`
        }
      >
        <IconComponent size={16} className="flex-shrink-0 text-gray-500" />
        <span className="flex-1">{list.name}</span>
      </NavLink>
    )
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="h-16 border-gray-300 border-b bg-white" />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 overflow-y-auto border-gray-300 border-r bg-white p-4">
            <NavLink
              to="/inbox"
              className={({ isActive }) =>
                `flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 text-sm hover:bg-gray-100 ${
                  isActive ? 'bg-blue-50 text-blue-900' : ''
                }`
              }
            >
              <InboxIcon size={16} className="flex-shrink-0 text-gray-500" />
              <span className="flex-1">Inbox</span>
            </NavLink>
            <NavLink
              to="/upcoming"
              className={({ isActive }) =>
                `flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 text-sm hover:bg-gray-100 ${
                  isActive ? 'bg-blue-50 text-blue-900' : ''
                }`
              }
            >
              <CalendarDaysIcon size={16} className="flex-shrink-0 text-gray-500" />
              <span className="flex-1">Upcoming</span>
            </NavLink>

            <NavLink
              to="/on-ice"
              className={({ isActive }) =>
                `flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 text-sm hover:bg-gray-100 ${
                  isActive ? 'bg-blue-50 text-blue-900' : ''
                }`
              }
            >
              <IceCreamConeIcon size={16} className="flex-shrink-0 text-gray-500" />
              <span className="flex-1">On Ice</span>
            </NavLink>

            <h3 className="mt-6 mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Lists
            </h3>

            {/* Areas with nested lists */}
            {areas.map((area) => (
              <div key={area.id} className="mb-4">
                {renderListItem(area)}
                {getListsForArea(area.id).map((list) => renderListItem(list, true))}
              </div>
            ))}

            {/* Standalone lists */}
            {standaloneList.length > 0 && (
              <div className="mt-4 border-gray-200 border-t pt-4">
                {standaloneList.map((list) => renderListItem(list))}
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <Routes>
            <Route path="/" element={<Navigate to="/upcoming" replace />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/upcoming" element={<Upcoming />} />
            <Route path="/on-ice" element={<OnIce />} />
            <Route path="/list/:listId" element={<ListView />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
