import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';

export type MarketingPromoProps = {
  headline: string;
  subheadline: string;
  ctaText: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  backgroundType: 'gradient' | 'solid' | 'animated';
};

export const MarketingPromo: React.FC<MarketingPromoProps> = ({
  headline,
  subheadline,
  ctaText,
  primaryColor,
  secondaryColor,
  backgroundType,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Background animation
  const backgroundProgress = interpolate(frame, [0, fps * 5], [0, 360], {
    extrapolateRight: 'extend',
  });

  // Headline animation - spring in
  const headlineSpring = spring({
    frame: frame - 15,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
      mass: 0.5,
    },
  });

  const headlineY = interpolate(headlineSpring, [0, 1], [100, 0]);
  const headlineOpacity = interpolate(headlineSpring, [0, 1], [0, 1]);

  // Subheadline animation
  const subheadlineSpring = spring({
    frame: frame - 30,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
      mass: 0.5,
    },
  });

  const subheadlineY = interpolate(subheadlineSpring, [0, 1], [50, 0]);
  const subheadlineOpacity = interpolate(subheadlineSpring, [0, 1], [0, 1]);

  // CTA animation
  const ctaSpring = spring({
    frame: frame - 60,
    fps,
    config: {
      damping: 10,
      stiffness: 80,
      mass: 0.8,
    },
  });

  const ctaScale = interpolate(ctaSpring, [0, 1], [0, 1]);
  const ctaOpacity = interpolate(ctaSpring, [0, 1], [0, 1]);

  // Pulse effect for CTA
  const pulseFrame = Math.max(0, frame - 90);
  const pulse = Math.sin(pulseFrame * 0.15) * 0.05 + 1;

  const getBackground = () => {
    if (backgroundType === 'gradient') {
      return `linear-gradient(${backgroundProgress}deg, ${primaryColor}, ${secondaryColor})`;
    }
    if (backgroundType === 'animated') {
      const shift = interpolate(frame, [0, fps * 5], [0, 100], {
        extrapolateRight: 'extend',
      });
      return `linear-gradient(135deg,
        ${primaryColor} ${shift}%,
        ${secondaryColor} ${shift + 50}%,
        ${primaryColor} ${shift + 100}%)`;
    }
    return primaryColor;
  };

  return (
    <AbsoluteFill
      style={{
        background: getBackground(),
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `${secondaryColor}33`,
          transform: `scale(${interpolate(frame, [0, fps], [0.5, 1.2], { extrapolateRight: 'clamp' })})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '5%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `${primaryColor}44`,
          transform: `scale(${interpolate(frame, [10, fps + 10], [0.3, 1], { extrapolateRight: 'clamp' })})`,
        }}
      />

      {/* Content container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 60px',
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        {/* Headline */}
        <h1
          style={{
            fontSize: Math.min(width * 0.08, 90),
            fontWeight: 800,
            color: '#FFFFFF',
            margin: 0,
            marginBottom: 30,
            transform: `translateY(${headlineY}px)`,
            opacity: headlineOpacity,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            lineHeight: 1.1,
          }}
        >
          {headline}
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontSize: Math.min(width * 0.035, 36),
            fontWeight: 400,
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            marginBottom: 60,
            transform: `translateY(${subheadlineY}px)`,
            opacity: subheadlineOpacity,
            maxWidth: '80%',
            lineHeight: 1.4,
          }}
        >
          {subheadline}
        </p>

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${ctaScale * pulse})`,
            opacity: ctaOpacity,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              color: primaryColor,
              padding: '24px 60px',
              borderRadius: 50,
              fontSize: 28,
              fontWeight: 700,
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              cursor: 'pointer',
            }}
          >
            {ctaText}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
