import { Message } from '../../domain/message.entity';
import { MessageRepository } from '../../domain/repositories/message.repository';

export interface GetMessagesQuery {
  chatId: number;
}

export class GetMessagesQueryHandler {
  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(query: GetMessagesQuery): Promise<Message[]> {
    return this.messageRepository.findByChatId(query.chatId);
  }
}