'use client';

import { useState, useRef, useEffect, useCallback, FormEvent, KeyboardEvent, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Resize (if needed) and re-encode an image on the client so we stay under
// Anthropic's 5MB/이미지 limit while keeping decent quality.
async function resizeAndEncode(
  file: File
): Promise<{ data: string; mediaType: string }> {
  const MAX_DIM = 2000; // longest side in pixels
  const MAX_BYTES = 4.5 * 1024 * 1024; // stay safely below the 5MB API limit

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('이미지 로드 실패'));
      el.src = objectUrl;
    });

    // Calculate target dimensions (preserve aspect ratio)
    let { width, height } = img;
    const longest = Math.max(width, height);
    if (longest > MAX_DIM) {
      const scale = MAX_DIM / longest;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');
    ctx.drawImage(img, 0, 0, width, height);

    // Progressively lower JPEG quality until the result fits under MAX_BYTES
    let quality = 0.92;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    // base64 size ≈ bytes * 4/3, so bytes ≈ length * 3/4
    while ((dataUrl.length * 3) / 4 > MAX_BYTES && quality > 0.4) {
      quality = Math.max(0.4, quality - 0.1);
      dataUrl = canvas.toDataURL('image/jpeg', quality);
    }

    const commaIdx = dataUrl.indexOf(',');
    const data = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
    return { data, mediaType: 'image/jpeg' };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// 검색 결과 더미 데이터 (design_reference 참고)
const MOCK_RESULTS = [
  {
    siteName: '유니의 공부방 파이프리',
    siteUrl: 'https://sumniya.tistory.com',
    urlPath: '› entry › 분류성능평가지표',
    title: '분류성능평가지표 - Precision(정밀도), Recall(재현율)',
    description:
      '2016. 11. 6. — 데이터분석의 모델이나 패턴의 분석 성능 평가에 사용된다. 정밀도와 다르게 실제 정답(true label)이 positive인 것 중에서 ...',
    favIcon: 'T',
    favColor: '#ff9800',
  },
  {
    siteName: 'Google for Developers',
    siteUrl: 'https://developers.google.com',
    urlPath: '› machine-learning › crash-course › acc...',
    title: 'Classification: Accuracy, recall, precision, and related metrics',
    description:
      '2025. 1. 12. — Precision consists of all positive classifications, not all actual positives. The formula for precision is T P T P + F P.',
    favIcon: 'G',
    favColor: '#4285f4',
  },
  {
    siteName: '티스토리',
    siteUrl: 'https://light-tree.tistory.com',
    urlPath: '› ...',
    title: '딥러닝 용어 정리, Recall, Precision, Average precision(AP) 개…',
    description:
      '2019. 5. 17. — Precision은 단 한개의 검출된 결과물을 가져와도 해당 물체(classification)가 정확한지 아닌지에 대한 측정 지표이며 ...',
    favIcon: 'T',
    favColor: '#ff5722',
  },
  {
    siteName: 'Medium',
    siteUrl: 'https://medium.com',
    urlPath: '› @mohitsethi_86128 › understanding...',
    title: 'Understanding Precision and Recall in Deep Learning',
    description:
      '2023. 8. 15. — In deep learning classification tasks, precision and recall are two fundamental metrics used to evaluate model performance …',
    favIcon: 'M',
    favColor: '#000000',
  },
  {
    siteName: 'Towards Data Science',
    siteUrl: 'https://towardsdatascience.com',
    urlPath: '› precision-vs-recall-386cf9f89488',
    title: 'Precision vs Recall — A Comprehensive Guide',
    description:
      'Precision and recall are two evaluation metrics for classification. Learn when to use each and how they complement each other …',
    favIcon: 'T',
    favColor: '#1976d2',
  },
  {
    siteName: 'Wikipedia',
    siteUrl: 'https://ko.wikipedia.org',
    urlPath: '› wiki › 정밀도와_재현율',
    title: '정밀도와 재현율 - 위키백과, 우리 모두의 백과사전',
    description:
      '패턴 인식, 정보 검색과 분류에서 정밀도(precision)는 참인 결과의 분수이고, 재현율(recall, sensitivity)은 전체 참인 결과 중 올바르게 식별된 …',
    favIcon: 'W',
    favColor: '#000000',
  },
  {
    siteName: '네이버 블로그',
    siteUrl: 'https://blog.naver.com',
    urlPath: '› mldl_studyroom › 222...',
    title: '[딥러닝] Precision, Recall, F1-score 쉽게 이해하기',
    description:
      '2021. 7. 22. — 분류 모델의 성능을 평가하는 대표적인 지표인 Precision과 Recall을 그림과 함께 설명합니다. 두 지표는 서로 …',
    favIcon: 'N',
    favColor: '#03c75a',
  },
  {
    siteName: 'Kaggle',
    siteUrl: 'https://www.kaggle.com',
    urlPath: '› discussions › getting-started › 211436',
    title: 'Understanding Precision, Recall, and Accuracy in Deep Learning',
    description:
      'A clear explanation of how precision, recall, and accuracy relate to model performance, with practical tips for imbalanced datasets and …',
    favIcon: 'K',
    favColor: '#20beff',
  },
  {
    siteName: 'Analytics Vidhya',
    siteUrl: 'https://www.analyticsvidhya.com',
    urlPath: '› blog › 2020 › 09 › precision-recall...',
    title: 'Precision and Recall | Essential Metrics for Machine Learning',
    description:
      '2020. 9. 9. — Learn everything about precision and recall, why they matter in imbalanced classification, and how to calculate them from a confusion matrix …',
    favIcon: 'A',
    favColor: '#f26522',
  },
  {
    siteName: '벨로그',
    siteUrl: 'https://velog.io',
    urlPath: '› @sangyeon217 › precision-recall',
    title: 'Precision, Recall, F1-Score 완벽 정리 - velog',
    description:
      '2022. 4. 10. — 모델이 예측한 결과 중 실제로 맞춘 비율(Precision)과 실제 정답 중에서 모델이 맞게 예측한 비율(Recall)의 의미와 차이를 …',
    favIcon: 'V',
    favColor: '#20c997',
  },
  {
    siteName: 'GitHub',
    siteUrl: 'https://github.com',
    urlPath: '› topics › precision-recall',
    title: 'precision-recall · GitHub Topics',
    description:
      'Open-source projects and code repositories focused on precision, recall, and evaluation metrics for classification and object detection models …',
    favIcon: 'G',
    favColor: '#24292e',
  },
  {
    siteName: 'ResearchGate',
    siteUrl: 'https://www.researchgate.net',
    urlPath: '› publication › Deep-Learning-Metrics',
    title: 'Evaluation Metrics for Deep Learning Classification Models',
    description:
      'This paper reviews precision, recall, F1-score, mAP, and ROC-AUC in the context of modern deep learning architectures, including CNNs and …',
    favIcon: 'R',
    favColor: '#00ccbb',
  },
];

const VIDEO_RESULTS = [
  {
    title: 'How Accurate Is My Model?: Accuracy, Precision, Recall, F1 …',
    channel: 'YouTube · LYNNit',
    date: '2020. 12. 31.',
    thumbColor: '#263238',
    duration: '4:11',
  },
  {
    title: 'Precision and Recall in Machine Learning',
    channel: 'YouTube · RoBoRow',
    date: '2022. 3. 4.',
    thumbColor: '#1a237e',
    duration: '12:05',
  },
  {
    title: 'Precision, Recall, F1 score, True Positive|Deep Learning …',
    channel: 'YouTube · codebasics',
    date: '2020. 9. 9.',
    thumbColor: '#b71c1c',
    duration: '15:24',
  },
];

export default function Home() {
  const [query, setQuery] = useState('deep learning precision');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageData, setImageData] = useState<string | null>(null); // base64 (no prefix)
  const [imageType, setImageType] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // data: URL for <img>
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = useCallback(async (file: File) => {
    // Generous soft limit to avoid hanging the browser on huge files
    if (file.size > 30 * 1024 * 1024) {
      setError('이미지가 너무 큽니다 (30MB 초과).');
      return;
    }

    try {
      const { data, mediaType } = await resizeAndEncode(file);
      setImageData(data);
      setImageType(mediaType);
      setImagePreview(`data:${mediaType};base64,${data}`);
      setError('');
    } catch {
      setError('이미지를 처리하는 중 오류가 발생했습니다.');
    }
  }, []);

  async function onFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    await handleImageFile(file);
  }

  // Paste-to-upload: detect image data on the clipboard anywhere on the page
  useEffect(() => {
    async function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault(); // only block default when we actually have an image
            await handleImageFile(file);
            return;
          }
        }
      }
      // No image found -> let the default paste (text, etc.) proceed normally
    }

    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [handleImageFile]);

  function clearImage() {
    setImageData(null);
    setImageType(null);
    setImagePreview(null);
  }

  async function runSearch(q: string) {
    const trimmed = q.trim();
    // Need either text or image
    if (!trimmed && !imageData) return;
    const prevAnswer = answer; // 직전 턴 답변을 비우기 전에 포착
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed || undefined,
          image: imageData || undefined,
          imageType: imageType || undefined,
          previousAnswer: prevAnswer || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setAnswer(data.answer || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function onFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    runSearch(query);
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch(query);
    }
  }

  const showAnswer = loading || answer || error;

  return (
    <div
      style={{
        background: '#fff',
        color: '#202124',
        fontFamily: 'arial, sans-serif',
        minHeight: '100vh',
      }}
    >
      {/* ===== STICKY TOP BAR (header + filter tabs) ===== */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
      {/* ===== HEADER ===== */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 28px 0',
          gap: '24px',
        }}
      >
        {/* Google Logo */}
        <div style={{ display: 'flex', alignItems: 'center', minWidth: '92px' }}>
          <span style={{ fontSize: '28px', fontFamily: 'arial, sans-serif', letterSpacing: '-1px' }}>
            <span style={{ color: '#4285f4' }}>G</span>
            <span style={{ color: '#ea4335' }}>o</span>
            <span style={{ color: '#fbbc04' }}>o</span>
            <span style={{ color: '#4285f4' }}>g</span>
            <span style={{ color: '#34a853' }}>l</span>
            <span style={{ color: '#ea4335' }}>e</span>
          </span>
        </div>

        {/* Search Box */}
        <form
          onSubmit={onFormSubmit}
          style={{
            flex: '1',
            maxWidth: '692px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '44px',
              border: '1px solid #dfe1e5',
              borderRadius: '24px',
              padding: '0 14px',
              boxShadow: '0 1px 6px rgba(32,33,36,0.08)',
              background: '#fff',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#9aa0a6" style={{ marginRight: '12px' }}>
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                color: '#202124',
                background: 'transparent',
              }}
              aria-label="search"
            />
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                color: '#70757a',
                fontSize: '18px',
              }}
              aria-label="clear"
            >
              ✕
            </button>
            <div style={{ width: '1px', height: '20px', background: '#dfe1e5', margin: '0 8px' }} />
            {/* mic icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" style={{ margin: '0 8px', cursor: 'pointer' }}>
              <path fill="#4285f4" d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
              <path fill="#34a853" d="M11 18.92V22h2v-3.08A7 7 0 0 0 19 12h-2a5 5 0 1 1-10 0H5a7 7 0 0 0 6 6.92z" />
            </svg>
            {/* camera icon - triggers file input */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                margin: '0 4px',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="이미지 업로드"
              title="이미지 업로드"
            >
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M4 6h3l2-2h6l2 2h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                <circle cx="12" cy="13" r="3.2" fill="#fff" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={onFileSelected}
              style={{ display: 'none' }}
            />
            {/* search button */}
            <button
              type="submit"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                marginLeft: '4px',
              }}
              aria-label="search"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#4285f4">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>

          {/* Image preview (below the search bar) */}
          {imagePreview && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 14px',
                background: '#f1f3f4',
                borderRadius: '12px',
                alignSelf: 'flex-start',
              }}
            >
              <img
                src={imagePreview}
                alt="업로드된 이미지"
                style={{
                  width: '48px',
                  height: '48px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                }}
              />
              <span style={{ fontSize: '13px', color: '#3c4043' }}>
                이미지 첨부됨
              </span>
              <button
                type="button"
                onClick={clearImage}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#5f6368',
                  fontSize: '16px',
                  lineHeight: 1,
                  padding: '4px 6px',
                }}
                aria-label="이미지 제거"
                title="이미지 제거"
              >
                ✕
              </button>
            </div>
          )}
        </form>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          <button
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#5f6368',
            }}
            aria-label="apps"
          >
            ⋮⋮
          </button>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#1a73e8',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            J
          </div>
        </div>
      </header>

      {/* ===== FILTER TABS ===== */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 28px 0 152px',
          gap: '4px',
          borderBottom: '1px solid #ebebeb',
          fontSize: '14px',
          color: '#5f6368',
          overflowX: 'auto',
        }}
      >
        {[
          { label: '전체', active: true },
          { label: '이미지' },
          { label: '동영상' },
          { label: '쇼핑' },
          { label: '뉴스' },
          { label: '지도' },
          { label: '도서' },
          { label: '더보기' },
        ].map((tab) => (
          <div
            key={tab.label}
            style={{
              padding: '12px 14px',
              borderBottom: tab.active ? '3px solid #1a73e8' : '3px solid transparent',
              color: tab.active ? '#1a73e8' : '#5f6368',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: tab.active ? 500 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {tab.label}
          </div>
        ))}
        <div style={{ marginLeft: 'auto', padding: '12px 14px', cursor: 'pointer' }}>도구</div>
      </nav>
      </div>
      {/* ===== END STICKY TOP BAR ===== */}

      {/* ===== MAIN RESULTS ===== */}
      <main style={{ padding: '20px 28px 20px 152px', maxWidth: '720px' }}>
        {/* result stats */}
        <div style={{ fontSize: '12px', color: '#70757a', marginBottom: '18px' }}>
          검색결과 약 1,230,000개 (0.42초)
        </div>

        {/* Result list */}
        {MOCK_RESULTS.map((r, i) => (
          <article key={i} style={{ marginBottom: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: r.favColor,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {r.favIcon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                <span style={{ fontSize: '14px', color: '#202124' }}>{r.siteName}</span>
                <span style={{ fontSize: '12px', color: '#4d5156' }}>
                  {r.siteUrl} <span style={{ color: '#70757a' }}>{r.urlPath}</span>
                </span>
              </div>
              <span style={{ marginLeft: 'auto', color: '#70757a', cursor: 'pointer', fontSize: '18px' }}>⋮</span>
            </div>
            <h3 style={{ margin: '0 0 4px 0', fontWeight: 400 }}>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  color: '#1a0dab',
                  fontSize: '20px',
                  textDecoration: 'none',
                  lineHeight: 1.3,
                }}
              >
                {r.title}
              </a>
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: '#4d5156',
                lineHeight: 1.58,
              }}
            >
              {r.description}
            </p>
          </article>
        ))}

        {/* ===== VIDEO SECTION ===== */}
        <section style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 16px 0', color: '#202124' }}>
            동영상
          </h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {VIDEO_RESULTS.map((v, i) => (
              <div
                key={i}
                style={{
                  width: '210px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '118px',
                    background: v.thumbColor,
                    borderRadius: '8px',
                    position: 'relative',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <span style={{ opacity: 0.5 }}>▶</span>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '6px',
                      right: '6px',
                      background: 'rgba(0,0,0,0.75)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}
                  >
                    {v.duration}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: '#202124', fontWeight: 500, lineHeight: 1.3, marginBottom: '4px' }}>
                  {v.title}
                </div>
                <div style={{ fontSize: '12px', color: '#70757a' }}>
                  {v.channel}
                  <br />
                  {v.date}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== ANSWER SECTION (appears at the bottom after search) ===== */}
        {showAnswer && (
          <section
            style={{
              marginTop: '36px',
              paddingTop: '24px',
              borderTop: '1px solid #ebebeb',
            }}
          >
            {loading && (
              <div style={{ fontSize: '14px', color: '#70757a', padding: '8px 0' }}>
                검색 중...
              </div>
            )}

            {error && (
              <div style={{ fontSize: '14px', color: '#c5221f', padding: '8px 0' }}>
                오류: {error}
              </div>
            )}

            {answer && (
              <div className="answer-markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
              </div>
            )}
          </section>
        )}
      </main>

      {/* ===== FOOTER ===== */}
      <footer style={{ marginTop: '40px', background: '#f2f2f2', borderTop: '1px solid #dadce0' }}>
        <div style={{ padding: '14px 28px', fontSize: '14px', color: '#70757a', borderBottom: '1px solid #dadce0' }}>
          대한민국
        </div>
        <div
          style={{
            padding: '14px 28px',
            display: 'flex',
            gap: '28px',
            flexWrap: 'wrap',
            fontSize: '14px',
            color: '#70757a',
          }}
        >
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#70757a', textDecoration: 'none' }}>
            정보
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#70757a', textDecoration: 'none' }}>
            광고
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#70757a', textDecoration: 'none' }}>
            비즈니스
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#70757a', textDecoration: 'none' }}>
            검색의 원리
          </a>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '28px' }}>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#70757a', textDecoration: 'none' }}>
              개인정보처리방침
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#70757a', textDecoration: 'none' }}>
              약관
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#70757a', textDecoration: 'none' }}>
              설정
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
