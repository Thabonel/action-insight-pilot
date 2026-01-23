import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Img } from 'remotion';

export type SocialMediaAdProps = {
  productName: string;
  tagline: string;
  features: string[];
  price: string;
  ctaText: string;
  primaryColor: string;
  imageUrl: string;
};

export const SocialMediaAd: React.FC<SocialMediaAdProps> = ({
  productName,
  tagline,
  features,
  price,
  ctaText,
  primaryColor,
  imageUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Title animation
  const titleSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Feature stagger animation
  const getFeatureOpacity = (index: number) => {
    const delay = 30 + index * 15;
    return interpolate(frame, [delay, delay + 20], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };

  const getFeatureX = (index: number) => {
    const delay = 30 + index * 15;
    return interpolate(frame, [delay, delay + 20], [-30, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };

  // Price animation
  const priceSpring = spring({
    frame: frame - 90,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  // CTA animation
  const ctaSpring = spring({
    frame: frame - 120,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        background: '#FFFFFF',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Top colored section */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '45%',
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
        }}
      />

      {/* Product image placeholder */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: `translateX(-50%) scale(${titleSpring})`,
          width: width * 0.6,
          height: width * 0.6,
          background: imageUrl ? 'transparent' : `${primaryColor}22`,
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}
      >
        {imageUrl ? (
          <Img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 100, opacity: 0.3 }}>
            {productName.charAt(0)}
          </span>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          left: 0,
          right: 0,
          padding: '0 50px',
        }}
      >
        {/* Product name */}
        <h1
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: '#1F2937',
            margin: 0,
            marginBottom: 8,
            opacity: titleSpring,
          }}
        >
          {productName}
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: 24,
            color: '#6B7280',
            margin: 0,
            marginBottom: 30,
            opacity: titleSpring,
          }}
        >
          {tagline}
        </p>

        {/* Features */}
        <div style={{ marginBottom: 30 }}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
                opacity: getFeatureOpacity(index),
                transform: `translateX(${getFeatureX(index)}px)`,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
              <span style={{ fontSize: 20, color: '#374151' }}>{feature}</span>
            </div>
          ))}
        </div>

        {/* Price and CTA row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              transform: `scale(${priceSpring})`,
            }}
          >
            <span style={{ fontSize: 48, fontWeight: 800, color: primaryColor }}>
              {price}
            </span>
          </div>

          <div
            style={{
              background: primaryColor,
              color: '#FFFFFF',
              padding: '18px 40px',
              borderRadius: 50,
              fontSize: 22,
              fontWeight: 700,
              transform: `scale(${ctaSpring})`,
              boxShadow: `0 8px 30px ${primaryColor}66`,
            }}
          >
            {ctaText}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
