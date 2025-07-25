import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioResource, entersState } from '@discordjs/voice';
import { Client, Guild, GuildMember, VoiceChannel } from 'discord.js';
import play from 'play-dl';
import youtubeDl from 'youtube-dl-exec';
import { Collection } from 'discord.js';
import { getYoutubeDlOptions, simulateHumanBehavior } from '../utils/antiDetection';
import { retryYoutubeDl, isRecoverableError } from '../utils/retry';

export interface Song {
  title: string;
  url: string;
  duration: number;
  thumbnail?: string;
  requestedBy: string;
  platform: 'youtube' | 'spotify';
}

export interface Queue {
  songs: Song[];
  volume: number;
  playing: boolean;
  loop: boolean;
}

export class MusicManager {
  private client: Client;
  private queues: Collection<string, Queue>;
  private players: Collection<string, AudioPlayer>;
  private connections: Collection<string, any>;
  private checkEmptyChannelInterval: NodeJS.Timeout | null = null;

  constructor(client: Client) {
    this.client = client;
    this.queues = new Collection();
    this.players = new Collection();
    this.connections = new Collection();
    
    // Iniciar verificação de canais vazios
    this.startEmptyChannelCheck();
  }

  // Obter ou criar fila para um servidor
  private getQueue(guildId: string): Queue {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, {
        songs: [],
        volume: 100,
        playing: false,
        loop: false
      });
    }
    return this.queues.get(guildId)!;
  }

  // Obter ou criar player para um servidor
  private getPlayer(guildId: string): AudioPlayer {
    if (!this.players.has(guildId)) {
      const player = createAudioPlayer();
      this.players.set(guildId, player);
      
      // Configurar eventos do player
      player.on(AudioPlayerStatus.Idle, () => {
        this.playNext(guildId);
      });

      player.on('error', (error: any) => {
        console.error('Erro no player de áudio:', error);
      });
    }
    return this.players.get(guildId)!;
  }

  // Adicionar música à fila
  async addToQueue(guildId: string, song: Song): Promise<void> {
    const queue = this.getQueue(guildId);
    queue.songs.push(song);
    
    if (!queue.playing) {
      await this.playNext(guildId);
    }
  }

  // Reproduzir próxima música
  private async playNext(guildId: string): Promise<void> {
    const queue = this.getQueue(guildId);
    const player = this.getPlayer(guildId);

    if (queue.songs.length === 0) {
      queue.playing = false;
      
      // Sair do canal de voz quando a fila acabar
      console.log('🎵 Fila vazia, saindo do canal de voz...');
      this.leaveVoiceChannel(guildId);
      return;
    }

    const song = queue.songs.shift()!;
    queue.playing = true;

    try {
      // Verificar se a URL existe
      if (!song.url) {
        console.error('URL da música está undefined:', song);
        this.playNext(guildId); // Tentar próxima música
        return;
      }

      console.log('Tentando reproduzir:', song.url);
      
      let stream;
      
      // Verificar se é uma URL do Spotify
      if (song.platform === 'spotify') {
        try {
          // Para Spotify, usar play-dl para buscar no YouTube
          const searchResults = await play.search(song.title, { limit: 1 });
          if (searchResults.length === 0) {
            throw new Error('Nenhuma música encontrada no YouTube para reproduzir');
          }
          
          const video = searchResults[0];
          const videoUrl = (video as any).video_details?.url || (video as any).url;
          
                     // Usar youtube-dl para reproduzir a música do YouTube com anti-detecção e retry
           stream = await retryYoutubeDl(async () => {
             await simulateHumanBehavior();
             
             const options = getYoutubeDlOptions();
             return youtubeDl.exec(videoUrl, {
               ...options,
               output: '-'
             });
           });
        } catch (error) {
          console.error('Erro ao processar música do Spotify:', error);
          this.playNext(guildId); // Tentar próxima música
          return;
        }
      } else {
        // Para YouTube, usar youtube-dl diretamente com anti-detecção e retry
        stream = await retryYoutubeDl(async () => {
          await simulateHumanBehavior();
          
          const options = getYoutubeDlOptions();
          return youtubeDl.exec(song.url, {
            ...options,
            output: '-'
          });
        });
      }
      
      if (!stream.stdout) {
        throw new Error('Stream stdout é null');
      }
      
      const resource = createAudioResource(stream.stdout, {
        inlineVolume: true
      });
      
      resource.volume?.setVolume(queue.volume / 100);
      player.play(resource);
      
      // Conectar o player à conexão de voz existente
      const connection = this.connections.get(guildId);
      if (connection) {
        connection.subscribe(player);
      }

      console.log(`🎵 Tocando: ${song.title}`);
    } catch (error) {
      console.error('Erro ao reproduzir música:', error);
      this.playNext(guildId); // Tentar próxima música
    }
  }

  // Pausar música
  pause(guildId: string): boolean {
    const player = this.getPlayer(guildId);
    const queue = this.getQueue(guildId);
    
    if (queue.playing) {
      player.pause();
      return true;
    }
    return false;
  }

  // Retomar música
  resume(guildId: string): boolean {
    const player = this.getPlayer(guildId);
    const queue = this.getQueue(guildId);
    
    if (queue.playing) {
      player.unpause();
      return true;
    }
    return false;
  }

  // Parar música
  stop(guildId: string): void {
    const player = this.getPlayer(guildId);
    const queue = this.getQueue(guildId);
    
    player.stop();
    queue.songs = [];
    queue.playing = false;
  }

  // Pular música
  skip(guildId: string): boolean {
    const player = this.getPlayer(guildId);
    const queue = this.getQueue(guildId);
    
    if (queue.playing) {
      player.stop();
      return true;
    }
    return false;
  }

  // Definir volume
  setVolume(guildId: string, volume: number): void {
    const queue = this.getQueue(guildId);
    queue.volume = Math.max(0, Math.min(100, volume));
  }

  // Obter fila atual
  getCurrentQueue(guildId: string): Song[] {
    return this.getQueue(guildId).songs;
  }

  // Verificar se está tocando
  isPlaying(guildId: string): boolean {
    return this.getQueue(guildId).playing;
  }

  // Obter volume atual
  getVolume(guildId: string): number {
    return this.getQueue(guildId).volume;
  }

  // Verificar canais vazios periodicamente
  private startEmptyChannelCheck(): void {
    this.checkEmptyChannelInterval = setInterval(() => {
      this.connections.forEach((connection, guildId) => {
        const guild = this.client.guilds.cache.get(guildId);
        if (guild) {
          const voiceChannel = guild.members.cache.find(m => m.voice.channel)?.voice.channel;
          
          // Se não há ninguém no canal (exceto o bot)
          if (!voiceChannel || voiceChannel.members.size <= 1) {
            console.log(`Canal vazio detectado em ${guild.name}, saindo...`);
            this.leaveVoiceChannel(guildId);
          }
        }
      });
    }, 30000); // Verificar a cada 30 segundos
  }

  // Sair do canal de voz
  private leaveVoiceChannel(guildId: string): void {
    const connection = this.connections.get(guildId);
    const queue = this.getQueue(guildId);
    const player = this.getPlayer(guildId);
    
    if (connection) {
      connection.destroy();
      this.connections.delete(guildId);
    }
    
    if (player) {
      player.stop();
    }
    
    // Limpar fila
    queue.songs = [];
    queue.playing = false;
    
    console.log(`Bot saiu do canal de voz em ${guildId}`);
  }

  // Limpar recursos quando o bot for desligado
  destroy(): void {
    if (this.checkEmptyChannelInterval) {
      clearInterval(this.checkEmptyChannelInterval);
    }
    
    this.connections.forEach((connection, guildId) => {
      connection.destroy();
    });
    
    this.players.forEach((player) => {
      player.stop();
    });
    
    this.connections.clear();
    this.players.clear();
    this.queues.clear();
  }

  // Conectar ao canal de voz
  async joinVoiceChannel(member: GuildMember): Promise<boolean> {
    const voiceChannel = member.voice.channel;
    
    if (!voiceChannel) {
      return false;
    }

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      // Armazenar a conexão
      this.connections.set(voiceChannel.guild.id, connection);

      connection.on(VoiceConnectionStatus.Ready, () => {
        console.log('Conectado ao canal de voz!');
      });

      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        console.log(`Bot foi desconectado do canal de voz em ${voiceChannel.guild.name}`);
        
        // Limpar fila e parar reprodução
        const guildId = voiceChannel.guild.id;
        const queue = this.getQueue(guildId);
        const player = this.getPlayer(guildId);
        
        if (player) {
          player.stop();
        }
        
        // Limpar fila
        queue.songs = [];
        queue.playing = false;
        
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
        } catch (error) {
          console.log('Tentativa de reconexão falhou, destruindo conexão...');
          connection.destroy();
          this.connections.delete(guildId);
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao conectar ao canal de voz:', error);
      return false;
    }
  }
} 