import { MemoryChatRepository } from './repositories/memory-chat.repository';
import { MemoryMessageRepository } from './repositories/memory-message.repository';
import { CreateChatCommandHandler } from '../application/commands/create-chat.command';
import { CreateMessageCommandHandler } from '../application/commands/create-message.command';
import { GetChatsQueryHandler } from '../application/queries/get-chats.query';
import { GetMessagesQueryHandler } from '../application/queries/get-messages.query';
import { ImageEditingService } from '../application/services/image-editing.service';
import { ChatController } from '../presentation/controllers/chat.controller';
import { MessageController } from '../presentation/controllers/message.controller';

export class Container {
  // Repositories
  private readonly chatRepository = new MemoryChatRepository();
  private readonly messageRepository = new MemoryMessageRepository();

  // Command Handlers
  private readonly createChatHandler = new CreateChatCommandHandler(this.chatRepository);
  private readonly createMessageHandler = new CreateMessageCommandHandler(this.messageRepository);

  // Query Handlers
  private readonly getChatsHandler = new GetChatsQueryHandler(this.chatRepository);
  private readonly getMessagesHandler = new GetMessagesQueryHandler(this.messageRepository);

  // Services
  private readonly imageEditingService = new ImageEditingService(this.messageRepository);

  // Controllers
  public readonly chatController = new ChatController(
    this.createChatHandler,
    this.createMessageHandler,
    this.getChatsHandler
  );

  public readonly messageController = new MessageController(
    this.createMessageHandler,
    this.getMessagesHandler,
    this.imageEditingService
  );
}

export const container = new Container();