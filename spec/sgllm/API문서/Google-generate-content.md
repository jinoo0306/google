# Google 콘텐츠 생성 API 문서

## 개요

Google Generative AI API는 텍스트 기반 프롬프트를 처리하고 생성 완료 후 단일 객체로 완전한 모델 응답을 반환합니다. "전체 응답은 생성이 완료된 후 반환되므로 구조화된 응답 처리 및 배치 처리 환경에 적합하며" 스트리밍 시나리오가 아닙니다.

## 지원되는 모델

| API 엔드포인트 | 모델 |
|---|---|
| `/v1/api/google/models/generate-content` | `gemini-3-pro-preview`, `gemini-2.5-flash`, `gemini-2.5-pro` |

## 주요 기능

- **비스트리밍 응답**: 전체 결과를 한 번에 반환
- **단일 응답 객체**: 명확한 구조화된 완료 형식
- **최적용**: 콘텐츠 생성, 자동화, 안정적인 배치 처리
- **관련 리소스**: 
  - [Google SDK](https://googleapis.github.io/python-genai/index.html)
  - [공식 API 문서](https://ai.google.dev/api/generate-content?hl=ko)

## 요청 요구사항

**헤더:**
```
Authorization: Bearer {api-key}
```

**주요 매개변수:**
- `model` (필수): 생성용 모델 이름
- `contents[]` (필수): 선택적 다중 턴 히스토리가 포함된 대화 콘텐츠
- `config`: 생성 설정 (온도, topP, topK, maxOutputTokens 등)
- `tools[]`: 모델이 호출할 수 있는 사용 가능한 함수
- `safetySettings[]`: 해로운 범주별 콘텐츠 필터링
- `systemInstruction`: 개발자 정의 지침 텍스트

## 구성 옵션

`config` 객체는 다음을 지원합니다:
- 출력 무작위성을 위한 온도 (0.0-2.0)
- 핵 샘플링 매개변수
- 토큰 한계 및 중지 시퀀스
- 응답 형식 지정 (JSON, 일반 텍스트)
- 해로운 콘텐츠 범주에 대한 안전 한계

**참고:** 스트리밍 응답의 경우 `/models/generate-content-stream` 엔드포인트를 사용합니다.
