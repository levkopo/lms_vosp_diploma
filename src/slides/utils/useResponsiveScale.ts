import { useState, useEffect } from 'preact/hooks';
import { DESIGN_WIDTH, DESIGN_HEIGHT, DESIGN_ASPECT_RATIO } from '../constants.ts';

interface ScaledDimensions {
    width: number;
    height: number;
    scaleFactor: number;
    offsetX: number;
    offsetY: number;
}

export const useResponsiveScale = (): ScaledDimensions => {
    const [dimensions, setDimensions] = useState<ScaledDimensions>({
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        scaleFactor: 1,
        offsetX: 0,
        offsetY: 0,
    });

    useEffect(() => {
        const calculateDimensions = () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const windowAspectRatio = windowWidth / windowHeight;

            let newWidth: number;
            let newHeight: number;

            if (windowAspectRatio > DESIGN_ASPECT_RATIO) {
                newHeight = windowHeight;
                newWidth = newHeight * DESIGN_ASPECT_RATIO;
            } else {
                newWidth = windowWidth;
                newHeight = newWidth / DESIGN_ASPECT_RATIO;
            }

            const newScaleFactor = newWidth / DESIGN_WIDTH;
            const newOffsetX = (windowWidth - newWidth) / 2;
            const newOffsetY = (windowHeight - newHeight) / 2;

            setDimensions({
                width: Math.round(newWidth),
                height: Math.round(newHeight),
                scaleFactor: newScaleFactor,
                offsetX: Math.round(newOffsetX),
                offsetY: Math.round(newOffsetY),
            });
        };

        calculateDimensions();
        window.addEventListener('resize', calculateDimensions);
        window.addEventListener('orientationchange', calculateDimensions);

        return () => {
            window.removeEventListener('resize', calculateDimensions);
            window.removeEventListener('orientationchange', calculateDimensions);
        };
    }, []);

    return dimensions;
};