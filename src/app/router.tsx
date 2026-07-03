import { createBrowserRouter, Navigate } from 'react-router'
import { QueuePage } from '@/features/inbox/QueuePage'
import { DetailPage } from '@/features/conversation/DetailPage'

export const router = createBrowserRouter([
  { path: '/', element: <QueuePage /> },
  { path: '/c/:id', element: <DetailPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
