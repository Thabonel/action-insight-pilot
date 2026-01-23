import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';

export type TextRevealProps = {
  text: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  animationType: 'typewriter' | 'fade' | 'slide' | 'scale' | 'word-by-word';
};

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  fontSize,
  color,
  backgroundColor,
  animationType,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Typewriter effect
  const renderTypewriter = () => {
    const charsPerSecond = 20;
    const visibleChars = Math.floor((frame / fps) * charsPerSecond);
    const displayText = text.slice(0, Math.min(visibleChars, text.length));

    // Cursor blink
    const showCursor = Math.floor(frame / 15) % 2 === 0;
    const cursorOpacity = visibleChars < text.length || showCursor ? 1 : 0;

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span>{displayText}</span>
        <span
          style={{
            opacity: cursorOpacity,
            marginLeft: 4,
            width: 4,
            height: fontSize * 0.8,
            background: color,
          }}
        />
      </div>
    );
  };

  // Fade effect
  const renderFade = () => {
    const opacity = interpolate(frame, [0, fps], [0, 1], {
      extrapolateRight: 'clamp',
    });

    return <span style={{ opacity }}>{text}</span>;
  };

  // Slide effect
  const renderSlide = () => {
    const slideSpring = spring({
      frame,
      fps,
      config: { damping: 15, stiffness: 100, mass: 0.5 },
    });

    const y = interpolate(slideSpring, [0, 1], [100, 0]);
    const opacity = interpolate(slideSpring, [0, 1], [0, 1]);

    return (
      <span style={{ transform: `translateY(${y}px)`, opacity, display: 'inline-block' }}>
        {text}
      </span>
    );
  };

  // Scale effect
  const renderScale = () => {
    const scaleSpring = spring({
      frame,
      fps,
      config: { damping: 10, stiffness: 80 },
    });

    const scale = interpolate(scaleSpring, [0, 1], [0, 1]);
    const opacity = interpolate(scaleSpring, [0, 1], [0, 1]);

    return (
      <span
        style={{
          transform: `scale(${scale})`,
          opacity,
          display: 'inline-block',
        }}
      >
        {text}
      </span>
    );
  };

  // Word by word effect
  const renderWordByWord = () => {
    const words = text.split(' ');
    const wordsPerSecond = 3;
    const visibleWords = Math.floor((frame / fps) * wordsPerSecond);

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.3em' }}>
        {words.map((word, index) => {
          const isVisible = index < visibleWords;
          const wordFrame = (index / wordsPerSecond) * fps;
          const wordSpring = spring({
            frame: frame - wordFrame,
            fps,
            config: { damping: 12, stiffness: 100 },
          });

          const scale = isVisible ? interpolate(wordSpring, [0, 1], [0.5, 1]) : 0;
          const opacity = isVisible ? interpolate(wordSpring, [0, 1], [0, 1]) : 0;

          return (
            <span
              key={index}
              style={{
                transform: `scale(${scale})`,
                opacity,
                display: 'inline-block',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    );
  };

  const renderText = () => {
    switch (animationType) {
      case 'typewriter':
        return renderTypewriter();
      case 'fade':
        return renderFade();
      case 'slide':
        return renderSlide();
      case 'scale':
        return renderScale();
      case 'word-by-word':
        return renderWordByWord();
      default:
        return <span>{text}</span>;
    }
  };

  return (
    <AbsoluteFill
      style={{
        background: backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          fontSize,
          fontWeight: 700,
          color,
          textAlign: 'center',
          padding: '0 60px',
          lineHeight: 1.2,
        }}
      >
        {renderText()}
      </div>
    </AbsoluteFill>
  );
};
