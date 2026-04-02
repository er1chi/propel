import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Propel CRM</h1>
      <p className="mt-4 text-muted-foreground">Welcome to Propel CRM 2.0</p>
    </div>
  )
}
