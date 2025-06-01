import { MessageRepository } from '../../domain/repositories/message.repository';
import { MessageMetadata } from '../../domain/message.entity';

export interface ImageEditRequest {
  messageId: number;
  imageUrl: string;
  prompt: string;
  chatId: number;
}

export interface ImageEditResponse {
  editedImageUrl: string;
  originalImageUrl: string;
  prompt: string;
  seed?: number;
}

export class ImageEditingService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async processImageEdit(request: ImageEditRequest): Promise<void> {
    try {
      // Update message with processing status
      await this.updateMessageStatus(request.messageId, 'processing');

      // Call FLUX.1 Kontext API
      const result = await this.callFluxAPI(request.imageUrl, request.prompt);

      // Update message with edited image
      const message = await this.messageRepository.findById(request.messageId);
      if (message) {
        const updatedMessage = message.withEditedImage(result.editedImageUrl);
        const metadata: MessageMetadata = {
          status: 'completed',
          originalPrompt: request.prompt,
          seed: result.seed
        };
        const finalMessage = updatedMessage.withMetadata(metadata);
        
        await this.messageRepository.update(request.messageId, {
          editedImageUrl: finalMessage.editedImageUrl,
          metadata: finalMessage.metadata
        });
      }
    } catch (error) {
      await this.updateMessageStatus(request.messageId, 'error', String(error));
    }
  }

  private async updateMessageStatus(messageId: number, status: string, error?: string): Promise<void> {
    const metadata: MessageMetadata = {
      status,
      error
    };
    
    await this.messageRepository.update(messageId, { metadata });
  }

  private async callFluxAPI(imageUrl: string, prompt: string): Promise<ImageEditResponse> {
    const { fal } = await import('@fal-ai/client');
    
    const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
      input: {
        prompt: prompt,
        image_url: imageUrl,
        guidance_scale: 3.5,
        num_images: 1,
        safety_tolerance: "2",
        output_format: "jpeg"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`Processing image edit:`, update.logs?.map(log => log.message).join(", "));
        }
      },
    });

    if (result.data && result.data.images && result.data.images.length > 0) {
      return {
        editedImageUrl: result.data.images[0].url,
        originalImageUrl: imageUrl,
        prompt: prompt,
        seed: result.data.seed
      };
    } else {
      throw new Error("No images returned from FLUX API");
    }
  }
}