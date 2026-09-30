import { describe, it, expect } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import calculate, { type CalculatorData } from '../src/renderer/src/vendor/calculator/calculate'
import { press, display, keyFromKeyboard } from '../src/renderer/src/tools/calculator'
import { mergePdfs } from '../src/renderer/src/tools/pdf'

// Upstream andrewagain/calculator logic/calculate.test.js, ported from chai to vitest unchanged in substance.
function pressButtons(buttons: string[]): CalculatorData {
  const value: Record<string, unknown> = {}
  buttons.forEach(button => { Object.assign(value, calculate(value, button)) })
  Object.keys(value).forEach(key => { if (value[key] === null) delete value[key] })
  return value
}
const cases: [string[], CalculatorData][] = [
  [['6'], { next: '6' }], [['6', '6'], { next: '66' }], [['6', '+', '6'], { next: '6', total: '6', operation: '+' }],
  [['6', '+', '6', '='], { total: '12' }], [['0', '0', '+', '0', '='], { total: '0' }], [['6', '+', '6', '=', '9'], { next: '9' }],
  [['3', '+', '6', '=', '+'], { total: '9', operation: '+' }], [['3', '+', '6', '=', '+', '9'], { total: '9', operation: '+', next: '9' }],
  [['3', '+', '6', '=', '+', '9', '='], { total: '18' }], [['3', '+', '=', '3', '='], { total: '6' }], [['+'], { operation: '+' }],
  [['+', '2'], { next: '2', operation: '+' }], [['+', '2', '+'], { total: '2', operation: '+' }], [['+', '2', '+', '+'], { total: '2', operation: '+' }],
  [['+', '2', '+', '5'], { next: '5', total: '2', operation: '+' }], [['+', '2', '5'], { next: '25', operation: '+' }], [['+', '6', '+', '5', '='], { total: '11' }],
  [['0', '.', '4'], { next: '0.4' }], [['.', '4'], { next: '0.4' }], [['.', '4', '-', '.', '2'], { total: '0.4', next: '0.2', operation: '-' }],
  [['.', '4', '-', '.', '2', '='], { total: '0.2' }], [['1', '+', '2', 'AC'], {}], [['+', '2', 'AC'], {}], [['4', '%'], { next: '0.04' }],
  [['4', '%', 'x', '2', '='], { total: '0.08' }], [['4', '%', 'x', '2'], { total: '0.04', operation: 'x', next: '2' }], [['2', 'x', '2', '%'], { total: '0.04' }],
  [['2', 'x', 'x'], { total: '2', operation: 'x' }], [['2', '÷', '÷'], { total: '2', operation: '÷' }], [['2', '÷', 'x', '+', '-', 'x'], { total: '2', operation: 'x' }]
]

describe('vendored calculator logic', () => {
  for (const [buttons, expected] of cases) it(`buttons ${buttons.join(',')}`, () => { expect(pressButtons(buttons)).toEqual(expected) })
})

describe('calculator glue', () => {
  const run = (keys: string[]) => keys.reduce(press, {})
  it('keeps decimal precision exact', () => { expect(display(run(['.', '1', '+', '.', '2', '=']))).toBe('0.3') })
  it('turns division by zero into a recoverable error state', () => {
    const failed = run(['5', '÷', '0', '='])
    expect(failed.error).toBe(true)
    expect(display(press(failed, '7'))).toBe('7')
  })
  it('maps keyboard keys to calculator buttons', () => {
    expect(['7', '*', '/', 'Enter', 'Escape', 'q'].map(keyFromKeyboard)).toEqual(['7', 'x', '÷', '=', 'AC', null])
  })
})

describe('pdf merge glue', () => {
  const pdf = async (pages: number) => { const doc = await PDFDocument.create(); for (let i = 0; i < pages; i++) doc.addPage([200 + i, 200]); return doc.save() }
  it('merges whole documents and page ranges in order', async () => {
    const merged = await PDFDocument.load(await mergePdfs([{ data: await pdf(2) }, { data: await pdf(5), pages: '2-3, 5' }]), { updateMetadata: false })
    expect(merged.getPageCount()).toBe(5)
    expect(merged.getPages().map(p => p.getWidth())).toEqual([200, 201, 201, 202, 204])
    expect(merged.getProducer()).toBe('Workstation')
  })
  it('rejects malformed page ranges', async () => {
    await expect(mergePdfs([{ data: await pdf(1), pages: 'first' }])).rejects.toThrow()
  })
})
