import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Toaster } from '@/components/Toaster'
import { ShortcutsProvider } from '@/features/shortcuts/ShortcutsProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: { retry: 0 },
  },
})

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ShortcutsProvider>{children}</ShortcutsProvider>
      <Toaster />
    </QueryClientProvider>
  )
}
