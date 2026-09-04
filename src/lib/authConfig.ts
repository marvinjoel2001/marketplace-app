export interface AuthProvidersConfig {
  google: {
    enabled: boolean;
    clientId: string;
  };
  tiktok: {
    enabled: boolean;
    clientKey: string;
  };
  facebook: {
    enabled: boolean;
    appId: string;
  };
}

export const authConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  jwtSecret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'chiringuito_jwt_secret_key_bolivia_2026',

  // Google
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',

  // TikTok
  tiktokClientKey: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY || '',
  tiktokClientSecret: process.env.TIKTOK_CLIENT_SECRET || '',

  // Facebook
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
  facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',

  // Helper to check if credentials are configured
  getProviderStatus(): AuthProvidersConfig {
    return {
      google: {
        enabled: Boolean(this.googleClientId && this.googleClientId.length > 5 && !this.googleClientId.includes('tu-google')),
        clientId: this.googleClientId,
      },
      tiktok: {
        enabled: Boolean(this.tiktokClientKey && this.tiktokClientKey.length > 3 && !this.tiktokClientKey.includes('tu-tiktok')),
        clientKey: this.tiktokClientKey,
      },
      facebook: {
        enabled: Boolean(this.facebookAppId && this.facebookAppId.length > 3 && !this.facebookAppId.includes('tu-facebook')),
        appId: this.facebookAppId,
      },
    };
  },

  // Generar URL para inicio de sesión con Google
  getGoogleOAuthUrl(redirectUri?: string): string {
    const callback = redirectUri || `${this.appUrl}/api/auth/callback/google`;
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: callback,
      client_id: this.googleClientId,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };
    const qs = new URLSearchParams(options).toString();
    return `${rootUrl}?${qs}`;
  },

  // Generar URL para inicio de sesión con TikTok Login Kit
  getTikTokOAuthUrl(redirectUri?: string): string {
    const callback = redirectUri || `${this.appUrl}/api/auth/callback/tiktok`;
    const rootUrl = 'https://www.tiktok.com/v2/auth/authorize/';
    const options = {
      client_key: this.tiktokClientKey,
      scope: 'user.info.basic',
      response_type: 'code',
      redirect_uri: callback,
      state: 'chiringuito_tiktok_auth',
    };
    const qs = new URLSearchParams(options).toString();
    return `${rootUrl}?${qs}`;
  },

  // Generar URL para inicio de sesión con Facebook
  getFacebookOAuthUrl(redirectUri?: string): string {
    const callback = redirectUri || `${this.appUrl}/api/auth/callback/facebook`;
    const rootUrl = 'https://www.facebook.com/v19.0/dialog/oauth';
    const options = {
      client_id: this.facebookAppId,
      redirect_uri: callback,
      scope: 'email,public_profile',
      response_type: 'code',
      state: 'chiringuito_fb_auth',
    };
    const qs = new URLSearchParams(options).toString();
    return `${rootUrl}?${qs}`;
  },
};
