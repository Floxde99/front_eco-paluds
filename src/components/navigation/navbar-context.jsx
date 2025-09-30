import { NavbarContext } from './navbar-context-store'

export function NavbarProvider({ value, children }) {
  return <NavbarContext.Provider value={value}>{children}</NavbarContext.Provider>
}

export default NavbarProvider
