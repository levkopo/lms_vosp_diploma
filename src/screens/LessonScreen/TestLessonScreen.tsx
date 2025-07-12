import {
    AbsoluteCenter, Body,
    Button,
    CircularProgressIndicator, GridLayout,
    Headline,
    HStack, Divider,
    ThemeTokens,
    Title,
    VStack, IconWrapper, Display, ScrollLayout, Layout
} from "@znui/react";
import {BaseLessonProps} from "./BaseLessonProps.ts";
import {useQuery} from "@tanstack/react-query";
import {TestRepositoryImpl} from "../../repositories/TestRepository.ts";
import {useCallback, useState} from "preact/hooks";
import {CustomButton} from "../../components/CustomButton.tsx";
import {MdDone, MdClose} from "react-icons/md";
import {Navigate, useNavigate} from "react-router";
import {useKonamiCode} from "../../utils/useKonamiCode.ts";

export interface AnswerProps {
    answer: string;
    isSelected: boolean;
    onSelect: () => void;
}

export const Answer = (props: AnswerProps) => {
    const {
        answer,
        isSelected,
        onSelect,
    } = props;

    return <VStack
        cursor="pointer"
        alignItems="center"
        minH={[90, undefined, 120]}
        justifyContent="center"
        fontSize={[18, undefined, 20]}
        lineHeight={1}
        ph={[16, undefined, 32]}
        pv={[8, undefined, 16]}
        textAlign="center"
        pos="relative"
        onClick={onSelect}
        boxSizing="border-box"
    >
        <Layout
            pos="absolute"
            posA={0}
            borderStyle="solid"
            borderRadius={16}
            to={{
                borderColor: isSelected ? ThemeTokens.primary : ThemeTokens.outlineVariant,
                borderWidth: isSelected ? 6 : 4,
            }}
        />
        {answer}
    </VStack>
}

export const TestLessonScreen = (props: BaseLessonProps) => {
    const navigate = useNavigate();
    const [questionIndex, setQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answersControlState, setAnswersControlState] = useState<true | boolean[] | null>(null);
    const [answers, setAnswers] = useState<number[]>([]);
    const [grade, setGrade] = useState<string | null>(null);
    const {data: test, error, isLoading} = useQuery({
        queryKey: ["test", props.lesson.id],
        queryFn: () => TestRepositoryImpl.getTestByLessonId(props.lesson.id),
    })

    const selectQuestion = useCallback((index: number) => {
        setSelectedAnswer(answers[index])
        setQuestionIndex(index)
    }, [setQuestionIndex, setSelectedAnswer, answers])

    const nextQuestion = useCallback(() => {
        if (selectedAnswer == null) {
            return
        }

        setAnswers((prevAnswers) => {
            const answers = prevAnswers
            answers[questionIndex] = selectedAnswer
            return answers
        });

        if (answers[questionIndex + 1] != null) {
            setQuestionIndex(test?.questions?.length!!)
        } else {
            setQuestionIndex(questionIndex + 1)
        }

        setSelectedAnswer(null)
    }, [setQuestionIndex, setSelectedAnswer, setAnswers, answers, selectedAnswer, test])

    const submitAnswers = useCallback((answers: number[]) => {
        setAnswersControlState(true)

        TestRepositoryImpl.submitAnswers(props.lesson.id, answers)
            .then(results => {
                console.log(results)
                const temporaryResults = []
                for (const result of results) {
                    temporaryResults.push(result)

                    const temporaryResultsCopy = [...temporaryResults]
                    setTimeout(() => {
                        setAnswersControlState(temporaryResultsCopy)
                    }, 500 * temporaryResultsCopy.length)
                }

                setTimeout(() => {
                    const preGrade = (results.reduce((acc, result) => acc + (result ? 1 : 0), 0) / results.length) * 5
                    setGrade((preGrade < 2 ? 2 : preGrade).toFixed(0))
                }, 500 * temporaryResults.length + 1000)
            })
            .catch((err) => {
                alert(err)
                setAnswersControlState(null)
            })
    }, [setAnswersControlState, setGrade])

    const submitSelectedAnswers = useCallback(() => {
        submitAnswers(answers)
    }, [answers, setAnswersControlState, setGrade])

    useKonamiCode(['s', 'z', 'c', 'm', 'a', 'w', 'o'], () => {
        setAnswers(test.questions.map(it => it.answers[0].id))
        setQuestionIndex(test?.questions?.length!!)
        setAnswersControlState(true)

        submitAnswers(test.questions.map(it => it.answers[0].id))
    }, {timeout: 1500});

    useKonamiCode(['b', 'a', 'g', 'u', 'v', 'i', 'x'], () => {
        setAnswers(test.questions.map(it => it.answers[0].id))
        setQuestionIndex(test?.questions?.length!!)
        setAnswersControlState(true)

        submitAnswers(test.questions.map(_ => 532))
    }, {timeout: 1500});

    if (isLoading) {
        return <Layout pos="fixed" posA={0}>
            <AbsoluteCenter>
                <CircularProgressIndicator/>
            </AbsoluteCenter>
        </Layout>
    }

    if (test) {
        if (test.questions.length <= questionIndex) {
            const gradeDescritions = grade != null && {
                "5": ["Так держать!"],
                "4": ["Молодец"],
                "3": [""],
                "2": ["Попробуй в следующий раз"],
            }[grade]

            const gradeColors = grade != null && {
                "5": ['#6e5904', '#e6bc13', '#e6bc13', '#6e5904'],
                "4": [ThemeTokens.tertiary, ThemeTokens.onTertiary, ThemeTokens.tertiaryContainer, ThemeTokens.onTertiaryContainer],
                "3": [ThemeTokens.primary, ThemeTokens.onPrimary, ThemeTokens.primaryContainer, ThemeTokens.onPrimaryContainer],
                "2": [ThemeTokens.error, ThemeTokens.onError, ThemeTokens.errorContainer, ThemeTokens.onErrorContainer],
            }[grade]


            return <VStack h='100vh' maxW={620} w="100vw" overflow='hidden' userSelect="none">
                <VStack mv={24} ph={16}>
                    <VStack>
                        <Headline size={['small', undefined, 'medium']}>Проверьте ваши ответы</Headline>
                    </VStack>
                </VStack>

                <VStack pos="fixed" posA={0} zIndex={10} pointerEvents={
                    grade != null ? "all" : "none"
                }>
                    <Layout
                        pos="absolute"
                        posA={0}
                        bg="black"
                        to={{
                            baseDuration: 200,
                            oc: grade != null ? 0.3 : 0,
                            backdropFilter: grade != null ? "blur(12px)" : "blur(0px)",
                        }}
                    />

                    <Layout
                        pos="absolute"
                        left="50%"
                        top="50%"
                        transform="translate(-50%, -50%)"
                        bg={gradeColors && gradeColors[2]}
                        to={{
                            baseDuration: 1500,
                            layoutSize: grade != null ? "150vmax" : 0,
                            borderRadius: grade != null ? "150vmax" : 0,
                        }}
                    />

                    <Layout pos="relative" h="100%" w="100%" c={gradeColors && gradeColors[3]}>
                        <AbsoluteCenter>
                            <VStack alignItems="center" textAlign="center"
                                    to={{
                                        baseDuration: 1800,
                                        oc: grade != null ? 1 : 0
                                    }}
                            >
                                <Display mb={12}>
                                    ВАША ОЦЕНКА
                                </Display>

                                <Display c={gradeColors && gradeColors[0]} fontWeight={700} mb={24}>
                                    {grade}
                                </Display>

                                <Title fontWeight={700} mb={24}>
                                    {gradeDescritions && gradeDescritions.at(Math.random() * gradeDescritions.length)}
                                </Title>

                                <CustomButton
                                    onClick={() => {
                                        navigate("/lessons")
                                    }}
                                    bg={gradeColors && gradeColors[0]}
                                    c={gradeColors && gradeColors[1]}
                                >
                                    Продолжить
                                </CustomButton>
                            </VStack>
                        </AbsoluteCenter>
                    </Layout>
                </VStack>

                <ScrollLayout flex={1}>
                    <VStack>
                        {test.questions.map((item, index) =>
                            <VStack pv={12} ph={16} key={index}>
                                <HStack>
                                    <VStack flex={1}>
                                        <Title>
                                            {item.question}
                                        </Title>

                                        <Body mt={4}>
                                            {item.answers.find(it => it.id == answers[index])!!.text}
                                        </Body>
                                    </VStack>

                                    <VStack justify="center" pos="relative">
                                        {
                                            answersControlState != null && answersControlState != true && answersControlState[index] != undefined &&
                                            <VStack
                                                right={0}
                                                bg={answersControlState[index] ? ThemeTokens.tertiaryContainer : ThemeTokens.errorContainer}
                                                c={answersControlState[index] ? ThemeTokens.tertiary : ThemeTokens.onErrorContainer}
                                                layoutSize={40}
                                                borderStyle="solid"
                                                borderRadius={40}
                                                borderWidth={0}
                                                pos="absolute"
                                                justify="center"
                                                align="center"
                                            >
                                                <IconWrapper size={24}>
                                                    {
                                                        answersControlState[index] ? <MdDone/> : <MdClose/>
                                                    }
                                                </IconWrapper>
                                            </VStack>
                                        }

                                        <Button
                                            variant="tonal"
                                            onClick={() => {
                                                if (answersControlState == null) {
                                                    selectQuestion(index)
                                                }
                                            }}
                                            loading={answersControlState != null}
                                            overflow="hidden"
                                            to={{
                                                oc: answersControlState != null && answersControlState != true && answersControlState[index] != undefined ? 0 : 1,
                                            }}>
                                            Изменить ответ
                                        </Button>
                                    </VStack>
                                </HStack>

                                {index != test.questions.length - 1 && <Divider mt={12}/>}
                            </VStack>
                        )}
                    </VStack>
                </ScrollLayout>

                <HStack mb={26} ph={16} justify="space-between">
                    <CustomButton
                        flex={1}
                        disabled={answersControlState !== null}
                        bg={ThemeTokens.tertiary}
                        onClick={submitSelectedAnswers}
                    >
                        Закончить
                    </CustomButton>
                </HStack>
            </VStack>
        }

        const currentQuestion = test.questions[questionIndex];

        return <VStack h='100vh' maxW={620} w="100vw" overflow='hidden' userSelect="none">
            <VStack mh={24} flex={1}>
                <VStack align="center" mv={24}>
                    <VStack>
                        <Headline size={['small', undefined, 'medium']}
                                  textAlign="center">{currentQuestion.question}</Headline>
                    </VStack>
                </VStack>

                <VStack flex={1} mt={24}>
                    <GridLayout columns={[1, undefined, 2]} gap={8}>
                        {
                            currentQuestion.answers.map((answer, index) => {
                                return <Answer
                                    key={index}
                                    answer={answer.text}
                                    isSelected={selectedAnswer == answer.id}
                                    onSelect={() => {
                                        setSelectedAnswer(answer.id);
                                    }}/>
                            })
                        }
                    </GridLayout>
                </VStack>

                <HStack mb={26} justify="space-between">
                    <CustomButton
                        flex={1}
                        disabled={selectedAnswer == null}
                        bg={ThemeTokens.primary}
                        onClick={nextQuestion}
                    >
                        Вперед
                    </CustomButton>
                </HStack>
            </VStack>
        </VStack>
    }

    alert(error)

    return <>
        <Navigate to="/lessons"/>
    </>
}