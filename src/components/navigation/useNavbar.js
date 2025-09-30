import { useContext } from 'react'
import { NavbarContext } from './navbar-context-store'

export function useNavbar() {
  const context = useContext(NavbarContext)
  if (!context) {
    throw new Error('useNavbar doit être utilisé dans un NavbarProvider')
  }
  return context
}

export default useNavbar
