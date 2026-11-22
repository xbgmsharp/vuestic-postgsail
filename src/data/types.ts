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

export type Vessel = {
  name: string
  mmsi: string
  vessel_id: string
  created_at: string
  first_contact: string
  last_contact: string
  geojson: Record<string, unknown>
  ship_type: number
  country: string
  alpha_2: string
  length: number
  beam: number
  height: number
  plugin_version: string
  platform: string
  make_model: string
  has_images: boolean
  images: { id: string; url: string; type: string; caption: string }[]
  image_url: string
}
