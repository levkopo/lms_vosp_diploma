import {TableElement, InputValues} from "../../models";
import {GridLayout, HStack, Layout, ThemeTokens, VStack} from "@znui/react";
import {JSX} from "react";
import {scaleCssValue} from "../../utils/styleUtils.ts";

interface TableElementDisplay {
    element: TableElement;
    inputValues: InputValues;
    scaleFactor: number
}

export const TableElementDisplay = ({element, inputValues, scaleFactor}: TableElementDisplay) => {
    const {header, rows} = element

    const columns = header.length

    const textStyle: JSX.CSSProperties = {
        fontSize: scaleCssValue('16px', scaleFactor),
        lineHeight: 1.2,
    };

    const rowPadding = scaleCssValue('12px', scaleFactor)
    const borderRadius = scaleCssValue('16px', scaleFactor)

    return <VStack
        borderWidth={1}
        borderStyle="solid"
        borderColor={ThemeTokens.outlineVariant}
        borderRadius={borderRadius}
        background={ThemeTokens.surfaceContainerLow}
        overflow="auto"
    >
        <HStack
            background={ThemeTokens.surfaceContainerHigh}
            borderBottomWidth={1}
            borderBottomStyle="solid"
            borderBottomColor={ThemeTokens.outlineVariant}
        >
            {Array.from({length: columns}).map((_, index) => <Layout
                key={"header" + index}
                ph={rowPadding}
                pv={rowPadding}
                textAlign="center"
                style={textStyle}
                fontWeight={500}
                flex={1}
                borderRightWidth={index === (columns - 1) ? 0: 1}
                borderRightStyle="solid"
                borderRightColor={ThemeTokens.outlineVariant}
            >
                {header[index] ?? ''}
            </Layout>)}
        </HStack>

        {rows.map((row, rowIndex) =>
            <HStack
                borderBottomWidth={rowIndex === (rows.length - 1) ? 0: 1}
                borderBottomStyle="solid"
                borderBottomColor={ThemeTokens.outlineVariant}
            >
                {
                    Array.from({length: columns}).map((_, index) => <Layout
                        key={"row" + rowIndex + "_" + index}
                        ph={rowPadding}
                        pv={rowPadding}
                        flex={1}
                        style={textStyle}
                        borderRightWidth={index === (columns - 1) ? 0: 1}
                        borderRightStyle="solid"
                        borderRightColor={ThemeTokens.outlineVariant}
                    >
                        {row[index] ?? ''}
                    </Layout>)
                }
            </HStack>
        )}
    </VStack>;
};