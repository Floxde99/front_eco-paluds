import { Link } from 'react-router-dom'

export function NavbarBrand() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <img src="/logo.jpg" alt="EcoConnect Paluds" className="h-8 w-8" />
      <span className="text-xl font-bold text-gray-900">EcoConnect Paluds</span>
    </Link>
  )
}

export default NavbarBrand
