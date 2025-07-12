import {
    Body, CoordinatorLayout, GridLayout,
    HStack, Layout, ScrollLayout,
    ThemeTokens, Title, VerticalDivider,
    VStack, AbsoluteCenter, CircularProgressIndicator, Modal, useModal, ModalDialogInterface
} from "@znui/react";
import {LessonItem} from "./LessonItem.tsx";
import {useState} from 'preact/hooks'
import {Navigate, useNavigate} from "react-router";
import {LessonRepositoryImpl} from "../../repositories/LessonRepository.ts";
import {useQuery} from "@tanstack/react-query";
import {useKonamiCode} from "../../utils/useKonamiCode.ts";
import {StudentRepositoryImpl} from "../../repositories/StudentRepository.ts";
import {Toolbar, ToolbarButton} from "../../components/Toolbar.tsx";
import {MdClose, MdHelpOutline} from "react-icons/md";
import {LessonType} from "../../models/LessonModel.ts";

const HelpModal = (props: ModalDialogInterface) => {
    return <Modal
        title="Помощь"
        navigationIcon={<MdClose/>}
        navigationIconOnClick={props.close}
    >
        <div>Курс состоит из 3 типов занятий:</div>
        <VStack style={{zoom: 0.8}} pointerEvents="none">
            <LessonItem lesson={{
                id: "_",
                title: "Лекция",
                description: "Слайды с интерактивными элементами",
                type: "slides",
                preview_image: "string",
            }}/>
            <LessonItem lesson={{
                id: "_",
                title: "Тестирование",
                description: "Состоит из 5 вопросов и служит для проверки знаний по предыдущей лекции",
                type: "test",
                preview_image: "string",
            }}/>
            <LessonItem lesson={{
                id: "_",
                title: "Финальное тестирование",
                description: "Содержит 2 вопроса из каждой темы курса и служит для финальной проверки знаний",
                type: "final_test",
                preview_image: "string",
            }}/>
        </VStack>
        <div>
            Каждое занятие открывается постепенно, после прохождения предыдущего занятия.
            Если вы прошли тестирование на оценку 2, следующее занятие не откроется, пока вы не пройдете на удовлетворительную оценку.
        </div>
        <div>
            Каждый тест можно проходить заново, но имейте ввиду что сохранится оценка последнего прохождения.
            Т.е. если вы прошли первый раз на 4, а потом на 2, то будет оценка 2 за тест.
        </div>
    </Modal>
}

export const LessonsScreen = () => {
    const navigate = useNavigate()
    const help = useModal(HelpModal)
    const [isDebug, setIsDebug] = useState(false)
    const {data: lessons, error, isLoading} = useQuery({
        queryKey: ["lessons"],
        queryFn: () => LessonRepositoryImpl.getLessons(),
    })

    const {data: student, error: studentError, isLoading: isStudentLoading} = useQuery({
        queryKey: ["student"],
        queryFn: () => StudentRepositoryImpl.getCurrentStudent(),
        refetchInterval: 5000
    })

    useKonamiCode(['h', 'e', 's', 'o', 'y', 'a', 'm'], () => {
        navigate("/editor")
    }, {timeout: 1500});

    useKonamiCode(['a', 'e', 'z', 'a', 'k', 'm', 'i'], () => {
        setIsDebug(it => !it)
    }, {timeout: 1500});

    if (isLoading || isStudentLoading) {
        return <AbsoluteCenter>
            <CircularProgressIndicator/>
        </AbsoluteCenter>
    }

    if (!student) {
        return <Navigate to="/login"/>
    }

    if (lessons) {
        const isLegendaryGroup = student.group === '123'
        let nextLessonIndex = lessons.findIndex(it => !student.completed_lessons.includes(it.id))
        nextLessonIndex = nextLessonIndex == -1 ? lessons.length : nextLessonIndex

        const courseIsCompleted = nextLessonIndex - 1 == lessons.findIndex(it => it.type === "final_test")

        return <CoordinatorLayout h='100vh' align="center" overflow='hidden' userSelect="none">
            {help.modal}
            <VStack w='100%'>
                <Toolbar
                    w='100%'
                    leading={
                        <ToolbarButton onClick={help.open}>
                            <MdHelpOutline/>
                        </ToolbarButton>
                    }
                />

                <HStack w='100%'>
                    <VStack
                        mt={12}
                        w={720}
                        h={140}
                        bg={
                            isLegendaryGroup ? 'linear-gradient(315deg,rgba(207, 160, 19, 1) 0%, rgba(237, 185, 28, 1) 100%)'
                                : ThemeTokens.palettes.primary["50"]
                        }
                        c={
                            isLegendaryGroup ? '#634D08'
                                : 'white'
                        }
                        mh="auto"
                        shapeScale="lg"
                        zIndex={1000}
                    >
                        <HStack
                            ph={32}
                            pv={18}
                            flex={1}
                            align="center"
                        >
                            <VStack flex={1}>
                                <Title size="large" fontWeight={600}>
                                    Пассивные и активные компоненты ВОСП
                                </Title>
                                <Body size="large" fontWeight={500}>
                                    {isLegendaryGroup ? 'Легендарная группа' : 'Группа'}: {student.group}
                                </Body>
                                <Body size="large" fontWeight={500}>
                                    Студент: {student.last_name} {student.first_name}
                                </Body>
                            </VStack>
                            {student.preliminary_assessment && <>
                                <VerticalDivider mh={18}/>
                                <VStack align="center" justify="center" maxW={105} minW={105}>
                                    <Layout fontSize={12} lineHeight={1.4} textAlign='center' fontWeight={500}>
                                        {courseIsCompleted ? "Оценка" : "Предварительная оценка"}
                                    </Layout>
                                    <Layout fontSize={64} lineHeight={1.1} fontWeight={500} mt={4}>
                                        {student.preliminary_assessment}
                                    </Layout>
                                </VStack>
                            </>}
                        </HStack>

                    </VStack>
                </HStack>
            </VStack>

            <ScrollLayout h="100%" pt={152 + 64}>
                <VStack>
                    <GridLayout mh="auto" pb={152 + 64 + 64} pt={14} align="center">
                        {lessons.map((it, index) =>
                            <LessonItem
                                key={it.id}
                                lesson={it}
                                maxW={720}
                                filter={index <= nextLessonIndex || isDebug ? "auto" : "grayscale(1)"}
                                oc={index <= nextLessonIndex || isDebug ? 1 : 0.5}
                                pointerEvents={index <= nextLessonIndex || isDebug ? "all" : "none"}
                                onClick={() => navigate("/lesson/" + it.id)}
                            />
                        )}
                    </GridLayout>
                </VStack>
            </ScrollLayout>
        </CoordinatorLayout>
    }

    console.log(error, studentError)
    return <>
        <Navigate to="/"/>
    </>
}
