import { Chat, CreateChatData } from '../../domain/chat.entity';
import { ChatRepository } from '../../domain/repositories/chat.repository';

export interface CreateChatCommand {
  title: string;
}

export class CreateChatCommandHandler {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(command: CreateChatCommand): Promise<Chat> {
    const createData: CreateChatData = {
      title: command.title.trim() || `Chat ${new Date().toLocaleDateString()}`
    };

    return this.chatRepository.create(createData);
  }
}