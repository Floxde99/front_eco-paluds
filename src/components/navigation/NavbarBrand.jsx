import { Link } from 'react-router-dom'

export function NavbarBrand({ textClassName = 'text-slate-900' }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/logo.jpg" alt="Ecopaluds" className="h-8 w-8" />
      <span className={`text-xl font-bold ${textClassName}`}>Ecopaluds</span>
    </Link>
  )
}

export default NavbarBrand
