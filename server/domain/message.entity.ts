export interface MessageEntity {
  readonly id: number;
  readonly chatId: number;
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly imageUrl: string | null;
  readonly editedImageUrl: string | null;
  readonly metadata: MessageMetadata | null;
  readonly createdAt: Date;
}

export interface MessageMetadata {
  readonly status?: string;
  readonly error?: string;
  readonly originalPrompt?: string;
  readonly seed?: number;
}

export interface CreateMessageData {
  readonly chatId: number;
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly imageUrl?: string | null;
  readonly editedImageUrl?: string | null;
  readonly metadata?: MessageMetadata | null;
}

export class Message implements MessageEntity {
  constructor(
    public readonly id: number,
    public readonly chatId: number,
    public readonly role: 'user' | 'assistant',
    public readonly content: string,
    public readonly imageUrl: string | null,
    public readonly editedImageUrl: string | null,
    public readonly metadata: MessageMetadata | null,
    public readonly createdAt: Date
  ) {}

  static create(data: CreateMessageData, id: number): Message {
    return new Message(
      id,
      data.chatId,
      data.role,
      data.content,
      data.imageUrl || null,
      data.editedImageUrl || null,
      data.metadata || null,
      new Date()
    );
  }

  isValid(): boolean {
    return this.content.trim().length > 0 && this.chatId > 0;
  }

  isUserMessage(): boolean {
    return this.role === 'user';
  }

  isAssistantMessage(): boolean {
    return this.role === 'assistant';
  }

  hasImage(): boolean {
    return this.imageUrl !== null;
  }

  hasEditedImage(): boolean {
    return this.editedImageUrl !== null;
  }

  withEditedImage(editedImageUrl: string): Message {
    return new Message(
      this.id,
      this.chatId,
      this.role,
      this.content,
      this.imageUrl,
      editedImageUrl,
      this.metadata,
      this.createdAt
    );
  }

  withMetadata(metadata: MessageMetadata): Message {
    return new Message(
      this.id,
      this.chatId,
      this.role,
      this.content,
      this.imageUrl,
      this.editedImageUrl,
      metadata,
      this.createdAt
    );
  }
}