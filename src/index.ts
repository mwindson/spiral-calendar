import * as d3 from 'd3'
import * as moment from 'moment'
import { isLeapYear, divSpiralAngleByLength } from './utils'

interface Date {
  text: string
  date?: moment.Moment
  index: number
  type: 'monthLabel' | 'date'
  color: string
  startRadian: number
  startRadius: number
  endRadian: number
  endRadius: number
  month: number
}

function main(year: number, startRadian: number) {
  const svg = d3.select('#main')
  const calendar = svg.append('g').attr('class', 'calendar')
  const radius = 450
  svg.attr('width', radius * 2).attr('height', radius * 2)
  const center = { x: radius, y: radius }
  drawSpiral(calendar, startRadian, center, radius, year)
}
function drawSpiral(
  calender: d3.Selection<Element | d3.EnterElement | Document | Window, {}, HTMLElement, null>,
  startRadian: number,
  center: { x: number; y: number },
  radius: number,
  year: number
) {
  let a = 0 // 角度
  let b = 0 //  半径
  const v = 0.06 // 直线移动速度
  const f = radius / (21 * v) // 转动速度

  const spiral = d3.line()
  const spiralData: Array<[number, number]> = []
  while (a <= 21 * Math.PI + startRadian) {
    const p1: [number, number] = [center.x + b * Math.sin(a), center.y + b * Math.cos(a)]
    if (a >= Math.PI * 2 + startRadian) {
      spiralData.push(p1)
    }
    a = a + Math.PI / f
    b = b + v
  }
  const totalAngle = a
  const dates: Date[] = generateYearData(year, b, a, v, f)
  // shape.selectAll('line').data(dates).enter()
  //   .append('line')
  //   .attr('x1', (d) => center.x + d.startRadius * Math.sin(d.startAngle))
  //   .attr('y1', (d) => center.y + d.startRadius * Math.cos(d.startAngle))
  //   .attr('x2', (d) => center.x + (d.startRadius - 2 * f * v) * Math.sin(d.startAngle - 2 * Math.PI))
  //   .attr('y2', (d) => center.y + (d.startRadius - 2 * f * v) * Math.cos(d.startAngle - 2 * Math.PI))
  //   .attr('stroke', 'black')
  // shape
  //   .append('line')
  //   .datum(dates[dates.length - 1])
  //   .attr('x1', (d) => center.x + d.endRadius * Math.sin(d.endAngle))
  //   .attr('y1', (d) => center.y + d.endRadius * Math.cos(d.endAngle))
  //   .attr('x2', (d) => center.x + (d.endRadius - 2 * f * v) * Math.sin(d.endAngle - 2 * Math.PI))
  //   .attr('y2', (d) => center.y + (d.endRadius - 2 * f * v) * Math.cos(d.endAngle - 2 * Math.PI))
  //   .attr('stroke', 'black')

  // each date card
  const datesPart = calender.append('g').attr('class', 'dates')
  const datePart = datesPart
    .selectAll('g')
    .data(dates)
    .enter()
    .append('g')
    .attr('class', 'date')
    .attr('id', d => 'i' + d.index)
  datePart
    .append('path')
    .attr('d', (d: Date) => generatePath(d, center, f, v))
    .attr('fill', d => d.color)
    .attr('stroke', 'rgba(150,150,150,.6)')
  // add date text
  datePart
    .append('text')
    .text(d => d.text)
    .attr('x', d => center.x + (d.startRadius - f * v) * Math.sin((d.startRadian + d.endRadian) / 2) - 15)
    .attr('y', d => center.y + 5 + (d.startRadius - f * v) * Math.cos((d.startRadian + d.endRadian) / 2))
    // .attr('x', 0).attr('y', 0)
    .attr('fill', d => (d.type === 'monthLabel' ? 'white' : 'black'))
    .attr('font-size', 10)
  // outer border
  // const shape = calender.append('g').attr('class', 'shape')
  // shape.append('path').attr('d', spiral(spiralData)).attr('fill', 'none').attr('stroke', 'red')
}

main(2018, 0)
function generatePath(d: Date, center: { x: number; y: number }, f: number, v: number): string {
  let path = `M${center.x + d.startRadius * Math.sin(d.startRadian)}
   ${center.y + d.startRadius * Math.cos(d.startRadian)} `
  let radian = d.startRadian
  let r = d.startRadius
  while (radian > d.endRadian) {
    path += `L${center.x + r * Math.sin(radian)}  ${center.y + r * Math.cos(radian)} `
    radian -= Math.PI / f
    r -= v
  }
  path += `L${center.x + d.endRadius * Math.sin(d.endRadian)}${' '}
  ${center.y + d.endRadius * Math.cos(d.endRadian)}`
  path += `L${center.x + (d.endRadius - 2 * f * v) * Math.sin(d.endRadian - 2 * Math.PI)}${' '}
  ${center.y + (d.endRadius - 2 * f * v) * Math.cos(d.endRadian - 2 * Math.PI)}`
  radian = d.endRadian - 2 * Math.PI
  r = d.endRadius - 2 * f * v
  while (radian < d.endRadian - 2 * Math.PI) {
    path += `L${center.x + r * Math.sin(radian)}  ${center.y + r * Math.cos(radian)} `
    radian += Math.PI / f
    r += v
  }
  path += `L${center.x + (d.startRadius - 2 * f * v) * Math.sin(d.startRadian - 2 * Math.PI)}${' '}
  ${center.y + (d.startRadius - 2 * f * v) * Math.cos(d.startRadian - 2 * Math.PI)}`
  path += 'Z'
  return path
}

/**
 * 根据年份返回一年中日期对应螺旋线上的位置坐标和角度
 * @param  {number} year 输入的年份
 * @param  {number} radius 最长半径
 * @param  {number} totalRadian 转过总角度
 * @param  {number} v 转过f度时对应的线速度
 * @param  {number} f 角速度
 * @return {Date[]} 返回每月每日的位置
 */
function generateYearData(year: number, radius: number, totalRadian: number, v: number, f: number) {
  const weekdayName: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']
  const monthName: string[] = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const dateArray: Date[] = []
  const dayCount = isLeapYear(year) ? 366 : 365
  const colorScale = d3
    .scaleLinear()
    .domain([0, 31])
    .range(['#c2c2c2', 'white'])
  let day = moment(`${year}-01-01`, 'YYYY-MM-DD')
  // 上一个的结束角度和半径
  let prevEndAngle: number = null
  let prevEndRadius: number = null
  let index = 0
  const calEndRadius = (startRadian: number, startRadius: number, endRadian: number) =>
    startRadius - (startRadian - endRadian) * f * v / Math.PI
  while (day.isBefore(moment(`${year + 1}-01-01`, 'YYYY-MM-DD'))) {
    if (dateArray.length >= 1) {
      prevEndAngle = dateArray[dateArray.length - 1].endRadian
      prevEndRadius = dateArray[dateArray.length - 1].endRadius
    }

    if (day.date() === 1) {
      const monthLabel: Date = {
        color: 'gray',
        endRadian: divSpiralAngleByLength(
          radius,
          prevEndAngle ? prevEndAngle : totalRadian,
          totalRadian,
          dayCount + 12
        ),
        endRadius: 0,
        index,
        startRadian: prevEndAngle ? prevEndAngle : totalRadian,
        startRadius: prevEndRadius ? prevEndRadius : radius,
        text: monthName[day.month()],
        type: 'monthLabel',
        month: day.month()
      }
      monthLabel.endRadius = calEndRadius(monthLabel.startRadian, monthLabel.startRadius, monthLabel.endRadian)
      dateArray.push(monthLabel)
      prevEndAngle = monthLabel.endRadian
      prevEndRadius = monthLabel.endRadius
      index += 1
    }
    const date: Date = {
      color: colorScale(day.date()),
      date: day,
      endRadian: divSpiralAngleByLength(radius, prevEndAngle, totalRadian, dayCount + 12),
      endRadius: 0,
      index,
      startRadian: prevEndAngle,
      startRadius: prevEndRadius,
      text: `${weekdayName[day.day()]}${day.date()} `,
      type: 'date',
      month: day.month()
    }
    date.endRadius = calEndRadius(date.startRadian, date.startRadius, date.endRadian)
    dateArray.push(date)
    day = day.clone().add(1, 'd')
    index += 1
  }
  return dateArray
}
