import { Message, CreateMessageData, MessageMetadata } from '../../domain/message.entity';
import { MessageRepository } from '../../domain/repositories/message.repository';

export interface CreateMessageCommand {
  chatId: number;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  editedImageUrl?: string;
  metadata?: MessageMetadata;
}

export class CreateMessageCommandHandler {
  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(command: CreateMessageCommand): Promise<Message> {
    const createData: CreateMessageData = {
      chatId: command.chatId,
      role: command.role,
      content: command.content,
      imageUrl: command.imageUrl || null,
      editedImageUrl: command.editedImageUrl || null,
      metadata: command.metadata || null
    };

    return this.messageRepository.create(createData);
  }
}