# Coinbase Embedded Wallet Integration Setup

This guide helps you complete the setup of Coinbase embedded wallet integration in your Qweb application.

## 🚀 Quick Setup

### 1. Get Your CDP Project ID

1. Visit [CDP Portal](https://portal.cdp.coinbase.com/projects/overview)
2. Create a new project or select an existing one
3. Copy your Project ID from the project settings

### 2. Add Domain to Allowlist

1. Go to [Domains Configuration](https://portal.cdp.coinbase.com/products/embedded-wallets/domains) in CDP Portal
2. Click **Add domain**
3. For local development, add: `http://localhost:3000`
4. For production, add your actual domain (e.g., `https://yourapp.com`)

⚠️ **Important**: Never add `localhost` to your production CDP project for security reasons.

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Coinbase Developer Platform Project ID
NEXT_PUBLIC_CDP_PROJECT_ID=your-cdp-project-id-here
```

Replace `your-cdp-project-id-here` with your actual Project ID from step 1.

### 4. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`

3. You should see a wallet connection prompt instead of the search input

4. Sign in with your email to create/connect your embedded wallet

5. Once connected, the search input will be enabled and you can start chatting!

## 🔧 How It Works

### Wallet-Gated UI

- **Before Connection**: Users can see the search input but the submit button is disabled with a tooltip prompting wallet connection
- **After Connection**: Full Qweb functionality is available with enabled search
- **Wallet Info**: Connected wallet address is displayed in the top-right with copy functionality
- **Sign In**: Clean sign-in button appears in top-right when wallet not connected

### Component Integration

The integration adds wallet checking to key components:

- `EmptyChat`: Always shows search input, displays sign-in button in top-right when not connected
- `EmptyChatMessageInput`: Submit button disabled with tooltip when wallet not connected
- `MessageInput`: Submit button disabled with tooltip when wallet not connected  
- `Navbar`: Displays wallet address and sign-out option when connected (in chat conversations)
- `WalletConnectionHeader`: Shows sign-in button or wallet info in top-right area

### Wallet Features

- **Email Sign-in**: No seed phrases or complex wallet setup
- **Embedded Experience**: Wallet is built into your app, not a browser extension
- **Address Management**: Copy wallet address with one click
- **Session Management**: Persistent login across browser sessions
- **Theme Integration**: Matches Qweb's existing design system

## 🎨 Customization

### Theme Configuration

The wallet UI automatically adapts to your existing theme. You can customize colors in:

`src/components/wallet/CDPProvider.tsx`

```tsx
const theme = {
  "colors-bg-primary": "#24A0ED", // Your brand color
  "colors-fg-primary": "#24A0ED", // Accent color
  // ... other theme options
};
```

### Wallet Components

- `WalletConnection`: Main connection interface
- `WalletConnectionHeader`: Compact wallet info for navbar
- `CDPProvider`: Wraps app with Coinbase infrastructure

## 🔒 Security Notes

- Environment variables are properly configured with `NEXT_PUBLIC_` prefix
- CDP handles all private key management securely
- No sensitive wallet data is stored in your application
- Domain allowlist prevents unauthorized usage

## 🌐 Network Configuration

By default, the wallet operates on **Base Sepolia** (testnet). For production:

1. Wallets automatically work on Base mainnet
2. Testnet ETH can be obtained from [Base Sepolia Faucet](https://portal.cdp.coinbase.com/products/faucet)
3. Users can fund wallets and send transactions once connected

## 📚 Additional Resources

- [CDP Web SDK Documentation](https://coinbase.github.io/cdp-web)
- [React Hooks Reference](https://docs.cdp.coinbase.com/embedded-wallets/react-hooks)
- [React Components Reference](https://docs.cdp.coinbase.com/embedded-wallets/react-components)
- [Base Network Information](https://base.org)

## 🆘 Troubleshooting

### Common Issues

1. **"Project ID not found"**: Check your environment variable and CDP Portal setup
2. **Domain not allowed**: Verify your domain is added to the allowlist in CDP Portal  
3. **Wallet not connecting**: Ensure you're using the correct domain (http://localhost:3000 for development)
4. **Theme issues**: Verify CSS variables are properly defined in your theme system

### Support

For additional help:
- [CDP Support](https://support.coinbase.com)
- [Base Discord](https://discord.gg/buildonbase)
- [Coinbase Developer Forums](https://forums.coinbase.com)
