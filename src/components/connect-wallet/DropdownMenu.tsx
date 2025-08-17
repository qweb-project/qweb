import { ProfileHeader } from './ProfileHeader'
import { MenuItems } from './MenuItems'

interface DropdownMenuProps {
  address: string | undefined
  dropdownOpen: boolean
  setDropdownOpen: (open: boolean) => void
  formatAddress: (addr: string) => string
}

export function DropdownMenu({ 
  address, 
  dropdownOpen, 
  setDropdownOpen, 
  formatAddress 
}: DropdownMenuProps) {
  if (!dropdownOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-10" 
        onClick={() => setDropdownOpen(false)}
      />
      
      <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-20">
        <ProfileHeader address={address} formatAddress={formatAddress} />
        <MenuItems address={address} setDropdownOpen={setDropdownOpen} />
      </div>
    </>
  )
} 