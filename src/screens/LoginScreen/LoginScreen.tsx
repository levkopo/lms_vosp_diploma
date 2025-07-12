import {AbsoluteCenter, Button, Divider, HStack, Layout, TextField, ThemeTokens, VStack, znui} from "@znui/react";
import {Formik, FormikProps} from "formik";
import {h} from "preact";
import {StudentRepositoryImpl} from "../../repositories/StudentRepository.ts";
import {useNavigate} from "react-router";
import {UrTISIBanner} from "../../resources/UrTISIBanner.tsx";
import {useEffect, useState} from "preact/hooks";
import {Toolbar} from "../../components/Toolbar.tsx";

interface AuthFormValues {
    lastName: string,
    firstName: string,
    group: string
}

const initialValues: AuthFormValues = {
    lastName: '',
    firstName: '',
    group: ''
};

export const LoginScreen = () => {
    const navigate = useNavigate()
    const [shownForm, setShownForm] = useState(false)

    useEffect(() => {
        setShownForm(false)
        const timeout = setTimeout(() => {
            setShownForm(true)
        }, 1000)

        return () => clearTimeout(timeout)
    }, [setShownForm]);

    return <Layout
        bg={ThemeTokens.palettes.primary["30"]}
        overflow="none"
        flex={1}
    >
        <Toolbar
            c="white"
            pos="fixed"
            top={0}
            left={0}
            w="100vw"
        />

        <HStack justify="center">
            <UrTISIBanner
                h={80}
                pos="absolute"
                top={150}
            />
        </HStack>

        <Formik
            initialValues={initialValues}
            validate={(values) => {
                const errors: Partial<AuthFormValues> = {};
                if (!values.lastName) {
                    errors.lastName = "Необходимо ввести фамилию"
                }

                if (!values.firstName) {
                    errors.firstName = "Необходимо ввести имя"
                }

                if (!values.group) {
                    errors.group = "Необходимо ввести группу"
                }

                return errors
            }}
            onSubmit={(values, {setSubmitting}) => {
                console.log(values)
                StudentRepositoryImpl.authorizeStudent(
                    values.lastName,
                    values.firstName,
                    values.group,
                )
                    .then(() => {
                        navigate("/lessons")
                        setSubmitting(false);
                    })
                    .finally(() => {
                        setSubmitting(false);
                    })
            }}
        >
            {
                ({
                     values,
                     errors,
                     touched,
                     handleChange,
                     handleBlur,
                     handleSubmit,
                     isSubmitting,
                 }: FormikProps<AuthFormValues>) => (
                    <AbsoluteCenter to={{
                        baseDuration: 1000,
                        oc: shownForm ? 1: 0
                    }}>
                        <znui.form onSubmit={handleSubmit} minW={300} bg={ThemeTokens.background} pv={24} ph={32} shapeScale="lg">
                            <VStack>
                                <TextField
                                    label="Фамилия"
                                    variant="filled"
                                    name="lastName"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.lastName}
                                    error={errors.lastName && touched.lastName && errors.lastName}
                                />


                                <TextField
                                    label="Имя"
                                    variant="filled"
                                    name="firstName"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.firstName}
                                    error={errors.firstName && touched.firstName && errors.firstName}
                                />

                                <Divider mt={12} mb={7}/>

                                <TextField
                                    label="Группа"
                                    variant="filled"
                                    name="group"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.group}
                                    error={errors.group && touched.group && errors.group}
                                />

                                <Button as="input" size="medium" mt={18} type="submit" disabled={isSubmitting}>
                                    Войти
                                </Button>
                            </VStack>
                        </znui.form>
                    </AbsoluteCenter>
                )
            }
        </Formik>
    </Layout>
}