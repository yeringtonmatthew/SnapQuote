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
          background: 'linear-gradient(135deg, #2E7BFF 0%, #1a5fd4 100%)',
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
              height="46"
              viewBox="0 0 58 96"
              fill="none"
            >
              <polygon
                points="34,0 0,52 22,52 18,96 58,38 34,38 34,0"
                fill="white"
              />
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
