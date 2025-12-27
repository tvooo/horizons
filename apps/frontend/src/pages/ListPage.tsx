import { NewTaskInput } from '../components/NewTaskInput'

export type ListPageProps = {
  title: string
  children?: React.ReactNode
  onCreateTask?: (title: string) => Promise<unknown>
}

export const ListPage = ({ children, title, onCreateTask }: ListPageProps) => {
  return (
    <div className="h-full w-full overflow-y-auto p-8">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-8 font-bold text-3xl">{title}</h1>

        <div className="space-y-2">
          {children}

          {onCreateTask && <NewTaskInput onCreateTask={onCreateTask} />}
        </div>
      </div>
    </div>
  )
}
