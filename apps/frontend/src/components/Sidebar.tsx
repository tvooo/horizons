import clsx from 'clsx'
import { CalendarDaysIcon, IceCreamConeIcon, InboxIcon, LogOut, Plus } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { NavLink, useNavigate } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { signOut, useSession } from '../lib/auth-client'
import { useRootStore } from '../models/RootStore'
import { ListItem } from './ListItem'

interface SidebarProps {
  onAddListClick: () => void
}

export const Sidebar = observer(({ onAddListClick }: SidebarProps) => {
  const store = useRootStore()
  const areas = store.areas
  const standaloneLists = store.getStandaloneLists()
  const { data: session } = useSession()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/signin')
  }

  return (
    <div className="flex w-64 flex-col border-gray-300 border-r bg-white p-4">
      <div className="flex-1 overflow-y-auto">
        <NavLink
          to="/inbox"
          className={({ isActive }) =>
            twMerge(
              clsx(
                'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 text-sm hover:bg-gray-100',
                {
                  'bg-blue-50 text-blue-900': isActive,
                },
              ),
            )
          }
        >
          <InboxIcon size={16} className="shrink-0 text-gray-500" />
          <span className="flex-1">Inbox</span>
        </NavLink>
        <NavLink
          to="/upcoming"
          className={({ isActive }) =>
            twMerge(
              clsx(
                'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 text-sm hover:bg-gray-100',
                {
                  'bg-blue-50 text-blue-900': isActive,
                },
              ),
            )
          }
        >
          <CalendarDaysIcon size={16} className="shrink-0 text-gray-500" />
          <span className="flex-1">Upcoming</span>
        </NavLink>

        <NavLink
          to="/on-ice"
          className={({ isActive }) =>
            twMerge(
              clsx(
                'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 text-sm hover:bg-gray-100',
                {
                  'bg-blue-50 text-blue-900': isActive,
                },
              ),
            )
          }
        >
          <IceCreamConeIcon size={16} className="shrink-0 text-gray-500" />
          <span className="flex-1">On Ice</span>
        </NavLink>

        <h3 className="mt-6 mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
          Lists
        </h3>

        {/* All lists */}
        <div className="space-y-1">
          {standaloneLists.map((list) => (
            <ListItem key={list.id} list={list} />
          ))}
          {areas.map((area) => (
            <div key={area.id}>
              <ListItem list={area} />
              {store.getChildLists(area.id).map((childList) => (
                <ListItem key={childList.id} list={childList} isNested />
              ))}
            </div>
          ))}
        </div>

        {/* Add List Button */}
        <button
          type="button"
          onClick={onAddListClick}
          className="mt-2 flex w-full items-center gap-2 rounded px-2 py-1.5 text-gray-500 text-sm hover:bg-gray-100 hover:text-gray-700"
        >
          <Plus size={16} className="shrink-0" />
          <span className="flex-1 text-left">Add List</span>
        </button>
      </div>

      {/* User section at bottom */}
      <div className="mt-3 border-gray-200 border-t pt-3">
        <div className="mb-2 px-2 text-gray-500 text-xs">
          {session?.user.name || session?.user.email}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-gray-500 text-sm hover:bg-gray-100 hover:text-red-600"
        >
          <LogOut size={16} className="shrink-0" />
          <span className="flex-1 text-left">Logout</span>
        </button>
      </div>
    </div>
  )
})
