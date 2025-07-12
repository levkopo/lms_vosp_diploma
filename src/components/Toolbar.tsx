import {HStack, HTMLZnUIProps, IconWrapper, Spacer, Tappable} from "@znui/react";
import { exit } from '@tauri-apps/plugin-process';
import {MdClose} from "react-icons/md";
import {ReactNode} from "react";

export interface ToolbarButtonProps extends HTMLZnUIProps<'div'> {}

export const ToolbarButton = (props: ToolbarButtonProps) => {
    const {
        children,
        ...rest
    } = props

    return <HStack
        w={82}
        h={64}
        justify="center"
        align="center"
        as={Tappable}
        {...rest}
    >
        <IconWrapper size={32}>
            {children}
        </IconWrapper>
    </HStack>
}

export interface ToolbarProps extends HTMLZnUIProps<'div'> {
    leading?: ReactNode
}
export const Toolbar = (
    props: ToolbarProps
) => {
    const {
        leading,
        children,
        ...rest
    } = props

    return <HStack
        {...rest}
        zIndex={1000}
    >
        {leading}
        <Spacer/>
        <HStack>
            <ToolbarButton onClick={() => exit(0)}>
                <MdClose/>
            </ToolbarButton>
        </HStack>
    </HStack>
}