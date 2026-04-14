# Google 이미지 생성 API 문서

## 개요

Google 이미지 생성 API는 Google의 Generative AI SDK를 사용하여 텍스트 프롬프트에서 자동 이미지 생성을 활성화합니다. `generate_images` 메서드는 구성 가능한 옵션으로 프로세스를 간소화합니다.

**SDK:** [Google AI SDK](https://googleapis.github.io/python-genai/index.html)

| API | 지원되는 모델 |
|-----|------------------|
| google/models/generate-images | `imagen-3.0-generate-002` |

---

## 이미지 생성 엔드포인트

**POST** `/v1/api/google/models/generate-images`

### 요청 헤더

```json
Authorization: Bearer {api-key}
```

---

## 매개변수

### `model` (문자열, 필수)
이미지 생성용 모델 식별자. 현재 지원: `imagen-3.0-generate-002`

### `prompt` (문자열, 필수)
원하는 이미지 콘텐츠를 지정하는 텍스트 설명입니다.

### `config` (객체, 선택)
이미지 생성용 구성 설정:

- **`number_of_images`** (정수): 생성할 이미지 수. 범위: 1-4 (기본값: 4)

- **`negative_prompt`** (문자열): 생성에서 제외할 요소로, 모델이 특정 객체나 미술 스타일을 피하도록 안내합니다.

- **`safety_filter_level`** (문자열): 콘텐츠 필터링 강도 옵션:
  - `BLOCK_LOW_AND_ABOVE`: 낮은 위험도 콘텐츠 이상 제한
  - `BLOCK_MEDIUM_AND_ABOVE`: 기본값; 중간 위험도 이상 차단
  - `BLOCK_ONLY_HIGH`: 높은 위험도 콘텐츠만 제한

- **`include_rai_reason`** (부울): 콘텐츠 차단 또는 수정 시 책임 있는 AI 설명 포함 (기본값: `false`). 최종 사용자에게 제한 사항을 전달할 때 유용합니다.

- **`output_mime_type`** (문자열): 이미지 인코딩 형식 (`image/png`, `image/jpeg`, `image/webp`). 투명 배경의 경우 PNG 또는 WebP 사용합니다.
