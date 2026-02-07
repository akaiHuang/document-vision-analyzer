import { NextRequest, NextResponse } from 'next/server';
import ollama from 'ollama';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const mode = formData.get('mode') as string || 'ocr';
    const customPrompt = formData.get('prompt') as string;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // Default to glm-ocr, but prepared to switch if other models are installed
    let model = 'glm-ocr'; 
    let userMessage = 'Extract text.';

    switch (mode) {
      case 'ocr':
        model = 'glm-ocr';
        userMessage = 'Extract all text from this image.';
        break;
      case 'describe':
        model = 'glm-ocr'; 
        userMessage = 'Describe this image in detail.';
        break;
      case 'analyze':
        model = 'glm-ocr'; 
        userMessage = customPrompt || 'Analyze this image.';
        break;
    }

    const response = await ollama.chat({
      model: model,
      messages: [{
        role: 'user',
        content: userMessage,
        images: [base64Image]
      }]
    });

    return NextResponse.json({ text: response.message.content });
  } catch (error) {
    console.error('Vision Error:', error);
    return NextResponse.json(
      { error: 'Failed to process image', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
