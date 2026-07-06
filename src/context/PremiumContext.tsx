"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as jose from 'jose';

interface PremiumContextType {
  isPro: boolean;
  verifyLicense: (token: string) => Promise<boolean>;
}

const PremiumContext = createContext<PremiumContextType>({ 
  isPro: false, 
  verifyLicense: async () => false 
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('toolhub_pro_token');
    if (token) {
      verifyLicense(token).then(valid => setIsPro(valid));
    }
  }, []);

  const verifyLicense = async (token: string) => {
    try {
      // Asymmetric ES256 verification — public key can only verify, never sign
      const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEmPcFjUMBzuGWNexNe+ylzscMuNRt
6OIAbddZIJp9O4xz7SyyitTU3EHTL9jWhmr8IriJzazGK+kwGX/EORgvfg==
-----END PUBLIC KEY-----`;
      const publicKey = await jose.importSPKI(publicKeyPem, 'ES256');
      const { payload: claims } = await jose.jwtVerify(token, publicKey);

      if (claims && claims.tier === 'pro') {
        const isExpired = claims.exp && claims.exp < Date.now() / 1000;
        if (!isExpired) {
          localStorage.setItem('toolhub_pro_token', token);
          setIsPro(true);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error("Invalid License Signature");
      return false;
    }
  };

  return (
    <PremiumContext.Provider value={{ isPro, verifyLicense }}>
      {children}
    </PremiumContext.Provider>
  );
}

export const usePremium = () => useContext(PremiumContext);
