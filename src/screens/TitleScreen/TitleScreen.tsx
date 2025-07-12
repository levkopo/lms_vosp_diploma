import {AbsoluteCenter, Body, Display, Headline, Layout, ThemeTokens, Title, VStack} from "@znui/react";
import {useNavigate} from "react-router";
import {useEffect, useState} from "preact/hooks";
import {UrTISIBanner} from "../../resources/UrTISIBanner.tsx";
import {Cable} from "../../resources/Cable.tsx";
import {Toolbar} from "../../components/Toolbar.tsx";
import {h} from "preact";

export const TitleScreen = () => {
    const navigate = useNavigate()
    const [stage, setStage] = useState(0)

    useEffect(() => {
        setStage(0)
        const interval = setInterval(() => {
            setStage(stage => stage + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [setStage]);

    useEffect(() => {
        if (stage >= 7) {
            navigate("/login")
        }
    }, [navigate, stage]);

    return <VStack
        flex={1}
        bg={ThemeTokens.palettes.primary["30"]}
        c="white"
        overflow="none"
    >
        <Toolbar
            c="white"
            pos="fixed"
            top={0}
            left={0}
            w="100vw"
        />

        <UrTISIBanner
            pos="absolute"
            left="50%"
            transform="translate(-50%, -50%)"
            to={{
                baseTransition: ThemeTokens.motion.physics.expressive.spatial.slow,
                baseDuration: 1000,
                oc: stage >= 1 ? 1 : 0,
                top: stage >= 2 ? 190 : '50%',
                h: stage >= 2 ? 80 : 160,
            }}
        />

        <VStack
            to={{
                oc: stage >= 6 ? 0 : 1
            }}
        >
            <AbsoluteCenter>
                <Display
                    to={{
                        baseTransition: ThemeTokens.motion.physics.expressive.effects.fast,
                        baseDuration: 1000,
                        oc: stage >= 3 ? 1 : 0,
                    }}
                    textAlign="center"
                >
                    Пассивные и активные оптические компоненты ВОСП
                </Display>
            </AbsoluteCenter>

            <Cable
                w={150}
                transform="rotate(-45deg)"
                pos="absolute"
                to={{
                    baseDuration: 1000,
                    right: {
                        transition: ThemeTokens.motion.physics.expressive.spatial.slow,
                        duration: 1000,
                        value: stage >= 3 ? -50: -500
                    },
                    bottom: {
                        transition: ThemeTokens.motion.physics.expressive.spatial.slow,
                        duration: 1000,
                        value: stage >= 3 ? -400: -600
                    },
                }}
            />

            <Title
                pos='fixed'
                transform="translateX(-50%)"
                left="50%"
                to={{
                    baseDuration: 1000,
                    bottom: {
                        transition: ThemeTokens.motion.physics.expressive.spatial.slow,
                        duration: 1000,
                        value: stage >= 4 ? 24 : "-100%",
                    },
                    oc: stage >= 4 ? 1 : 0,
                }}
            >
                Екатеринбург 2025 г.
            </Title>

            <Layout
                textAlign="start"
                pos="fixed"
                bottom="30vh"
                to={{
                    baseDuration: 1000,
                    left: {
                        transition: ThemeTokens.motion.physics.expressive.spatial.slow,
                        duration: 1000,
                        value: stage >= 4 ? 24 : "-100%",
                    },
                    oc: stage >= 4 ? 1 : 0,
                }}
            >
                <Body size="large">
                    Выполнил Копорушкин Л.Н.
                </Body>
                <Body size="large">
                    под руководительством Пермякова Е.Б.
                </Body>
            </Layout>
        </VStack>
    </VStack>
}