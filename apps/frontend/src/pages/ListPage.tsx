import { NewTaskInput } from '../components/NewTaskInput'

export type ListPageProps = {
  title: string
  children?: React.ReactNode
  onCreateTask?: (title: string) => Promise<unknown>
  icon?: React.ReactNode
}

export const ListPage = ({ children, title, icon, onCreateTask }: ListPageProps) => {
  return (
    <div className="h-full w-full overflow-y-auto p-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          {icon && <div className="text-project">{icon}</div>}
          <h1 className="font-bold font-heading text-3xl">{title}</h1>
        </div>

        <div className="space-y-2">
          {children}

          {onCreateTask && <NewTaskInput onCreateTask={onCreateTask} />}
        </div>
      </div>
    </div>
  )
}
