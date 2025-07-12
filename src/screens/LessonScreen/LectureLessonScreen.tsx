import {BaseLessonProps} from "./BaseLessonProps.ts";
import {LecturePlayer} from "../../slides/components/LecturePlayer.tsx";
import {useQuery} from "@tanstack/react-query";
import {LessonRepositoryImpl} from "../../repositories/LessonRepository.ts";
import {AbsoluteCenter, CircularProgressIndicator, Layout} from "@znui/react";
import {Navigate, useNavigate} from "react-router";


export const LectureLessonScreen = (props: BaseLessonProps) => {
    const navigate = useNavigate()
    const { data: slides, error, isLoading } = useQuery({
        queryKey: ["lesson", "slides", props.lesson.id],
        queryFn: () => LessonRepositoryImpl.getSlides(props.lesson.id),
    })

    if (isLoading) {
        return <Layout pos="fixed" posA={0}>
            <AbsoluteCenter>
                <CircularProgressIndicator/>
            </AbsoluteCenter>
        </Layout>
    }

    if(slides) {
        return <LecturePlayer
            slides={slides}
            onFinish={() => {
                LessonRepositoryImpl.markLessonAsCompleted(props.lesson.id)
                    .then(() => {
                        navigate(-1)
                    })
            }}
        />
    }

    alert(error)
    return <>
        <Navigate to="/lessons"/>
    </>
}