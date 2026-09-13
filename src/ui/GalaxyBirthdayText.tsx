import { useMemo } from 'react';
import styles from './GalaxyBirthdayText.module.css';

interface GalaxyBirthdayTextProps {
  sub: string;
  isMobile: boolean;
}

const PRETITLE_WORDS = ['Happy', 'birthday,'];
const QUEEN_WORDS = ['Queen', 'of', 'Wonderland!'];

function GalaxyBirthdayText({ sub, isMobile }: GalaxyBirthdayTextProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: `${-4 + ((i * 23) % 108)}%`,
        top: `${-8 + ((i * 17) % 96)}%`,
        size: 1 + (i % 2),
        delay: `${((i * 0.41) % 3).toFixed(2)}s`,
        duration: `${2 + (i % 3) * 0.7}s`,
      })),
    []
  );

  return (
    <div
      className={styles.container}
      style={{ ['--top' as string]: isMobile ? '20px' : '30px' }}
      aria-live="polite"
    >
      <div className={styles.textWrap}>
        <div className={styles.glow} aria-hidden="true" />

        <div className={styles.stars} aria-hidden="true">
          {stars.map((star) => (
            <span
              key={star.id}
              className={styles.star}
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                ['--delay' as string]: star.delay,
                ['--duration' as string]: star.duration,
              }}
            />
          ))}
        </div>

        <span className={styles.spark} style={{ top: '20%', left: '8%' }} aria-hidden="true" />

        <div className={styles.content}>
          <header className={styles.headerBlock}>
            <span className={styles.crown} aria-hidden="true">✦</span>

            <span className={styles.pretitle}>
              {PRETITLE_WORDS.map((word, index) => (
                <span
                  key={word}
                  className={styles.word}
                  style={{ ['--delay' as string]: `${0.25 + index * 0.12}s` }}
                >
                  {word}
                </span>
              ))}
            </span>

            <span className={styles.titleLine}>
              {QUEEN_WORDS.map((word, index) => (
                <span
                  key={word}
                  className={styles.queenWord}
                  style={{ ['--delay' as string]: `${0.75 + index * 0.14}s` }}
                >
                  <span className={styles.queenGradient}>{word}</span>
                </span>
              ))}
            </span>
          </header>

          <p className={styles.sub}>
            <span className={styles.subAccent}>{sub}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default GalaxyBirthdayText;
