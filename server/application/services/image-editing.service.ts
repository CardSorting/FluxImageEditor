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
    if (!process.env.FAL_KEY) {
      throw new Error('FAL_KEY environment variable is required for image editing');
    }

    const response = await fetch('https://fal.run/fal-ai/flux-1-kontext/image-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: prompt,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        seed: Math.floor(Math.random() * 1000000)
      }),
    });

    if (!response.ok) {
      throw new Error(`FLUX API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      editedImageUrl: result.images[0].url,
      originalImageUrl: imageUrl,
      prompt: prompt,
      seed: result.seed
    };
  }
}