import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/event/details/page')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/event/details/page"!</div>
}
