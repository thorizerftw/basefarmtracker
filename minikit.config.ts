import type { MiniAppManifest } from "@coinbase/onchainkit/minikit"; 

// ROOT_URL tanımı
const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL 
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
    : 'http://localhost:3000');
    
/**
 * MiniApp configuration object. Should align with Farcaster MiniApp specification.
 * @see {@link https://docs.base.org/mini-apps/core-concepts/manifest}
 */
export const minikitConfig: MiniAppManifest & { baseBuilder?: { ownerAddress: string } } = { 
  // Account Association - Bunu base.dev'den alıp yapıştıracaksın
  accountAssociation: { 
    header: "", 
    payload: "", 
    signature: "" 
  },
  baseBuilder: {
    ownerAddress: "" 
  },
  
  miniapp: { 
    version: "1",
    name: "BaseFarm Tracker", 
    subtitle: "Personal Airdrop Checklist", 
    description: "A personal and private airdrop farming checklist. Track your tasks, deadlines, and priorities for multiple projects, all locked to your crypto wallet.",
    
    // Gerçek dosya isimleri ('a' harfi eklendi)
    screenshotUrls: [`${ROOT_URL}/basedroptracker-portrait.png`], 
    iconUrl: `${ROOT_URL}/basedroptracker-icon.png`,             
    splashImageUrl: `${ROOT_URL}/basedroptracker-hero.png`,       

    // === YENİ: base.dev PREVIEW İÇİN GEREKLİ ===
    // Hata mesajı bunu istiyordu
    imageUrl: `${ROOT_URL}/basedroptracker-hero.png`, 
    // ===========================================

    splashBackgroundColor: "#0052FF", 
    homeUrl: ROOT_URL,
    webhookUrl: "", 
    primaryCategory: "productivity", 
    tags: ["airdrop", "tracker", "checklist", "productivity", "base"], 
    
    // Gerçek dosya isimleri ('a' harfi eklendi)
    heroImageUrl: `${ROOT_URL}/basedroptracker-hero.png`, 
    
    tagline: "Track your airdrop efficiently", 
    ogTitle: "BaseFarm Tracker",
    ogDescription: "Organize your airdrop farming activities privately and securely.",
    
    // Gerçek dosya isimleri ('a' harfi eklendi)
    ogImageUrl: `${ROOT_URL}/basedroptracker-hero.png`, 
  },
} as const;

