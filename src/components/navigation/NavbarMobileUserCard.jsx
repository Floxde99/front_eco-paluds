import { Avatar } from '@/components/Avatar'

export function NavbarMobileUserCard({ user }) {
  if (!user) {
    return null
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <Avatar size="md" />
      <div>
        <p className="text-sm font-medium">
          {user.prenom} {user.nom}
        </p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
    </div>
  )
}

export default NavbarMobileUserCard
