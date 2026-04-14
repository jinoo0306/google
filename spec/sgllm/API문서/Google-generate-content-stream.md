# Google 스트리밍 콘텐츠 생성 API 문서

## 개요

Google Generative AI API는 모델 생성 응답의 실시간 스트리밍을 활성화합니다. 전체 텍스트를 한 번에 제공하는 대신 시스템은 생성되면서 콘텐츠를 점진적으로 전송하여 상호작용형 애플리케이션에 이상적인 타이핑기 같은 효과를 만듭니다.

## 주요 기능

- **실시간 전달**: 콘텐츠가 생성 중에 청크 단위로 도착
- **개선된 UX**: 사용자는 완전한 응답이 완료되기 전에 결과를 볼 수 있음
- **상호작용형 애플리케이션**: 챗봇, 라이브 어시스턴트, 반응형 인터페이스에 완벽함

## 지원되는 모델

| API 엔드포인트 | 모델 |
|---|---|
| `/v1/api/google/models/generate-content-stream` | `gemini-3-pro-preview`, `gemini-2.5-flash`, `gemini-2.5-pro` |

## 리소스

- **SDK**: [Google SDK 문서](https://googleapis.github.io/python-genai/index.html)
- **공식 가이드**: [Google API 문서](https://ai.google.dev/api/generate-content?hl=ko)

## 요청 구조

**메서드**: POST  
**엔드포인트**: `/v1/api/google/models/generate-content-stream`

### 인증
```
Authorization: Bearer {api-key}
```

### 핵심 매개변수

| 매개변수 | 유형 | 필수 | 목적 |
|---|---|---|---|
| `model` | 문자열 | 예 | 생성을 위한 모델 지정 |
| `contents[]` | 객체 | 예 | 대화 콘텐츠/히스토리 |
| `config` | 객체 | 아니오 | 생성 설정 |

### 구성 옵션

- **temperature**: 무작위성 제어 (0.0-2.0)
- **topP**: 핵 샘플링 한계 (0.0-1.0)
- **topK**: 샘플링용 토큰 수
- **maxOutputTokens**: 최대 응답 길이
- **stopSequences**: 생성 종료 트리거
- **responseMimeType**: 출력 형식 지정

## 관련 엔드포인트

- **비스트리밍**: [`/models/generate-content`](/docs/sogang/factchat/api/google-generate-content)
- **이미지 생성**: [`/models/generate-images`](/docs/sogang/factchat/api/google-generate-image-sdk)

---

*마지막 업데이트: 2025년 11월 28일*
