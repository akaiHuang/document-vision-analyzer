import { NextRequest, NextResponse } from 'next/server';
import ollama from 'ollama';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert file to buffer then base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // Call Ollama with glm-ocr model
    const response = await ollama.chat({
      model: 'glm-ocr',
      messages: [{
        role: 'user',
        content: 'Please analyze this image and extract all text content from it.', 
        images: [base64Image]
      }]
    });

    return NextResponse.json({ text: response.message.content });
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      { error: 'Failed to process image', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
