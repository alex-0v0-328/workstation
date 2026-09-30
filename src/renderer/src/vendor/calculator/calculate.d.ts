// Types for the vendored upstream module (calculate.js ships without declarations).
export interface CalculatorData { total?: string | null; next?: string | null; operation?: string | null }
export default function calculate(obj: CalculatorData, buttonName: string): CalculatorData
