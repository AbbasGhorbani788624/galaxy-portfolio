import { useEffect, useRef, useState } from 'react';
import { useMobile } from '../contexts/MobileContext';
import { useSceneStore } from '../core/SceneManager';
import { SCENE_MANAGER } from '../config/config';
import GalaxyBirthdayText from './GalaxyBirthdayText';

export interface SceneText {
  header: string;
  sub: string;
  backgroundColor?: string; // background color for the text container
}

function SceneTextComponent() {
  const { currentScene, sceneZoomed } = useSceneStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useMobile();

  // calculate responsive font sizes
  const headerSize = isMobile ? '32px' : '48px';
  const subSize = isMobile ? '18px' : '24px';
  const topPosition = isMobile ? '20px' : '30px';

  // get scene text based on current scene
  const getSceneText = () => {
    switch (currentScene) {
      case 'galaxy':
        return {
          header: 'Happy birthday, Queen of Wonderland!',
          sub: "I'm happy to be in the same galaxy as you."
        };
  
      case 'solarSystemApproach':
        return {
          header: 'Somewhere in the Universe',
          sub: "Out of all these stars, somehow our paths crossed."
        };
  
      case 'solarSystemRotation':
        return {
          header: 'Our Little Corner',
          sub: "Two people, one tiny corner of an endless universe."
        };
  
      case 'earthApproach':
        return {
          header: 'A Little Blue Planet',
          sub: "And here we are, sharing the same beautiful world."
        };
  
      case 'earth':
        return {
          header: 'Earth',
          sub: "Maybe the universe is enormous, but some connections make it feel small."
        };
  
      case 'continent':
        return {
          header: 'Europe',
          sub: "One of my wishes is to see you build a beautiful life somewhere here."
        };
  
      case 'city':
        return {
          header: 'Germany',
          sub: "A place where your dreams, your work, and your future can have room to grow."
        };
  
      case 'district':
        return {
          header: 'Hannover',
          sub: "A good city, a peaceful life, and a place to create something of your own."
        };
  
      case 'room':
        return {
          header: 'A Place to Call Home',
          sub: "And maybe someday, a beautiful little home filled with dreams, laughter, and everything you love."
        };
  
      default:
        return null;
    }
  };
  
  const [localText, setLocalText] = useState<SceneText | null>(getSceneText());

  useEffect(() => {
    // remove text when last scene zoomed in (cant properly see the device's content)
    if (SCENE_MANAGER.SCENE_ORDER.indexOf(currentScene) === SCENE_MANAGER.SCENE_ORDER.length - 1 && sceneZoomed === 'in') {
      setLocalText(null);
      return
    }

    const sceneText = getSceneText();
    if (sceneText?.header == localText?.header && sceneText?.sub == localText?.sub) return;

    if (sceneText) {
      setLocalText(sceneText);
    } else if (localText) { // when parent clears overlayText, clear localText.
      setLocalText(null)
    }
  }, [currentScene, sceneZoomed]);

  if (currentScene === 'galaxy' && localText) {
    return <GalaxyBirthdayText sub={localText.sub} isMobile={isMobile} />;
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: topPosition,
        left: 0,
        right: 0,
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 100,
        opacity: 1,
        backgroundColor: localText?.backgroundColor,
        padding: isMobile ? '0 15px' : '0',
      }}
    >
      <div style={{ fontFamily: 'Tektur-Medium', fontSize: headerSize, color: 'white' }}>
        {localText?.header}
      </div>
      <div style={{ fontFamily: 'Tektur-Regular', fontSize: subSize, color: 'white' }}>
        {localText?.sub}
      </div>
    </div>
  );
}

export default SceneTextComponent;