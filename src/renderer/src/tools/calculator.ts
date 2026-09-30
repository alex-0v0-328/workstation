import calculate, { type CalculatorData } from '../vendor/calculator/calculate'

// Thin glue over the vendored upstream calculator logic (see vendor/calculator/README.md).
export interface CalcState extends CalculatorData { error?: boolean }
export const calcRows = [['AC', '+/-', '%', '÷'], ['7', '8', '9', 'x'], ['4', '5', '6', '-'], ['1', '2', '3', '+'], ['0', '.', '=']] as const
export const operators = new Set(['÷', 'x', '-', '+', '='])

export function press(state: CalcState, key: string): CalcState {
  const base = state.error ? {} : state
  try { return { ...base, ...calculate(base, key), error: false } } catch { return { total: null, next: null, operation: null, error: true } }
}
export const display = (state: CalcState): string => state.next || state.total || '0'

const keyboard: Record<string, string> = { '*': 'x', '/': '÷', Enter: '=', '=': '=', Escape: 'AC', Delete: 'AC', '+': '+', '-': '-', '%': '%', '.': '.', ',': '.' }
export const keyFromKeyboard = (key: string): string | null => /^[0-9]$/.test(key) ? key : keyboard[key] ?? null
