import {
    SlashCommandBuilder,
    Interaction,
    SlashCommandSubcommandBuilder,
    SlashCommandStringOption,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
  } from 'discord.js';
  
  import { getGuildConfig, updateConfig } from '../config/config';
  import { SubcommandObject } from '../types';
  import { parseSubcommands, replyEphemeral } from '../utils/commandHelpers';
  import { getChannel, getRole } from '../utils/apiHelper';
  import { DiscordClient } from '../DiscordClient';

  module.exports = {
    data: new SlashCommandBuilder()
      .setName('consequences')
      .setDescription('Manages the consequences')
      .addSubcommand((subCommand: SlashCommandSubcommandBuilder) =>
        subCommand
          .setName('set')
          .setDescription('Sets the consequence')
          .addStringOption((option: SlashCommandStringOption) =>
            option
              .setName('consequence')
              .setDescription('Id of the trap channel')
              .setRequired(true)
              .addChoices(
                { name: 'Kick', value: 'kick' },
                { name: 'Ban', value: 'ban' },
                { name: 'Revoke Role', value: 'revoking Role' }
            )
          )
      )
      .addSubcommand((subCommand: SlashCommandSubcommandBuilder) =>
        subCommand
          .setName('get')
          .setDescription('Gets the current consequence')
      )
      .addSubcommand((subCommand: SlashCommandSubcommandBuilder) =>
        subCommand
          .setName('setrole')
          .setDescription('Sets the role that gets revoked')
          .addStringOption((option: SlashCommandStringOption) =>
            option
              .setName('id')
              .setDescription('Id of the role')
              .setRequired(true)
          )   
      )
      .setDefaultMemberPermissions(
        PermissionFlagsBits.BanMembers | PermissionFlagsBits.ManageChannels
      )
      .setDMPermission(false),

    async execute(
      client: DiscordClient,
      interaction: ChatInputCommandInteraction
    ) {
      if (!interaction.isChatInputCommand()) return;
  
      if (!interaction.guildId)
        return replyEphemeral(interaction, 'Could not access guild id');
      const guildConfig = getGuildConfig(client.config, interaction.guildId);
  
      const subcommands: SubcommandObject[] = [
        {
          name: 'set',
          execute(interaction) {
            const newConsequence = interaction.options.getString('consequence')?.toLowerCase() ?? '';
            if (["kick", "ban", "revoking role"].includes(newConsequence)) {
              guildConfig.consequence = newConsequence;
            updateConfig(client.config);
            replyEphemeral(
              interaction,
              'Successfully set consequence to ' + newConsequence
            );
            } else {
              return replyEphemeral(
                interaction,
                'Unknown consequence'
              );
            }
        }, 
      },
        {
          name: 'setrole',
          execute(interaction) {
            const newRoleId = interaction.options.getString('id') ?? '';
            const newRole = getRole(newRoleId, interaction) ?? '';
            if (!newRole) 
              return replyEphemeral(
                interaction,
                'Could not find any role with that id'
              );
            
            guildConfig.roleId = newRoleId;
            updateConfig(client.config);
            replyEphemeral(
              interaction,
              'Successfully set role to ' + newRole.name
            );
            
            
          },
        },
        {
          name: 'get',
          execute(interaction) {
            if (guildConfig.consequence == "role" && guildConfig.roleId != undefined) {
              replyEphemeral(
                interaction,
                'Current consequence is removing Role' + getRole(guildConfig.roleId, interaction)?.name
              );
            } else {
              replyEphemeral(
              interaction,
              'Current consequence is ' + guildConfig.consequence
            );
            }
            
          },
        },
      ];
  
      parseSubcommands(interaction, subcommands);
    },
  };