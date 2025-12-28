import {
  CalendarDaysIcon,
  IceCreamConeIcon,
  InboxIcon,
  LogOut,
  type LucideIcon,
  Plus,
  SunIcon,
} from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { signOut, useSession } from '../../lib/auth-client'
import { useRootStore } from '../../models/RootStore'
import { ListItem } from '../ListItem'
import { SidebarNavItem } from './SidebarNavItem'

interface StaticPage {
  name: string
  icon: LucideIcon
  href: string
}

const STATIC_PAGES: StaticPage[] = [
  { name: 'Inbox', icon: InboxIcon, href: '/inbox' },
  { name: 'Now', icon: SunIcon, href: '/now' },
  { name: 'Upcoming', icon: CalendarDaysIcon, href: '/upcoming' },
  { name: 'On Ice', icon: IceCreamConeIcon, href: '/on-ice' },
]

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
    <div className="flex w-72 shrink-0 flex-col border-gray-300 bg-neutral-lighter p-4">
      <div className="flex-1 overflow-y-auto">
        {STATIC_PAGES.map((page) => (
          <SidebarNavItem key={page.href} href={page.href} icon={page.icon} name={page.name} />
        ))}

        <h3 className="mt-6 mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
          Lists
        </h3>

        {/* All lists */}
        <div className="space-y-1">
          {standaloneLists
            .filter((list) => !list.archived)
            .map((list) => (
              <ListItem key={list.id} list={list} />
            ))}
          {areas.map((area) => (
            <div key={area.id}>
              <ListItem list={area} />
              {store
                .getChildLists(area.id)
                .filter((childList) => !childList.archived)
                .map((childList) => (
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
