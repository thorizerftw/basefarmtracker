    // import type { MiniAppManifest } from "@coinbase/onchainkit/minikit"; // TİP IMPORT'UNU KALDIRDIK!
    
    // ROOT_URL tanımı
    const ROOT_URL =
      process.env.NEXT_PUBLIC_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');
      
    /**
     * MiniApp configuration object. Should align with Farcaster MiniApp specification.
     * @see {@link https://docs.base.org/mini-apps/core-concepts/manifest} // Base Manifest dokümanına referans verelim
     */
    // Tip tanımını kaldırdık!
    export const minikitConfig = { 
      // Account Association - Bunu base.dev'den alıp yapıştıracaksın
      accountAssociation: { 
        header: "",
        payload: "",
        signature: ""
      },
      // baseBuilder alanı arkadaşının kodunda vardı
      baseBuilder: {
        ownerAddress: ""
      },
      // DEVELOPER ALANI BURADA, DIŞARIDA!
      developer: { 
        name: "thorizerftw",
        url: "https://github.com/thorizerftw" 
      },
      // miniapp nesnesi tip tanımı olmadan
      miniapp: { 
        version: "1",
        name: "BaseFarm Tracker", 
        subtitle: "Personal Airdrop Checklist", 
        description: "A personal and private airdrop farming checklist. Track your tasks, deadlines, and priorities for multiple projects, all locked to your crypto wallet.",
        // ÖNEMLİ: Resim dosyası adlarını kendi public/ klasöründeki adlarla değiştir
        screenshotUrls: [`${ROOT_URL}/basedroptracker-portrait.png`], 
        iconUrl: `${ROOT_URL}/basedroptracker-icon.png`, 
        splashImageUrl: `${ROOT_URL}/basedroptracker-hero.png`, 
        splashBackgroundColor: "#0052FF", 
        homeUrl: ROOT_URL,
        webhookUrl: "", 
        primaryCategory: "productivity", 
        tags: ["airdrop", "tracker", "checklist", "productivity", "base"], 
        heroImageUrl: `${ROOT_URL}/basedroptracker-hero.png`, 
        tagline: "Track your airdrop efficiently", 
        ogTitle: "BaseFarm Tracker",
        ogDescription: "Organize your airdrop farming activities privately and securely.",
        ogImageUrl: `${ROOT_URL}/basedroptracker-hero.png`, 
      },
    } as const;
    
    // declare global bloğunu kaldırdık
    
