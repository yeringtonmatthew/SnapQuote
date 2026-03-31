import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'SnapQuote';
  const subtitle =
    searchParams.get('subtitle') || 'AI-Powered Quotes for Contractors';
  const amount = searchParams.get('amount');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        }}
      >
        {/* Top: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '-0.02em',
            }}
          >
            SnapQuote
          </span>
        </div>

        {/* Center: Title, Subtitle, Amount */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: '16px',
          }}
        >
          {amount && (
            <div
              style={{
                fontSize: '96px',
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {amount}
            </div>
          )}
          <div
            style={{
              fontSize: amount ? '36px' : '56px',
              fontWeight: 700,
              color: 'white',
              textAlign: 'center',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: amount ? '22px' : '28px',
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              lineHeight: 1.4,
              maxWidth: '800px',
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Bottom: tagline */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            snapquote.dev
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
