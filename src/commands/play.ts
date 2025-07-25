import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { MusicManager, Song } from '../managers/MusicManager';
import play from 'play-dl';
import youtubeDl from 'youtube-dl-exec';
import { SpotifyService } from '../services/SpotifyService';
import { getYoutubeDlOptions, simulateHumanBehavior } from '../utils/antiDetection';
import { retryYoutubeDl, isRecoverableError } from '../utils/retry';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Tocar uma música do YouTube ou Spotify')
  .addStringOption(option =>
    option.setName('query')
      .setDescription('URL ou nome da música')
      .setRequired(true));

export async function execute(interaction: CommandInteraction, musicManager: MusicManager) {
  let query = (interaction as any).options.getString('query', true);
  
  // Limpar a URL de aspas extras (problema do Windows)
  query = query.replace(/^["']|["']$/g, '').trim();
  
  console.log('Query original:', (interaction as any).options.getString('query', true));
  console.log('Query limpa:', query);
  
  const member = interaction.member as any;

  // Verificar se o usuário está em um canal de voz
  if (!member.voice.channel) {
    return interaction.reply({
      content: '❌ Você precisa estar em um canal de voz para usar este comando!',
      ephemeral: true
    });
  }

  await interaction.deferReply();

  try {
    // Conectar ao canal de voz
    const connected = await musicManager.joinVoiceChannel(member);
    if (!connected) {
      return interaction.editReply('❌ Não foi possível conectar ao canal de voz!');
    }

    let song: Song;

    // Verificar se é uma URL do Spotify
    if (query.includes('spotify.com')) {
      try {
        const spotifyService = new SpotifyService();
        const spotifyInfo = await spotifyService.getTrackInfo(query);
        
        song = {
          title: `${spotifyInfo.title} - ${spotifyInfo.artist}`,
          url: query,
          duration: spotifyInfo.duration,
          requestedBy: interaction.user.tag,
          platform: 'spotify'
        };
      } catch (error) {
        console.error('Erro ao processar Spotify:', error);
        return interaction.editReply('❌ Erro ao processar música do Spotify. Tente uma URL do YouTube ou busque por nome.');
      }
    } else {
      // Verificar se é uma URL do YouTube ou buscar por nome
      try {
        let video;
        
        // Sempre usar play-dl para busca (mais confiável)
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
          // É uma URL do YouTube - converter para formato padrão
          let youtubeUrl = query;
          if (query.includes('youtu.be')) {
            const videoId = query.split('youtu.be/')[1].split('?')[0];
            youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
          }
          console.log('URL convertida:', youtubeUrl);
          
          // Usar youtube-dl para obter informações com anti-detecção e retry
          try {
            const videoInfo = await retryYoutubeDl(async () => {
              // Simular comportamento humano
              await simulateHumanBehavior();
              
              const options = getYoutubeDlOptions();
              return await youtubeDl.exec(youtubeUrl, {
                ...options,
                dumpSingleJson: true
              });
            });
            
            const videoInfoJson = JSON.parse(videoInfo.stdout);
            video = {
              video_details: {
                title: videoInfoJson.title,
                url: youtubeUrl,
                durationInSec: videoInfoJson.duration,
                thumbnails: [{ url: videoInfoJson.thumbnail }]
              }
            };
          } catch (error) {
            console.error('Erro ao obter info com youtube-dl:', error);
            
            // Se for erro de bot detection, sugerir busca por nome
            if (isRecoverableError(error)) {
              return interaction.editReply('❌ YouTube detectou atividade automatizada. Tente buscar por nome da música em vez de usar URL direta.');
            }
            
            return interaction.editReply('❌ Erro ao processar URL do YouTube. Tente buscar por nome.');
          }
        } else {
          // Buscar por nome
          const searchResults = await play.search(query, { limit: 1 });
          if (searchResults.length === 0) {
            return interaction.editReply('❌ Nenhuma música encontrada!');
          }
          video = searchResults[0];
        }

        const songUrl = (video as any).video_details?.url || (video as any).url;
        console.log('URL extraída:', songUrl);
        
        song = {
          title: (video as any).video_details?.title || (video as any).title || 'Música desconhecida',
          url: songUrl,
          duration: (video as any).video_details?.durationInSec || (video as any).durationInSec || 0,
          thumbnail: (video as any).video_details?.thumbnails?.[0]?.url || (video as any).thumbnails?.[0]?.url,
          requestedBy: interaction.user.tag,
          platform: 'youtube'
        };
      } catch (error) {
        console.error('Erro ao buscar no YouTube:', error);
        return interaction.editReply('❌ Erro ao buscar música. Verifique se a URL é válida ou tente buscar por nome.');
      }
    }

    // Adicionar à fila
    await musicManager.addToQueue(interaction.guildId!, song);

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🎵 Adicionado à fila')
      .setDescription(`**${song.title}**`)
      .addFields(
        { name: 'Duração', value: formatDuration(song.duration), inline: true },
        { name: 'Solicitado por', value: song.requestedBy, inline: true },
        { name: 'Plataforma', value: song.platform === 'youtube' ? 'YouTube' : 'Spotify', inline: true }
      )
      .setTimestamp();

    if (song.thumbnail) {
      embed.setThumbnail(song.thumbnail);
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('Erro no comando play:', error);
    await interaction.editReply('❌ Ocorreu um erro ao processar sua solicitação!');
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 