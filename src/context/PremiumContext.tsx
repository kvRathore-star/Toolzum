"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as jose from 'jose';

interface ProLicensePayload extends jose.JWTPayload {
  tier: string;
  sub: string;
}

interface PremiumContextType {
  isPro: boolean;
  verifyLicense: (token: string) => Promise<boolean>;
}

const PremiumContext = createContext<PremiumContextType>({ 
  isPro: false, 
  verifyLicense: async () => false 
});

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEmPcFjUMBzuGWNexNe+ylzscMuNRt
6OIAbddZIJp9O4xz7SyyitTU3EHTL9jWhmr8IriJzazGK+kwGX/EORgvfg==
-----END PUBLIC KEY-----`;

const PRO_ISSUER = 'toolzum-license-server';

function validateProClaims(claims: jose.JWTPayload): claims is ProLicensePayload {
  if (!claims || typeof claims !== 'object') return false;
  if (claims.tier !== 'pro') return false;
  if (!claims.sub || typeof claims.sub !== 'string') return false;
  if (claims.iss !== PRO_ISSUER) return false;
  if (claims.exp && typeof claims.exp === 'number' && claims.exp < Date.now() / 1000) return false;
  return true;
}

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);

  const verifyLicense = useCallback(async (token: string): Promise<boolean> => {
    try {
      const publicKey = await jose.importSPKI(PUBLIC_KEY_PEM, 'ES256');
      const { payload: claims } = await jose.jwtVerify(token, publicKey, {
        issuer: PRO_ISSUER,
      });

      if (!validateProClaims(claims)) {
        console.warn('Pro license validation failed: invalid claims structure');
        return false;
      }

      setIsPro(true);
      return true;
    } catch (e) {
      console.error("Pro license verification failed:", e);
      return false;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('toolzum_pro_token');
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- verify a persisted pro token on mount and update license state
      verifyLicense(token).then(valid => {
        if (!valid) {
          localStorage.removeItem('toolzum_pro_token');
        }
      }).catch(() => {});
    }
  }, [verifyLicense]);

  return (
    <PremiumContext.Provider value={{ isPro, verifyLicense }}>
      {children}
    </PremiumContext.Provider>
  );
}

export const usePremium = () => useContext(PremiumContext);
