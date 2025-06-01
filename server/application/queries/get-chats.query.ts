import { Chat } from '../../domain/chat.entity';
import { ChatRepository } from '../../domain/repositories/chat.repository';

export class GetChatsQuery {}

export class GetChatsQueryHandler {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(query: GetChatsQuery): Promise<Chat[]> {
    return this.chatRepository.findAll();
  }
}