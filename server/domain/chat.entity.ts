export interface ChatEntity {
  readonly id: number;
  readonly title: string;
  readonly createdAt: Date;
}

export interface CreateChatData {
  readonly title: string;
}

export class Chat implements ChatEntity {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly createdAt: Date
  ) {}

  static create(data: CreateChatData, id: number): Chat {
    return new Chat(id, data.title, new Date());
  }

  isValid(): boolean {
    return this.title.trim().length > 0;
  }
}