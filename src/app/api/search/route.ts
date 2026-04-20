import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://factchat-cloud.mindlogic.ai/v1/api/anthropic/messages';

// Allow larger request bodies for image uploads (up to ~6.5MB base64 ≈ 5MB raw)
export const runtime = 'nodejs';
export const maxDuration = 60;

type ContentItem =
  | { type: 'text'; text: string }
  | {
      type: 'image';
      source: { type: 'base64'; media_type: string; data: string };
    };

interface SearchRequest {
  query?: string;
  image?: string; // base64 (no data: prefix)
  imageType?: string; // e.g. 'image/jpeg'
  previousAnswer?: string; // 직전 턴의 답변 — 간이 대화 컨텍스트용
}

export async function POST(req: NextRequest) {
  try {
    const { query, image, imageType, previousAnswer }: SearchRequest = await req.json();

    const hasQuery = typeof query === 'string' && query.trim().length > 0;
    const hasImage = typeof image === 'string' && image.length > 0;

    if (!hasQuery && !hasImage) {
      return NextResponse.json(
        { error: '검색어 또는 이미지를 입력해주세요.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SGLLM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    // Build the Anthropic content array
    const content: ContentItem[] = [];

    if (hasImage) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageType || 'image/jpeg',
          data: image!,
        },
      });
    }

    if (hasQuery) {
      content.push({ type: 'text', text: query!.trim() });
    } else if (hasImage) {
      // Image without text - default prompt
      content.push({ type: 'text', text: '이 이미지에 있는 문제의 답을 알려주세요.' });
    }

    const trimmedPrev =
      typeof previousAnswer === 'string' ? previousAnswer.trim() : '';
    const systemPrompt = trimmedPrev
      ? `한국어로 답변하세요.\n\n아래는 직전 턴에서 당신이 사용자에게 준 답변입니다. 사용자의 이번 질문이 이 답변을 이어받는 후속 질문일 수 있으니, 필요하면 맥락으로 활용해 주세요.\n\n[직전 답변]\n${trimmedPrev}`
      : '한국어로 답변하세요.';

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('SGLLM API error:', res.status, errText);
      return NextResponse.json({ error: `API 오류 (${res.status})` }, { status: 500 });
    }

    const data = await res.json();
    const answer =
      data?.content?.find((c: { type: string; text?: string }) => c.type === 'text')?.text || '';

    return NextResponse.json({ answer });
  } catch (err) {
    console.error('Search route error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
