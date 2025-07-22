import { Collection } from 'discord.js';
import { CommandInteraction } from 'discord.js';

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, any>;
    aliases: Collection<string, any>;
  }
}

export interface Command {
  data: any;
  execute: (interaction: CommandInteraction, musicManager: any) => Promise<void>;
} 