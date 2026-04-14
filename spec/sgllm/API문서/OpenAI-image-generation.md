# OpenAI 이미지 생성 API 문서

## 개요

OpenAI 이미지 생성 API는 텍스트 설명에서 이미지를 생성하는 REST 엔드포인트입니다. `gpt-image-1` 모델을 사용하여 다양한 크기와 형식의 이미지를 생성할 수 있으며, URL 또는 base64 인코딩 데이터로 결과를 받을 수 있습니다.

**핵심 리소스:**
- SDK: [OpenAI-python GitHub](https://github.com/openai/openai-python)
- 공식 문서: [이미지 API 참조](https://platform.openai.com/docs/api-reference/images/create)

## 지원되는 모델

| API | 모델 |
|-----|-------|
| `/v1/api/openai/images/generate` | `gpt-image-1` |

---

## 이미지 생성 엔드포인트

**POST** `/v1/api/openai/images/generate`

이 엔드포인트는 `gpt-image-1` 모델을 사용하여 텍스트 프롬프트를 기반으로 이미지를 생성합니다. 투명 배경 및 품질 제어를 포함한 여러 이미지 크기, 형식, 응답 유형을 지원합니다.

### 요청 헤더

```json
Authorization: Bearer {api-key}
```

### 매개변수

**`prompt`** (문자열, 필수)
- 원하는 이미지의 텍스트 설명입니다. `gpt-image-1`은 최대 32,000자를 허용합니다.

**`model`** (문자열)
- 사용할 이미지 생성 모델 (예: `gpt-image-1`)

**`size`** (문자열)
- 이미지 크기입니다. `gpt-image-1`의 경우: `1024x1024`, `1536x1024`, `1024x1536`, `auto`

**`n`** (정수)
- 생성할 이미지 수 (기본값: `1`)

---

*마지막 업데이트: 2025년 5월 2일*
