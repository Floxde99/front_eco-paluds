import { Avatar } from '@/components/Avatar'

export function NavbarMobileUserCard({ user }) {
  if (!user) {
    return null
  }

  const firstName = user.firstName ?? user.prenom ?? ''
  const lastName = user.lastName ?? user.nom ?? ''
  const fullName = `${firstName} ${lastName}`.trim()

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <Avatar size="md" />
      <div>
        <p className="text-sm font-medium">
          {fullName || firstName || user.email || 'Utilisateur'}
        </p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
    </div>
  )
}

export default NavbarMobileUserCard
