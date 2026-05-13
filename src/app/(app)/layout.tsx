import { createClient } from '@/lib/supabase/server'
import { SideNav, BottomNav } from './NavBar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-green-50 flex">
      <SideNav email={user?.email ?? ''} />

      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
