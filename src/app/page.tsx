import dynamic from 'next/dynamic'

const ProjectHub = dynamic(
  () => import('@/components/project-hub').then(mod => mod.default),
  {
    loading: () => <div>Loading...</div>
  }
)

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <ProjectHub />
    </main>
  )
} 