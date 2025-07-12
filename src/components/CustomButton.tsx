import {Button, ButtonProps} from "@znui/react";


export const CustomButton = (props: ButtonProps) => {
    const {
        ...rest
    } = props

    return <Button
        {...rest}
        size="medium"
        shape="square"
        pseudos={{
            "& label": {
                fontSize: 24,
                fontWeight: 600,
            }
        }}
    >

    </Button>
}