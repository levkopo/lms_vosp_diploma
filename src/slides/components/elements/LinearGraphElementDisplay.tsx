import {useMemo} from 'preact/hooks';
import {LinearGraphElement, InputValues, GraphParameterValue, FormulaGraphVariable} from '../../models';
import {compileFormula, evaluateFormula} from "../../utils/formulaEvaluator.ts";
import {scaleCssValue} from "../../utils/styleUtils.ts";
import {JSX} from "preact/compat";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts'; // Импортируем компоненты Recharts

interface LinearGraphElementDisplayProps {
    element: LinearGraphElement;
    inputValues: InputValues;
    scaleFactor: number;
}
export const LinearGraphElementDisplay = (props: LinearGraphElementDisplayProps) => {
    const {element, inputValues, scaleFactor} = props
    const { domain, range, formulaParameters, caption, xAxisLabel, yAxisLabel } = element;

    // 1. Расчет данных для графика (массив объектов {x: number, y: number})
    const chartData = useMemo(() => {
        const data: { x: number; y: number | null }[] = []; // y может быть null, если формула не вычислилась
        const numDataPoints = 100;
        const xStep = (domain.max - domain.min) / Math.max(1, numDataPoints -1);

        if (formulaParameters) {
            const { formula, variables } = formulaParameters;
            const currentScope: Record<string, number> = {};
            variables.forEach((variable: FormulaGraphVariable) => {
                const inputValue = inputValues[variable.inputId];
                currentScope[variable.name] = typeof inputValue === 'number' ? inputValue : parseFloat(String(inputValue)) || 0;
            });

            const compiledFormula = compileFormula(formula);
            for (let i = 0; i < numDataPoints; i++) {
                const x = domain.min + i * xStep;
                const yValue = evaluateFormula(compiledFormula, { ...currentScope, x });
                data.push({ x, y: yValue });
            }
        }

        return data.filter(d => d.y !== null); // Recharts не любит null в данных для линии, лучше отфильтровать
    }, [domain, formulaParameters, inputValues]);

    // 2. Определение диапазона Y для Recharts (опционально, Recharts может авто-масштабировать)
    // Recharts обычно хорошо справляется с авто-масштабированием, но можно задать явно
    const yAxisDomain = useMemo((): [number | 'auto', number | 'auto'] | undefined => {
        if (range?.min !== undefined && range?.max !== undefined && range.min < range.max) {
            return [range.min, range.max];
        }
        // Если нужно более точное авто-масштабирование с отступами, можно рассчитать здесь
        // return ['auto', 'auto']; // Позволить Recharts решать
        if (chartData.length > 0) {
            const yValues = chartData.map(p => p.y as number); // Мы уже отфильтровали null
            let minY = Math.min(...yValues);
            let maxY = Math.max(...yValues);
            if (minY === maxY) {
                minY -= 1;
                maxY += 1;
            }
            const padding = (maxY - minY) * 0.1 || 1;
            return [Math.floor(minY - padding), Math.ceil(maxY + padding)]; // Округляем для "чистых" границ
        }
        return undefined; // Recharts будет использовать 'auto'
    }, [range, chartData]);


    // Стили
    const componentRootStyle: JSX.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        // border: '1px dotted blue', // DEBUG
    };

    const captionStyle: JSX.CSSProperties = {
        fontSize: scaleCssValue('14px', scaleFactor),
        lineHeight: '1.2',
        marginBottom: scaleCssValue('4px', scaleFactor),
        flexShrink: 0,
        textAlign: 'center',
    };

    const chartContainerStyle: JSX.CSSProperties = {
        flexGrow: 1,
        width: '100%',
        height: '100%', // Важно для ResponsiveContainer
        minHeight: '150px', // Минимальная высота, чтобы график не схлопывался
        // border: '1px dashed green', // DEBUG
    };

    // Размеры шрифтов для осей и меток в Recharts (можно задавать в px)
    const axisLabelFontSize = parseInt(scaleCssValue('12px', scaleFactor) as string) || 12;
    const tickFontSize = parseInt(scaleCssValue('10px', scaleFactor) as string) || 10;


    return (
        <div style={componentRootStyle}>
            {caption && <p style={captionStyle}>{caption}</p>}
            <div style={chartContainerStyle}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 5, right: axisLabelFontSize + 5, left: axisLabelFontSize, bottom: axisLabelFontSize + 5, // Отступы для меток осей
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                        <XAxis
                            dataKey="x"
                            type="number"
                            domain={[domain.min, domain.max]} // Явно задаем домен X
                            allowDataOverflow={true} // Разрешить линии выходить за пределы, если точки есть
                            tick={{ fontSize: tickFontSize, fill: '#666' }}
                            // tickFormatter={(tick) => tick.toFixed(1)} // Форматирование тиков, если нужно
                        >
                            {xAxisLabel && <Label value={xAxisLabel} offset={- (axisLabelFontSize + 2)} position="insideBottom" fontSize={axisLabelFontSize} fill="#333" />}
                        </XAxis>
                        <YAxis
                            type="number"
                            domain={yAxisDomain} // Используем вычисленный или 'auto' домен Y
                            allowDataOverflow={true}
                            tick={{ fontSize: tickFontSize, fill: '#666' }}
                            // tickFormatter={(tick) => tick.toFixed(1)}
                        >
                            {yAxisLabel && <Label value={yAxisLabel} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: axisLabelFontSize, fill: '#333' }} />}
                        </YAxis>
                        <Tooltip
                            formatter={(value: number, name: string, props) => [`y: ${value.toFixed(2)}`, `x: ${props.payload.x.toFixed(2)}`]}
                            labelStyle={{fontSize: tickFontSize}}
                            contentStyle={{fontSize: tickFontSize}}
                        />
                        {/* <Legend wrapperStyle={{fontSize: tickFontSize}} /> */}
                        <Line
                            type="monotone" // Тип интерполяции линии
                            dataKey="y"     // Ключ для значений Y в объектах chartData
                            stroke="royalblue"
                            strokeWidth={2}
                            dot={false}     // Не отображать точки на линии (можно true или объект для кастомизации)
                            connectNulls={false} // Не соединять линию через null значения (если они не отфильтрованы)
                            // name="Функция" // Для легенды
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};