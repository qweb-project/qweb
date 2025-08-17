import { Copy, ExternalLink, LogOut } from 'lucide-react'
import { useSignOut } from '@coinbase/cdp-hooks'

interface MenuItemsProps {
  address: string | undefined
  setDropdownOpen: (open: boolean) => void
}

export function MenuItems({ address }: MenuItemsProps) {
  const { signOut } = useSignOut();
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }
  return (
    <div className="py-1">
      <button
        onClick={copyAddress}
        className="flex items-center w-full px-3 py-2 text-sm"
      >
        <Copy className="h-4 w-4 mr-3" />
        Copy Address
      </button>
      
      <button
        onClick={() => window.open(`https://sepolia.basescan.org/address/${address}`, '_blank')}
        className="flex items-center w-full px-3 py-2 text-sm"
      >
        <ExternalLink className="h-4 w-4 mr-3" />
        View on Explorer
      </button>
      
      <div className="border-t border-border my-1" />
      
      <div className="px-3 py-2">
        <button className="flex items-center justify-center w-full px-3 py-2 text-sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  )
} 