import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import SSEListener from '../components/sse-listener'

import TanStackQueryLayout from '../integrations/tanstack-query/layout'
import { AuthProvider, useAuth } from '../context/auth-context'
import Header from '../components/Header'
import NotFoundComponent from '../components/notfound'
import { AuthLoadingSpinner } from '../components/AuthLoadingSpinner'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

function AppContent() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <AuthLoadingSpinner />
  }

  return (
    <>
      <Header />
      <Outlet />
      <SSEListener />
      <TanStackRouterDevtools />
    </>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'EventHub - Event Management System',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  notFoundComponent: () => <NotFoundComponent />,

  component: () => (
    <RootDocument>
      <AuthProvider>
        <TanStackQueryLayout>
          <AppContent />
        </TanStackQueryLayout>
      </AuthProvider>
    </RootDocument>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster position="top-right" />

        <Scripts />
      </body>
    </html>
  )
}
