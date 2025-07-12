import {createBrowserRouter} from "react-router";
import {LessonScreen, LessonsScreen, TitleScreen} from "./screens";
import {EditorApp} from "./slides/editor/EditorApp";
import {LoginScreen} from "./screens/LoginScreen/LoginScreen.tsx";
import {ScrollLayout, VStack} from "@znui/react";
import {useQuery} from "@tanstack/react-query";
import {LessonRepositoryImpl} from "./repositories/LessonRepository.ts";

const TextoLesson = (a: any) => {
    const { data: slides, error, isLoading } = useQuery({
        queryKey: ["lesson", "slides", a.lesson.id],
        queryFn: () => LessonRepositoryImpl.getSlides(a.lesson.id),
    })

    if(!slides) {
        return <div/>
    }

    return <VStack>
        {slides.map(it => <>
            {it.elements.map(it => {
                if(it.type == "text") {
                    return <div>
                        {it.content}
                    </div>
                }else if(it.type == "image") {
                    return <>
                        <img src={it.url} style={{width: 400}}/>
                        <div>Рисунок {it.caption}</div>
                    </>
                }

                return <></>
            })}
        </>)}
    </VStack>
}

const Texto = () => {
    const {data: lessons, error, isLoading} = useQuery({
        queryKey: ["lessons"],
        queryFn: () => LessonRepositoryImpl.getLessons(),
    })

    if(!lessons) {
        return <div/>
    }

    return <ScrollLayout>
        <VStack>
            {
                lessons.map(it => {
                    if(it.type === 'slides') {
                        return <TextoLesson lesson={it}/>
                    }

                    return <div/>
                })
            }
        </VStack>
    </ScrollLayout>
}

export const routes = createBrowserRouter([
    {
        path: "/",
        children: [
            {
                index: true,
                Component: TitleScreen
            },
            {
                path: "lessons",
                Component: LessonsScreen
            },
            {
                path: "lesson/:lessonId",
                Component: LessonScreen
            },
            {
                path: "editor",
                Component: EditorApp
            },
            {
                path: "login",
                Component: LoginScreen
            },
            {
                path: "text",
                Component: Texto
            },
        ],
    },
]);