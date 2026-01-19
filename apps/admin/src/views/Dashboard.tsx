import { Layout } from './Layout'

interface UserData {
  id: string
  email: string
  name: string
  createdAt: Date
  isAdmin: boolean
  listCount: number
  taskCount: number
  tokenCount: number
}

interface DashboardProps {
  users: UserData[]
  currentUser: { name: string; email: string }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function Dashboard({ users, currentUser }: DashboardProps) {
  return (
    <Layout title="Dashboard">
      <header class="bg-white shadow">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 class="font-bold text-2xl text-gray-900">Horizons Admin</h1>
          <div class="flex items-center gap-4">
            <span class="text-gray-600 text-sm">{currentUser.email}</span>
            <form method="post" action="/api/auth/sign-out">
              <button
                type="submit"
                class="rounded bg-gray-100 px-4 py-2 text-gray-700 text-sm hover:bg-gray-200"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-8">
        <h2 class="mb-4 font-semibold text-gray-900 text-xl">Users ({users.length})</h2>

        <div class="overflow-hidden rounded-lg border bg-white shadow">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Name
                </th>
                <th class="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Lists
                </th>
                <th class="px-6 py-3 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Tasks
                </th>
                <th class="px-6 py-3 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">
                  API Tokens
                </th>
                <th class="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Admin
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user.id}>
                  <td class="whitespace-nowrap px-6 py-4 text-gray-900 text-sm">{user.email}</td>
                  <td class="whitespace-nowrap px-6 py-4 text-gray-500 text-sm">{user.name}</td>
                  <td class="whitespace-nowrap px-6 py-4 text-gray-500 text-sm">
                    {formatDate(user.createdAt)}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-gray-900 text-sm">
                    {user.listCount}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-gray-900 text-sm">
                    {user.taskCount}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-gray-900 text-sm">
                    {user.tokenCount}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm">
                    {user.isAdmin ? (
                      <span class="rounded bg-green-100 px-2 py-1 text-green-800 text-xs">Yes</span>
                    ) : (
                      <span class="rounded bg-gray-100 px-2 py-1 text-gray-600 text-xs">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </Layout>
  )
}
