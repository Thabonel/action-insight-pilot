import { Composition, Folder } from 'remotion';
import { MarketingPromo, MarketingPromoProps } from './compositions/MarketingPromo';
import { SocialMediaAd, SocialMediaAdProps } from './compositions/SocialMediaAd';
import { ProductShowcase, ProductShowcaseProps } from './compositions/ProductShowcase';
import { TextReveal, TextRevealProps } from './compositions/TextReveal';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Marketing">
        <Composition
          id="MarketingPromo"
          component={MarketingPromo}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            headline: 'Your Headline Here',
            subheadline: 'Add your compelling message',
            ctaText: 'Learn More',
            primaryColor: '#3B82F6',
            secondaryColor: '#8B5CF6',
            logoUrl: '',
            backgroundType: 'gradient',
          } satisfies MarketingPromoProps}
        />

        <Composition
          id="SocialMediaAd"
          component={SocialMediaAd}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            productName: 'Your Product',
            tagline: 'The perfect solution',
            features: ['Feature 1', 'Feature 2', 'Feature 3'],
            price: '$99',
            ctaText: 'Shop Now',
            primaryColor: '#10B981',
            imageUrl: '',
          } satisfies SocialMediaAdProps}
        />

        <Composition
          id="ProductShowcase"
          component={ProductShowcase}
          durationInFrames={240}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            productName: 'Amazing Product',
            description: 'Transform your experience with our innovative solution',
            features: [
              { title: 'Fast', description: 'Lightning quick performance' },
              { title: 'Reliable', description: 'Built to last' },
              { title: 'Beautiful', description: 'Stunning design' },
            ],
            primaryColor: '#6366F1',
            accentColor: '#F59E0B',
            imageUrl: '',
          } satisfies ProductShowcaseProps}
        />
      </Folder>

      <Folder name="Text Animations">
        <Composition
          id="TextReveal"
          component={TextReveal}
          durationInFrames={90}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            text: 'Your Message',
            fontSize: 80,
            color: '#FFFFFF',
            backgroundColor: '#1F2937',
            animationType: 'typewriter',
          } satisfies TextRevealProps}
        />
      </Folder>
    </>
  );
};
