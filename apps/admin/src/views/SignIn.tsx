import { Layout } from './Layout'

interface SignInProps {
  error?: string
}

export function SignIn({ error }: SignInProps) {
  return (
    <Layout title="Sign In">
      <div class="flex min-h-screen items-center justify-center">
        <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 class="mb-6 text-center font-bold text-2xl text-gray-900">Horizons Admin</h1>

          {error && (
            <div class="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form method="post" action="/api/auth/sign-in/email" class="space-y-4">
            <div>
              <label for="email" class="block font-medium text-gray-700 text-sm">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label for="password" class="block font-medium text-gray-700 text-sm">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <input type="hidden" name="callbackURL" value="/" />

            <button
              type="submit"
              class="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
