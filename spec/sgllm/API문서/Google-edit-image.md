# Google 이미지 편집 API 문서

## 개요

이 API는 사용자 제공 이미지와 텍스트 프롬프트를 기반으로 기존 이미지 변환을 활성화합니다. 기능은 "배경 교체, 요소 삽입/제거, 스타일 변환"을 포함합니다.

## 핵심 정보

**SDK:** Google AI SDK

**지원되는 모델:** `imagen-3.0-capability-001`

**엔드포인트:** `POST /v1/api/google/models/edit-image`

## 인증

```
Authorization: Bearer {api-key}
```

## 필수 매개변수

- **model** (문자열): `imagen-3.0-capability-001`이어야 함
- **prompt** (문자열): 원하는 이미지 변경의 텍스트 설명
- **reference_images** (배열): 메타데이터가 포함된 안내 이미지

### 참조 이미지 유형

- `REFERENCE_TYPE_RAW`: 편집을 위한 기본 RGB 이미지 (요청당 최대 1개)
- `REFERENCE_TYPE_MASK`: 대상 편집을 위한 마스킹 레이어
- `REFERENCE_TYPE_CONTROL`: 방향 안내
- `REFERENCE_TYPE_STYLE`: 스타일 전이 참조
- `REFERENCE_TYPE_SUBJECT`: 주제 보존 참조

## 편집 모드

구성 객체는 여러 편집 방식을 지원합니다:

- `EDIT_MODE_DEFAULT`: 표준 생성
- `EDIT_MODE_BGSWAP`: 배경 교체
- `EDIT_MODE_INPAINT_INSERTION`: 새 요소 추가
- `EDIT_MODE_INPAINT_REMOVAL`: 요소 제거
- `EDIT_MODE_OUTPAINT`: 이미지 경계 확장
- `EDIT_MODE_STYLE`: 예술적 변환 적용
- `EDIT_MODE_PRODUCT_IMAGE`: 제품 최적화 처리

## 선택적 구성 매개변수

- **negative_prompt**: 제외할 요소
- **mask_mode**: 마스킹 전략 (배경/전경/의미)
- **edit_steps**: 샘플링 반복 (35-75 범위)
- **seed**: 결정론적 생성 값
- **aspect_ratio**: 출력 비율 (예: `1:1`)
- **output_mime_type**: 형식 지정 (JPEG/PNG/WebP)
