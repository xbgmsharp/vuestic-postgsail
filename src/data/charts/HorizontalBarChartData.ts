import { useChartColors } from './composables/useChartColors'

export function useHorizontalBarChartData() {
  const { generateColors } = useChartColors()

  const getHorizontalBarChartData = () => {
    const backgroundColors = generateColors(['warning', 'danger'])

    return {
      labels: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      datasets: [
        {
          label: 'Vuestic Satisfaction Score',
          backgroundColor: backgroundColors[0],
          borderColor: 'transparent',
          data: [80, 90, 50, 70, 60, 90, 50, 90, 80, 40, 72, 93],
        },
        {
          label: 'Bulma Satisfaction Score',
          backgroundColor: backgroundColors[1],
          borderColor: 'transparent',
          data: [20, 30, 20, 40, 50, 40, 15, 60, 30, 20, 42, 53],
        },
      ],
    }
  }

  return { getHorizontalBarChartData }
}
