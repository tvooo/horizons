import { ListPage } from './ListPage'

export function OnIce() {
  return (
    <ListPage title="On Ice">
      <div className="py-12 text-center text-gray-500">
        <p className="text-lg">Coming soon...</p>
        <p className="mt-2 text-sm">Tasks and projects you've put on hold will appear here.</p>
      </div>
    </ListPage>
  )
}
