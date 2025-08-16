import { getCdpClient } from './server-wallet';
import { createPublicClient, http, Address } from 'viem';
import { baseSepolia } from 'viem/chains';

// WebsiteRegistry smart contract deployed on Base Sepolia
export const WEBSITE_REGISTRY_ADDRESS = '0xA8832D3E571396F5F9990b0ABAC3e370e003a9A7';
export const WEBSITE_REGISTRY_NETWORK = 'base-sepolia';

// ABI for the WebsiteRegistry contract's read functions
export const WEBSITE_REGISTRY_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_websiteUrl",
        "type": "string"
      }
    ],
    "name": "getWebsite",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "url",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "paywall",
            "type": "uint256"
          }
        ],
        "internalType": "struct WebsiteRegistry.Website",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_websiteUrl",
        "type": "string"
      }
    ],
    "name": "getWebsiteOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_websiteUrl",
        "type": "string"
      }
    ],
    "name": "getWebsitePaywall",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_websiteUrl",
        "type": "string"
      }
    ],
    "name": "isWebsiteRegistered",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllWebsites",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "url",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "paywall",
            "type": "uint256"
          }
        ],
        "internalType": "struct WebsiteRegistry.Website[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface Website {
  url: string;
  owner: string;
  paywall: bigint;
}

// Create a public client for reading contract data
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

/**
 * Check if a website is registered in the smart contract
 */
export async function isWebsiteRegistered(websiteUrl: string): Promise<boolean> {
  try {
    console.log(`🔍 Checking if website is registered: ${websiteUrl}`);
    
    // Use viem to make a read-only call to the smart contract
    const result = await publicClient.readContract({
      address: WEBSITE_REGISTRY_ADDRESS as Address,
      abi: WEBSITE_REGISTRY_ABI,
      functionName: 'isWebsiteRegistered',
      args: [websiteUrl]
    });
    
    console.log(`✅ Website ${websiteUrl} registered: ${result}`);
    return result as boolean;
  } catch (error: any) {
    console.error(`❌ Error checking website registration for ${websiteUrl}:`, error?.message || error);
    return false;
  }
}

/**
 * Get website information from the smart contract
 */
export async function getWebsiteInfo(websiteUrl: string): Promise<Website | null> {
  try {
    console.log(`🔍 Getting website info for: ${websiteUrl}`);
    
    // First check if the website is registered
    const isRegistered = await isWebsiteRegistered(websiteUrl);
    if (!isRegistered) {
      console.log(`ℹ️ Website ${websiteUrl} is not registered`);
      return null;
    }
    
    console.log(`✅ Website ${websiteUrl} is registered, now getting details...`);
    
    // Get the website data
    const result = await publicClient.readContract({
      address: WEBSITE_REGISTRY_ADDRESS as Address,
      abi: WEBSITE_REGISTRY_ABI,
      functionName: 'getWebsite',
      args: [websiteUrl]
    });
    
    console.log(`📊 Raw contract result:`, result);
    
    // The contract returns an object with named properties, not an array
    const websiteData = result as { url: string; owner: string; paywall: bigint };
    
    const website: Website = {
      url: websiteData.url,
      owner: websiteData.owner,
      paywall: websiteData.paywall
    };
    
    console.log(`✅ Website info retrieved:`, {
      url: website.url,
      owner: website.owner,
      paywall: website.paywall.toString()
    });
    
    return website;
  } catch (error: any) {
    console.error(`❌ Error getting website info for ${websiteUrl}:`, error?.message || error);
    console.error(`Full error:`, error);
    return null;
  }
}

/**
 * Get the paywall amount for a website in USDC (converted from wei-like units)
 */
export async function getWebsitePaywallAmount(websiteUrl: string): Promise<string | null> {
  try {
    const websiteInfo = await getWebsiteInfo(websiteUrl);
    if (!websiteInfo) {
      return null;
    }
    
    // Convert from wei-like units to USDC (6 decimals)
    const paywallInUsdc = Number(websiteInfo.paywall) / 1000000;
    return paywallInUsdc.toString();
  } catch (error: any) {
    console.error(`❌ Error getting paywall amount for ${websiteUrl}:`, error?.errorMessage || error);
    return null;
  }
}

/**
 * Get all registered websites (useful for debugging)
 */
export async function getAllRegisteredWebsites(): Promise<Website[]> {
  try {
    console.log(`🔍 Getting all registered websites`);
    
    const result = await publicClient.readContract({
      address: WEBSITE_REGISTRY_ADDRESS as Address,
      abi: WEBSITE_REGISTRY_ABI,
      functionName: 'getAllWebsites',
      args: []
    });
    
    const websitesData = result as { url: string; owner: string; paywall: bigint }[];
    
    const websites: Website[] = websitesData.map((site) => ({
      url: site.url,
      owner: site.owner,
      paywall: site.paywall
    }));
    
    console.log(`✅ Found ${websites.length} registered websites`);
    return websites;
  } catch (error: any) {
    console.error(`❌ Error getting all websites:`, error?.message || error);
    return [];
  }
}

/**
 * Get website info directly without checking registration first (for debugging)
 */
export async function getWebsiteInfoDirect(websiteUrl: string): Promise<any> {
  try {
    console.log(`🔍 Getting website info DIRECTLY for: ${websiteUrl}`);
    
    const result = await publicClient.readContract({
      address: WEBSITE_REGISTRY_ADDRESS as Address,
      abi: WEBSITE_REGISTRY_ABI,
      functionName: 'getWebsite',
      args: [websiteUrl]
    });
    
    console.log(`📊 Direct contract result:`, result);
    return result;
  } catch (error: any) {
    console.error(`❌ Direct error for ${websiteUrl}:`, error?.message || error);
    throw error;
  }
}

/**
 * Extract main domain from URL for contract lookup
 * Removes ALL subdomains: en.wikipedia.org → wikipedia.org
 */
export function extractDomainForContract(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    let hostname = urlObj.hostname.replace(/^www\./, ''); // Remove www. prefix
    
    // Remove ALL subdomains - keep only main domain
    const domainParts = hostname.split('.');
    if (domainParts.length > 2) {
      const mainDomain = domainParts.slice(-2).join('.'); // Take last 2 parts (domain.tld)
      console.log(`🔄 Normalizing ${hostname} → ${mainDomain}`);
      return mainDomain;
    }
    
    return hostname;
  } catch {
    // If URL parsing fails, try to extract domain from string
    let domain = url.replace(/^https?:\/\/(www\.)?|\/.*$/g, '');
    
    // Remove ALL subdomains from string-extracted domain too
    const domainParts = domain.split('.');
    if (domainParts.length > 2) {
      return domainParts.slice(-2).join('.'); // Take last 2 parts
    }
    
    return domain;
  }
}

/**
 * Find registered website using normalized domain lookup
 * Domain normalization (en.wikipedia.org -> wikipedia.org) happens automatically
 */
export async function findRegisteredWebsite(url: string): Promise<Website | null> {
  const domain = extractDomainForContract(url);
  console.log(`🔍 Looking up normalized domain: ${domain} for URL: ${url}`);
  
  const websiteInfo = await getWebsiteInfo(domain);
  if (websiteInfo) {
    console.log(`✅ Match found for: ${domain}`);
    return websiteInfo;
  }
  
  console.log(`ℹ️ No registered website found for: ${url} (normalized domain: ${domain})`);
  return null;
}
