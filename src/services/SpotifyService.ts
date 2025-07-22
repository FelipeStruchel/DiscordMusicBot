interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  duration_ms: number;
  external_urls: { spotify: string };
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

export class SpotifyService {
  private accessToken: string = '';
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  }

  private clientId: string | undefined;
  private clientSecret: string | undefined;

  // Obter token de acesso do Spotify
  private async getAccessToken(): Promise<string> {
    if (this.accessToken !== '' && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Credenciais do Spotify não configuradas');
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error('Falha ao obter token do Spotify');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Erro ao obter token do Spotify:', error);
      throw error;
    }
  }

  // Extrair informações de uma URL do Spotify
  async getTrackInfo(spotifyUrl: string): Promise<{ title: string; artist: string; duration: number; url: string }> {
    try {
      const token = await this.getAccessToken();
      
      // Extrair ID da música da URL
      const trackId = this.extractTrackId(spotifyUrl);
      if (!trackId) {
        throw new Error('URL do Spotify inválida');
      }

      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao obter informações da música do Spotify');
      }

      const track: SpotifyTrack = await response.json();
      
      return {
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        duration: Math.floor(track.duration_ms / 1000),
        url: spotifyUrl
      };
    } catch (error) {
      console.error('Erro ao obter informações do Spotify:', error);
      throw error;
    }
  }

  // Buscar música no Spotify
  async searchTrack(query: string): Promise<{ title: string; artist: string; duration: number; url: string } | null> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar no Spotify');
      }

      const data: SpotifySearchResponse = await response.json();
      
      if (data.tracks.items.length === 0) {
        return null;
      }

      const track = data.tracks.items[0];
      
      return {
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        duration: Math.floor(track.duration_ms / 1000),
        url: track.external_urls.spotify
      };
    } catch (error) {
      console.error('Erro ao buscar no Spotify:', error);
      return null;
    }
  }

  // Extrair ID da música de uma URL do Spotify
  private extractTrackId(url: string): string {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    if (!match) {
      throw new Error('URL do Spotify inválida');
    }
    return match[1];
  }

  // Verificar se é uma URL do Spotify
  isSpotifyUrl(url: string): boolean {
    return url.includes('spotify.com/track/');
  }
} 