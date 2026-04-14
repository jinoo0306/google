# Mindlogic Docs: Anthropic 메시지 생성 API

## 개요

이 문서는 Claude 기반 대화형 AI에 대한 **Anthropic 메시지 생성 API**라는 레거시 엔드포인트를 설명합니다. 페이지는 새로운 통합이 더 광범위한 기능 지원을 위해 API Gateway를 사용해야 함을 강조합니다.

## 핵심 정보

### 지원되는 모델
- `claude-sonnet-4-5-20250929`
- `claude-opus-4-5-20251101`
- `claude-haiku-4-5-20251001`

### 엔드포인트 세부사항

**메서드:** POST  
**경로:** `/v1/api/anthropic/messages`

서비스는 입력 메시지 배열을 기반으로 자연스러운 응답을 생성하면서 고급 구성을 지원합니다.

### 필수 매개변수

1. **model** (문자열): 응답 생성을 위한 Claude 모델 ID. Claude 3+ 권장.

2. **messages** (배열): 기본64로 인코딩된 이미지를 지원하는 대화 메시지 객체. 역할은 "user"와 "assistant" 사이에 교대로 나타나야 하며, 시스템 프롬프트는 별도로 구성됩니다.

3. **max_tokens** (정수): 생성된 응답의 최대 토큰 한계. 한계는 모델 유형에 따라 다릅니다.

### 선택적 매개변수

- **system** (문자열): 어시스턴트 동작을 정의하는 시스템 프롬프트
- **stream** (부울): 실시간 서버 전송 이벤트 전달 활성화 (기본값: false)

### 중요 제약사항

메시지는 교대로 나타나는 user/assistant 역할이 필요합니다. 이미지 입력은 기본64 인코딩과 유효한 `media_type` (jpeg, png, gif, webp)이 필요합니다. thinking, tool_choice, tools와 같은 스트리밍 기능은 Claude 3+을 요구합니다.

### 인증

```
Authorization: Bearer {api-key}
```
