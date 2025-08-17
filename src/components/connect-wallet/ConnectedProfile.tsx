import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/Button'
import { DropdownMenu } from './DropdownMenu'
import { getPP } from './utils'

interface ConnectedProfileProps {
  address: string | undefined
  className?: string
  showChevron?: boolean
  dropdownOpen: boolean
  trimAddress?: boolean
  trimAddressLength?: number
  hoverable?: boolean
  setDropdownOpen: (open: boolean) => void
}

export function ConnectedProfile({ 
  address, 
  dropdownOpen, 
  setDropdownOpen,
  className,
  showChevron = true,
  trimAddress = true,
  trimAddressLength = 4,
  hoverable = true
}: ConnectedProfileProps) {
  const formatAddress = (addr: string) => {
    return trimAddress ? `${addr.slice(0, trimAddressLength)}...${addr.slice(-trimAddressLength)}` : addr
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        variant="outline"
        radius="xl"
        size="sm"
        className={`flex items-center ${className} ${hoverable ? 'hover:bg-primary/10' : ''}`}
      >
        <div className="w-full h-12 rounded-full">
          <img 
            src={getPP(address)} 
            alt="Profile" 
            className="w-12 h-12 object-cover" 
          />
        </div>        
        <span className="hidden sm:inline text-xs font-medium">
          {address ? formatAddress(address) : ''}
        </span>
        {showChevron && (
          <ChevronDown className={`h-3 w-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        )}
      </Button>

      <DropdownMenu 
        address={address}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        formatAddress={formatAddress}
      />
    </div>
  )
} 