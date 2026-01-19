import {
  ArchiveIcon,
  CalendarDaysIcon,
  IceCreamConeIcon,
  InboxIcon,
  LogOut,
  type LucideIcon,
  Plus,
  Settings,
  SunIcon,
  X,
} from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import type { ListType } from 'shared'
import { signOut, useSession } from '../../lib/auth-client'
import { useRootStore } from '../../models/RootStoreContext'
import { ListItem } from '../ListItem'
import { SidebarNavItem } from './SidebarNavItem'

interface StaticPage {
  name: string
  icon: LucideIcon
  href: string
  badge?: (rs: ReturnType<typeof useRootStore>) => string | number | null
}

const STATIC_PAGES: StaticPage[] = [
  {
    name: 'Inbox',
    icon: InboxIcon,
    href: '/inbox',
    badge: (rs) => rs.inboxTasks.length || null,
  },
  { name: 'Now', icon: SunIcon, href: '/now' },
  { name: 'Upcoming', icon: CalendarDaysIcon, href: '/upcoming' },
  { name: 'On Ice', icon: IceCreamConeIcon, href: '/on-ice' },
  { name: 'Archive', icon: ArchiveIcon, href: '/archive' },
]

// Areas first, projects second, regular lists last
function sortByListTypeAndName(
  a: { type: ListType; name: string },
  b: { type: ListType; name: string },
) {
  const typeOrder: { [key in ListType]: number } = { area: 0, project: 1, list: 2 }
  if (typeOrder[a.type] !== typeOrder[b.type]) {
    return typeOrder[a.type] - typeOrder[b.type]
  }
  return a.name.localeCompare(b.name)
}

interface SidebarProps {
  onAddListClick: () => void
  isMobileOpen: boolean
  onMobileClose: () => void
}

export const Sidebar = observer(({ onAddListClick, isMobileOpen, onMobileClose }: SidebarProps) => {
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
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-full flex-col border-gray-300 bg-neutral-lighter p-4 transition-transform duration-300 ease-in-out md:static md:w-72 md:shrink-0 md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/* Close button - Only visible on mobile */}
        <button
          type="button"
          onClick={onMobileClose}
          className="mb-4 self-end rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>

        <div className="flex-1 overflow-y-auto">
          {STATIC_PAGES.map((page) => (
            <SidebarNavItem
              key={page.href}
              href={page.href}
              icon={page.icon}
              name={page.name}
              badge={page.badge?.(store)}
            />
          ))}

          <h3 className="mt-6 mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
            Lists
          </h3>

          {/* All lists */}
          <div className="space-y-1">
            {standaloneLists
              .filter((list) => !list.archived && !list.onIce)
              .sort(sortByListTypeAndName)
              .map((list) => (
                <div key={list.id}>
                  <ListItem list={list} />
                  {/* Children of standalone lists (e.g., projects nested in lists) */}
                  {list.type === 'list' &&
                    store
                      .getChildLists(list.id)
                      .filter((childList) => !childList.archived && !childList.onIce)
                      .sort(sortByListTypeAndName)
                      .map((childList) => (
                        <ListItem key={childList.id} list={childList} isNested />
                      ))}
                </div>
              ))}
            {areas.map((area) => (
              <div key={area.id}>
                <ListItem list={area} />
                {store
                  .getChildLists(area.id)
                  .filter((childList) => !childList.archived && !childList.onIce)
                  .sort(sortByListTypeAndName)
                  .map((childList) => (
                    <div key={childList.id}>
                      <ListItem list={childList} isNested />
                      {/* Third level: projects nested in lists (inside areas) */}
                      {childList.type === 'list' &&
                        store
                          .getChildLists(childList.id)
                          .filter(
                            (grandchildList) => !grandchildList.archived && !grandchildList.onIce,
                          )
                          .sort(sortByListTypeAndName)
                          .map((grandchildList) => (
                            <ListItem
                              key={grandchildList.id}
                              list={grandchildList}
                              nestingLevel={2}
                            />
                          ))}
                    </div>
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
          <div className="mb-2 flex items-center justify-between px-2">
            <div className="text-gray-500 text-xs">{session?.user.name || session?.user.email}</div>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Settings"
            >
              <Settings size={14} />
            </button>
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
    </>
  )
})
