import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import TanStackQueryLayout from '../integrations/tanstack-query/layout'
import { AuthProvider, useAuth } from '../context/auth-context'
import { NotificationProvider } from '../context/notification-context'
import { NotificationManager } from '../components/notifications'
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
      <NotificationManager />
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
        <NotificationProvider>
          <TanStackQueryLayout>
            <AppContent />
          </TanStackQueryLayout>
        </NotificationProvider>
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
