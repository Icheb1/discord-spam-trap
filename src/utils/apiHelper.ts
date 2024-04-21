import { Role, GuildBasedChannel, Interaction } from 'discord.js';

export function getChannel(
  channelId: string,
  interaction: Interaction
): GuildBasedChannel | undefined {
  if (!channelId) return undefined;

  const channel = interaction.guild?.channels.cache.get(channelId);
  return channel;
}

export function getRole(
  roleId: string,
  interaction: Interaction
): Role | undefined {
  if (!roleId) return undefined;

  const role = interaction.guild?.roles.cache.get(roleId);
  return role;
}