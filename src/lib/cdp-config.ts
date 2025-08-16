import { type Config } from "@coinbase/cdp-core";
import { type AppConfig } from "@coinbase/cdp-react";

export const CDP_CONFIG: Config = { 
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID || "69091bad-b10a-495b-aa45-84bca9a45db5"
};

export const APP_CONFIG: AppConfig = {
  name: "Qweb - AI Chat with Wallet",
  logoUrl: "/icon.png", // Using the existing Qweb icon
};
