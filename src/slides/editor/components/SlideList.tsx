import {h} from 'preact';
import {Slide} from '../../models';
import {JSX} from 'preact/jsx-runtime';
import {Button, HStack, Layout, ThemeTokens, VStack, znui} from "@znui/react";
import {SlideDisplay} from "../../components/SlideDisplay.tsx";
import {DESIGN_ASPECT_RATIO, DESIGN_WIDTH} from "../../constants.ts";
import {useMemo} from "preact/hooks";

interface SlideListProps {
    slides: Slide[];
    selectedSlideId: string | null;
    onSelectSlide: (slideId: string) => void;
    onAddSlide: () => void;
    onDeleteSlide: (slideId: string) => void;
    // onReorderSlides: (newSlidesOrder: Slide[]) => void; // Для будущего drag-n-drop
}

interface SlideItemProps {
    slide: Slide
    index: number
    isSelected: boolean
    onSelectSlide: (slideId: string) => void
    onDeleteSlide: (slideId: string) => void
}

const SlideItem = ({
                       slide,
                       isSelected,
                       index,
                       onSelectSlide,
                       onDeleteSlide
                   }: SlideItemProps) => {
    const slidePreview = useMemo(() =>
        <SlideDisplay slide={slide} scaleFactor={(250 - 12 * 2) / DESIGN_WIDTH}/>, [slide])

    return useMemo(() => <VStack
        key={slide.id}
        bg={isSelected ? ThemeTokens.tertiaryContainer : ThemeTokens.surfaceContainerHighest}
        ph={12}
        pv={8}
        gap={12}
        shapeScale="sm"
        cursor="pointer"
        onClick={() => onSelectSlide(slide.id)}
    >
        <HStack>
            <znui.span fontWeight={600} flex={1}>{index + 1}. {`Слайд ${index + 1}`}</znui.span>

            <button
                style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ff4d4d',
                    cursor: 'pointer',
                    fontSize: '1.2em',
                    padding: '0 5px',
                }}
                onClick={(e) => {
                    e.stopPropagation(); // Предотвратить выбор слайда при удалении
                    if (confirm(`Вы уверены, что хотите удалить "Слайд ${index + 1}"?`)) {
                        onDeleteSlide(slide.id);
                    }
                }}
                title="Удалить слайд"
            >
                × {/* Символ крестика */}
            </button>
        </HStack>

        <Layout
            pos="relative"
            aspectRatio={DESIGN_ASPECT_RATIO}
            bg="white"
            overflow="hidden"
            shapeScale="sm"
            pointerEvents="none"
        >
            {slidePreview}
        </Layout>
    </VStack>, [slide, isSelected, slidePreview, onSelectSlide, onDeleteSlide])
}

export const SlideList = ({
                              slides,
                              selectedSlideId,
                              onSelectSlide,
                              onAddSlide,
                              onDeleteSlide
                          }: SlideListProps): JSX.Element => {
    return (
        <VStack pos="relative">
            <VStack
                pos="sticky"
                top={0}
                zIndex={1000}
            >
                <Button
                    onClick={onAddSlide}
                    mb={12}
                >
                    Добавить слайд
                </Button>
            </VStack>

            <VStack gap={8}>
                {slides.map((slide, index) => (
                    <SlideItem
                        slide={slide}
                        isSelected={selectedSlideId === slide.id}
                        index={index}
                        onSelectSlide={onSelectSlide}
                        onDeleteSlide={onDeleteSlide}
                    />
                ))}
            </VStack>
        </VStack>
    );
};
