import { useState } from 'react'
import { useEvmAddress } from '@coinbase/cdp-hooks'
import { ConnectedProfile } from './ConnectedProfile'
import { ConnectButton } from './ConnectButton'

export function ConnectWallet() {
  const { evmAddress: address } = useEvmAddress()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  if (address) {
    return (
      <ConnectedProfile 
        address={address ?? undefined} 
        dropdownOpen={dropdownOpen} 
        setDropdownOpen={setDropdownOpen} 
      />
    )
  }
  
  return (
    <div className="flex items-center gap-2">
      <ConnectButton />
    </div>
  )
} 