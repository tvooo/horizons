import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'

interface SidebarNavItemProps {
  href: string
  icon: LucideIcon
  name: string
  badge?: string | number | null
}

export function SidebarNavItem({ href, icon: Icon, name, badge }: SidebarNavItemProps) {
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        twMerge(
          clsx(
            'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 text-sm hover:bg-neutral-light',
            {
              'bg-neutral-light font-medium text-gray-900': isActive,
            },
          ),
        )
      }
    >
      <Icon size={16} className="shrink-0 text-gray-500" />
      <span className="flex-1">{name}</span>
      {badge ? (
        <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-2 py-0.5 font-medium text-gray-700 text-xs">
          {badge}
        </span>
      ) : null}
    </NavLink>
  )
}
