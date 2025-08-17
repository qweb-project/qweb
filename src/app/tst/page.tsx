'use client';

import { useIsSignedIn, useEvmAddress } from "@coinbase/cdp-hooks";
import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import { Wallet, Copy, Check } from "lucide-react";
import { useState } from "react";
import ServerWalletInfo from "@/components/wallet/ServerWalletInfo";
import { ConnectButton } from "@/components/connect-wallet";
import Navbar from "@/components/Navbar";

export default function Page() {
  return (
    <Navbar messages={[]} chatId="1" />
  );
}
