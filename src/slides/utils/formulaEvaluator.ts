import {all, create, EvalFunction} from 'mathjs';

const math = create(all);


/**
 * Парсинг формулы
 * @param formula Строка формулы, например "m*x + c"
 * @returns Результат вычисления или null в случае ошибки.
 */
export const compileFormula = (formula: string): EvalFunction => {
    try {
        return math.compile(formula);
    } catch (error) {
        console.error(`Ошибка при вычислении формулы "${formula}":`, error);
        return null;
    }
};

/**
 * Вычисляет значение формулы с заданными переменными.
 * @param evalFunction Математическая функция
 * @param scope Объект, где ключи - имена переменных, а значения - их числовые значения.
 *              Например: { m: 2, x: 3, c: 1 }
 * @returns Результат вычисления или null в случае ошибки.
 */
export const evaluateFormula = (evalFunction: EvalFunction, scope: Record<string, number>): number | null => {
    try {
        const result = evalFunction.evaluate(scope);
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
            return result;
        }

        console.warn(`Результат вычисления формулы "${evalFunction}" не является корректным числом:`, result);
        return null;
    } catch (error) {
        console.error(`Ошибка при вычислении формулы "${evalFunction}":`, error);
        return null;
    }
};