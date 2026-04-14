# OpenAI 메시지 생성 API 문서

## 개요

OpenAI 채팅 API 엔드포인트를 통해 개발자는 HTTP REST 인터페이스를 통해 GPT 기반 모델을 사용하여 대화형 응답을 생성할 수 있습니다.

**상태:** 이것은 하위 호환성을 위해 유지되는 레거시 엔드포인트입니다. 새로운 통합은 통합 제공자 지원을 위해 API Gateway를 사용해야 합니다.

## 핵심 정보

**API 엔드포인트:** `POST /v1/api/openai/chat/completions`

**인증:** 인증 헤더의 Bearer 토큰 필요

## 지원되는 모델

- gpt-5.1-chat-latest
- gpt-5.1
- gpt-5-chat-latest
- gpt-5
- gpt-5-mini
- accounts/fireworks/models/gpt-oss-120b
- grok-3-mini
- grok-4
- google/gemma-3-27b-it
- accounts/fireworks/models/llama4-scout-instruct-basic
- accounts/fireworks/models/llama4-maverick-instruct-basic
- sonar-pro
- sonar-reasoning-pro

## 요청 매개변수

### 필수 매개변수

**model** (문자열)
응답 생성에 사용할 모델을 지정합니다.

**messages** (배열)
대화 히스토리를 나타내는 배열입니다. 여러 메시지 유형을 지원합니다:

- **개발자 메시지:** 모델이 따라야 할 지침을 포함
  - `content` (문자열 | 배열): 지침 텍스트
  - `role`: "developer"
  - `name` (선택): 참여자 구분

- **사용자 메시지:** 사용자로부터의 입력
  - `content` (문자열 | 배열): 사용자 입력
  - `role`: "user"

- **어시스턴트 메시지:** 모델 생성 응답
  - `content` (문자열 | 배열): 생성된 텍스트
  - `role`: "assistant"

- **도구 메시지:** 도구 실행 결과
  - `content` (문자열 | 배열): 도구 출력
  - `role`: "tool"
  - `tool_call_id`: 관련 호출 식별

## 리소스

- **공식 문서:** [OpenAI 채팅 API 참조](https://platform.openai.com/docs/api-reference/chat)
- **SDK:** [OpenAI Python 라이브러리](https://github.com/openai/openai-python)
