import {Slide} from '../models';
import {useMemo, useState} from "preact/hooks";
import {JSX} from "preact/compat";
import {SlideDisplay} from "./SlideDisplay.tsx";
import {useResponsiveScale} from "../utils/useResponsiveScale.ts";
import {HStack, VStack} from "@znui/react";
import {CustomButton} from "../../components/CustomButton.tsx";

interface LecturePlayerProps {
    slides: Slide[]
    onFinish: () => void
    startFromSlide?: string
}

export const LecturePlayer = ({slides, startFromSlide, onFinish}: LecturePlayerProps) => {
    const firstSlide = useMemo(() => {
        const slideIndex = slides.findIndex(it => it.id === startFromSlide)
        if(slideIndex == -1) {
            return 0
        }

        return slideIndex
    }, [startFromSlide])

    const [currentSlideIndex, setCurrentSlideIndex] = useState(firstSlide);
    const scaledDimensions = useResponsiveScale();

    if (!slides || slides.length === 0) {
        return <p>No lesson data or slides available.</p>;
    }

    const currentSlide = slides[currentSlideIndex];

    const goToNextSlide = () => {
        if(currentSlideIndex === slides.length-1) {
            onFinish()
            return
        }

        setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
    };

    const goToPrevSlide = () => {
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
    };

    const playerWrapperStyle: JSX.CSSProperties = {
        //width: '100vw',
        //height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    };

    const lessonContentContainerStyle: JSX.CSSProperties = {
        width: `${scaledDimensions.width}px`,
        height: `${scaledDimensions.height}px`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    };

    return (
        <VStack style={playerWrapperStyle} userSelect="none" bg="white">
            {/* This container is scaled and centered */}
	    <div id="slides">
            <div style={lessonContentContainerStyle}>
                <SlideDisplay
                    slide={currentSlide}
                    scaleFactor={scaledDimensions.scaleFactor}
                    // Pass design dimensions for context if needed, though scaleFactor might be enough
                    // designWidth={DESIGN_WIDTH}
                    // designHeight={DESIGN_HEIGHT}
                />
            </div>
	    </div>

            {/* Navigation (Outside scaled area for responsiveness) */}
            <HStack justify="space-around" pos="fixed" bottom={24} gap={24} right={24}>
                <CustomButton variant="tonal" onClick={goToPrevSlide} disabled={currentSlideIndex === 0}>
                    Назад
                </CustomButton>

                <CustomButton onClick={goToNextSlide}>
                    {currentSlideIndex === slides.length - 1 ? "Закончить" : "Далее"}
                </CustomButton>
            </HStack>
        </VStack>
    );
};
