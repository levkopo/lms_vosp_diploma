import {AbsoluteCenter, CircularProgressIndicator, Layout, TopAppBar, useAlerts, VStack} from "@znui/react";
import {MdClose, MdArrowBackIosNew} from "react-icons/md";
import {useQuery} from "@tanstack/react-query";
import {LessonRepositoryImpl} from "../../repositories/LessonRepository.ts";
import {Navigate, useNavigate, useParams} from "react-router";
import {TestLessonScreen} from "./TestLessonScreen.tsx";
import {LectureLessonScreen} from "./LectureLessonScreen.tsx";
import {Toolbar, ToolbarButton} from "../../components/Toolbar.tsx";
import {h} from "preact";

const LessonComponents = {
    'slides': LectureLessonScreen,
    'test': TestLessonScreen,
    'final_test': TestLessonScreen,
}

export const LessonScreen = () => {
    const {lessonId} = useParams();
    const navigate = useNavigate();
    const {alerts, openAlert} = useAlerts()
    const {data: lesson, error, isLoading} = useQuery({
        queryKey: ["lesson", lessonId],
        queryFn: () => LessonRepositoryImpl.getLessonById(lessonId!!),
    })


    if (isLoading) {
        return <Layout pos="fixed" posA={0}>
            <AbsoluteCenter>
                <CircularProgressIndicator/>
            </AbsoluteCenter>
        </Layout>
    }

    if (lesson) {
        const LessonComponent = LessonComponents[lesson.type]

        return <VStack h='100vh' w="100vw" align="center" overflow='hidden'>
            {alerts}

            <ToolbarButton
                pos="fixed"
                top={0}
                left={0}
                zIndex={10000}
                onClick={() => {
                    openAlert({
                        title: "Вы уверены что хотите выйти?",
                        description: "Прогресс будет утерян",
                        actions: [
                            {
                                title: "Отмена",
                                onClick: () => {
                                    return true
                                }
                            },
                            {
                                title: "Выйти",
                                onClick: () => {
                                    navigate(-1)
                                    return true
                                }
                            }
                        ]
                    })
                }}
            >
                <MdArrowBackIosNew/>
            </ToolbarButton>


            <LessonComponent lesson={lesson!!}/>
        </VStack>
    }


    return <VStack>
        <Navigate to="/lessons"/>
    </VStack>
}
