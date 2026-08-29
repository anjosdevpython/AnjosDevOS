/**
 * CoWork Channel Gateway Integration
 * Multi-channel messaging: WhatsApp, Telegram, Discord, Slack, Teams, etc.
 * Based on CoWork-OS Channel Gateway architecture
 */

export type ChannelType = 'whatsapp' | 'telegram' | 'discord' | 'slack' | 'teams' | 'email' | 'signal' | 'matrix' | 'line' | 'imessage' | 'x';

export type ChannelStatus = 'connected' | 'disconnected' | 'error' | 'configuring';

export interface ChannelConfig {
  id: string;
  type: ChannelType;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: ChannelStatus;
  workspace?: string;
  agentRole?: string;
  guidance?: string;
  toolPolicy?: string[];
  sharedMemory: boolean;
  config: Record<string, unknown>;
  createdAt: Date;
  lastActivity?: Date;
  messageCount: number;
}

export interface ChannelMessage {
  id: string;
  channelId: string;
  content: string;
  sender: string;
  senderAvatar?: string;
  timestamp: Date;
  isAgent: boolean;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  threadId?: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video' | 'link';
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface ChannelTemplate {
  id: string;
  name: string;
  type: ChannelType;
  description: string;
  icon: string;
  color: string;
  setupSteps: string[];
  requiredConfig: string[];
}

export const CHANNEL_TEMPLATES: ChannelTemplate[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    type: 'whatsapp',
    description: 'QR code pairing, self-chat mode, markdown support',
    icon: '💬',
    color: '#25d366',
    setupSteps: [
      'Scan QR code with WhatsApp',
      'Configure self-chat or group mode',
      'Set agent role and guidance',
      'Enable shared memory (optional)',
    ],
    requiredConfig: ['phone_number'],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    type: 'telegram',
    description: 'Bot commands, streaming responses, group routing',
    icon: '✈️',
    color: '#0088cc',
    setupSteps: [
      'Create bot with @BotFather',
      'Enter bot token',
      'Configure allowed groups',
      'Set workspace and agent role',
    ],
    requiredConfig: ['bot_token'],
  },
  {
    id: 'discord',
    name: 'Discord',
    type: 'discord',
    description: 'Slash commands, DM support, guild integration',
    icon: '🎮',
    color: '#5865f2',
    setupSteps: [
      'Create Discord application',
      'Add bot to server',
      'Configure slash commands',
      'Set channel specialization',
    ],
    requiredConfig: ['bot_token', 'guild_id'],
  },
  {
    id: 'slack',
    name: 'Slack',
    type: 'slack',
    description: 'Socket Mode, channel mentions, file uploads',
    icon: '💼',
    color: '#4a154b',
    setupSteps: [
      'Create Slack app',
      'Enable Socket Mode',
      'Install to workspace',
      'Configure channel routing',
    ],
    requiredConfig: ['app_token', 'bot_token'],
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    type: 'teams',
    description: 'Bot Framework SDK, DM/channel mentions',
    icon: '🏢',
    color: '#6264a7',
    setupSteps: [
      'Register in Azure AD',
      'Create Teams app',
      'Configure bot endpoint',
      'Publish to organization',
    ],
    requiredConfig: ['app_id', 'app_secret'],
  },
  {
    id: 'email',
    name: 'Email',
    type: 'email',
    description: 'IMAP/SMTP, any email provider, threading',
    icon: '✉️',
    color: '#ea4335',
    setupSteps: [
      'Configure IMAP server',
      'Configure SMTP server',
      'Set credentials',
      'Configure filtering rules',
    ],
    requiredConfig: ['imap_host', 'smtp_host', 'email', 'password'],
  },
  {
    id: 'signal',
    name: 'Signal',
    type: 'signal',
    description: 'End-to-end encrypted messaging via signal-cli',
    icon: '🔒',
    color: '#3a76f0',
    setupSteps: [
      'Install signal-cli',
      'Register phone number',
      'Configure E2E encryption',
      'Set up message handling',
    ],
    requiredConfig: ['phone_number'],
  },
  {
    id: 'matrix',
    name: 'Matrix',
    type: 'matrix',
    description: 'Federated messaging, room-based, E2E encryption',
    icon: '🔗',
    color: '#0dbd8b',
    setupSteps: [
      'Create Matrix account',
      'Configure homeserver',
      'Set up room access',
      'Enable E2E encryption',
    ],
    requiredConfig: ['homeserver', 'user_id', 'access_token'],
  },
  {
    id: 'line',
    name: 'LINE',
    type: 'line',
    description: 'Messaging API webhooks, 200M+ users in Asia',
    icon: '💚',
    color: '#00c300',
    setupSteps: [
      'Create LINE Developers account',
      'Create Messaging API channel',
      'Configure webhook URL',
      'Set message handling',
    ],
    requiredConfig: ['channel_id', 'channel_secret'],
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    type: 'x',
    description: 'Mention-trigger task ingress with allowlist controls',
    icon: '🐦',
    color: '#1da1f2',
    setupSteps: [
      'Create X Developer account',
      'Create app and get keys',
      'Configure mention triggers',
      'Set allowlist controls',
    ],
    requiredConfig: ['api_key', 'api_secret', 'access_token', 'access_secret'],
  },
];

export function createChannelConfig(type: ChannelType, name: string): ChannelConfig {
  const template = CHANNEL_TEMPLATES.find(t => t.type === type);
  return {
    id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    name,
    description: template?.description || '',
    icon: template?.icon || '📡',
    color: template?.color || '#6b7280',
    status: 'configuring',
    sharedMemory: false,
    config: {},
    createdAt: new Date(),
    messageCount: 0,
  };
}

export function createMessage(channelId: string, content: string, sender: string, isAgent: boolean = false): ChannelMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    channelId,
    content,
    sender,
    timestamp: new Date(),
    isAgent,
  };
}

export function getChannelsByType(type: ChannelType): ChannelTemplate[] {
  return CHANNEL_TEMPLATES.filter(t => t.type === type);
}

export function getConnectedChannels(channels: ChannelConfig[]): ChannelConfig[] {
  return channels.filter(c => c.status === 'connected');
}
