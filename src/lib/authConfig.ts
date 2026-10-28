export const authConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',

  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',

  tiktokClientKey: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY || '',
  tiktokClientSecret: process.env.TIKTOK_CLIENT_SECRET || '',

  /** A provider is live only when both its public id and its secret are configured. */
  getProviderStatus() {
    return {
      google: { enabled: Boolean(this.googleClientId && this.googleClientSecret) },
      tiktok: { enabled: Boolean(this.tiktokClientKey && this.tiktokClientSecret) },
    };
  },

  getGoogleOAuthUrl(state: string): string {
    const qs = new URLSearchParams({
      redirect_uri: `${this.appUrl}/api/auth/callback/google`,
      client_id: this.googleClientId,
      response_type: 'code',
      prompt: 'select_account',
      scope: 'openid email profile',
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${qs}`;
  },

  getTikTokOAuthUrl(state: string): string {
    const qs = new URLSearchParams({
      client_key: this.tiktokClientKey,
      scope: 'user.info.basic',
      response_type: 'code',
      redirect_uri: `${this.appUrl}/api/auth/callback/tiktok`,
      state,
    });
    return `https://www.tiktok.com/v2/auth/authorize/?${qs}`;
  },
};
