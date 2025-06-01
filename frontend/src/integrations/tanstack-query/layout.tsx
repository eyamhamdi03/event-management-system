import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function LayoutAddition() {
  return <ReactQueryDevtools buttonPosition="bottom-right" />
}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/context/auth-context'

const queryClient = new QueryClient()

interface TanStackQueryLayoutProps {
  children: ReactNode
}

export default function TanStackQueryLayout({
  children,
}: TanStackQueryLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
