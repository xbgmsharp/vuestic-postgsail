/*
import { ChartData, ChartOptions } from 'chart.js'

export type ColorThemes = {
  [key: string]: string
}

export type TLineChartData = ChartData<'line'>
export type TBarChartData = ChartData<'bar'>
export type TBubbleChartData = ChartData<'bubble'>
export type TDoughnutChartData = ChartData<'doughnut'>
export type TPieChartData = ChartData<'pie'>

//export type TChartData = TLineChartData | TBarChartData | TBubbleChartData | TDoughnutChartData | TPieChartData
//export type TChartData = TBarChartData
*/
export type JSObj = Record<string, any>
export type Callback_1Param = (argument: any) => any

export interface Response {
  data: any
}
export interface JSONObject {
  [k: string]: number[]
}
