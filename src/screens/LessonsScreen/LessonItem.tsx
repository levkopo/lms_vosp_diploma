import {
    Body,
    Center,
    HStack,
    HTMLZnUIProps, IconWrapper, Tappable,
    ThemeTokens, Title, VStack,
    znui
} from "@znui/react";
import {LessonModel, LessonType} from "../../models/LessonModel.ts";
import {MdOutlinePlayLesson} from "react-icons/md";
import {FaRegStickyNote} from "react-icons/fa";
import {FaTrophy} from "react-icons/fa6";

export interface LessonItemProps extends HTMLZnUIProps<'div'> {
    lesson: LessonModel
}

const colors: Record<LessonType, [string, string, string]> = {
    'slides': [ThemeTokens.palettes.primary["60"], ThemeTokens.palettes.primary["50"], ThemeTokens.palettes.primary["40"]],
    'test': [ThemeTokens.palettes.tertiary["60"], ThemeTokens.palettes.tertiary["50"], ThemeTokens.palettes.tertiary["40"]],
    'final_test': ['#e0b407', '#856A00', '#856A00']
}

const icons = {
    'slides': MdOutlinePlayLesson,
    'test': FaRegStickyNote,
    'final_test': FaTrophy,
}

export const LessonItem = (props: LessonItemProps) => {
    const {
        lesson,
        ...rest
    } = props

    const [mainColor, bgColor, iconColor] = colors[lesson.type]
    const Icon = icons[lesson.type]

    return <HStack
        gap={24}
        align="center"
        as={Tappable}
        borderRadius={64}
        ph={8}
        pv={8}
        {...rest}
    >
        <Center
            to={{
                baseDuration: 100,
                mt: 0
            }}
            _focus={{
                mt: 8
            }}
            _active={{
                mt: 8
            }}
            bg={mainColor}
            c={iconColor}
            fontSize={48}
            shapeScale='full'
            layoutSize={72}
            minW={72}
            _hover={{
                mt: 2
            }}
            cursor="pointer"
        >
            <IconWrapper size={40}>
                <Icon/>
            </IconWrapper>
        </Center>

        <VStack pr={12}>
            <Title size="large">{lesson.title}</Title>
            <Body size="medium">{lesson.description}</Body>
        </VStack>
    </HStack>
}