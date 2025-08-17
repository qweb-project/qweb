import { getPP } from "./utils"

interface ProfileHeaderProps {
  address: string | undefined
  formatAddress: (addr: string) => string
}

export function ProfileHeader({ address, formatAddress }: ProfileHeaderProps) {
  return (
    <div className="p-3 border-b border-border">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full">
          <img 
            src={getPP(address)} 
            alt="Profile" 
            className="w-12 h-12 object-cover" 
          />
        </div>      
        <div className="flex-1 min-w-0">
          <p className="text-foreground truncate">
            {address ? formatAddress(address) : ''}
          </p>
        </div>
      </div>
    </div>
  )
}