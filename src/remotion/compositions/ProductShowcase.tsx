import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Img } from 'remotion';

type Feature = {
  title: string;
  description: string;
};

export type ProductShowcaseProps = {
  productName: string;
  description: string;
  features: Feature[];
  primaryColor: string;
  accentColor: string;
  imageUrl: string;
};

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  productName,
  description,
  features,
  primaryColor,
  accentColor,
  imageUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timing
  const featuresStart = fps * 2;
  const featureDuration = fps * 2; // 2 seconds per feature

  // Intro animations
  const introOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const introScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Product name reveal
  const nameReveal = interpolate(frame, [10, 40], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Description fade
  const descOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Feature animations
  const getFeatureVisibility = (index: number) => {
    const start = featuresStart + index * featureDuration;
    const end = start + featureDuration;
    const isCurrent = frame >= start && frame < end;

    const opacity = interpolate(
      frame,
      [start, start + 15, end - 15, end],
      [0, 1, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const x = interpolate(
      frame,
      [start, start + 20],
      [50, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return { opacity, x, isCurrent };
  };

  // Progress indicator
  const currentFeatureIndex = Math.floor((frame - featuresStart) / featureDuration);
  const clampedIndex = Math.max(0, Math.min(currentFeatureIndex, features.length - 1));

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${primaryColor}11 0%, ${accentColor}11 100%)`,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Left side - Product */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
        }}
      >
        {/* Product image */}
        <div
          style={{
            width: '100%',
            aspectRatio: '1',
            background: imageUrl ? 'transparent' : `linear-gradient(135deg, ${primaryColor}22, ${accentColor}22)`,
            borderRadius: 30,
            marginBottom: 40,
            transform: `scale(${introScale})`,
            opacity: introOpacity,
            boxShadow: '0 30px 80px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {imageUrl ? (
            <Img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 150, opacity: 0.2, color: primaryColor }}>
              {productName.charAt(0)}
            </span>
          )}
        </div>

        {/* Product name with reveal */}
        <div style={{ overflow: 'hidden' }}>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#1F2937',
              margin: 0,
              marginBottom: 16,
              clipPath: `inset(0 ${100 - nameReveal}% 0 0)`,
            }}
          >
            {productName}
          </h1>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: 24,
            color: '#6B7280',
            margin: 0,
            lineHeight: 1.5,
            opacity: descOpacity,
          }}
        >
          {description}
        </p>
      </div>

      {/* Right side - Features */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '50%',
          height: '100%',
          background: primaryColor,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
        }}
      >
        {/* Feature cards */}
        {features.map((feature, index) => {
          const { opacity, x } = getFeatureVisibility(index);

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: '50%',
                left: 80,
                right: 80,
                transform: `translateY(-50%) translateX(${x}px)`,
                opacity,
              }}
            >
              {/* Feature number */}
              <div
                style={{
                  fontSize: 120,
                  fontWeight: 900,
                  color: accentColor,
                  opacity: 0.3,
                  marginBottom: -30,
                }}
              >
                0{index + 1}
              </div>

              {/* Feature title */}
              <h2
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: 0,
                  marginBottom: 20,
                }}
              >
                {feature.title}
              </h2>

              {/* Feature description */}
              <p
                style={{
                  fontSize: 24,
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {feature.description}
              </p>
            </div>
          );
        })}

        {/* Progress dots */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 80,
            display: 'flex',
            gap: 12,
          }}
        >
          {features.map((_, index) => (
            <div
              key={index}
              style={{
                width: clampedIndex === index ? 40 : 12,
                height: 12,
                borderRadius: 6,
                background: clampedIndex === index ? accentColor : 'rgba(255,255,255,0.3)',
                transition: 'width 0.3s',
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
