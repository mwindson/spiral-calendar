/**
 * 判断闰年函数
 * @param  {number} year 要判断的年份
 * @return {boolean} 返回布尔值
 * 1.普通年能被4整除且不能被100整除的为闰年。如2004年就是闰年,1900年不是闰年
 * 2.世纪年能被400整除的是闰年。如2000年是闰年，1900年不是闰年
 */
function isLeapYear(year: number): boolean {
  return !(year % (year % 100 ? 4 : 400))
}

/**
 * 估计等分为一定长度的螺旋线对应的弧度，用二分法逼近
 * @param  {number} startRadius 要计算的起始径长
 * @param  {number} startRadian 要计算的起始弧度
 * @param  {number} totalRadian 转过的总弧度
 * @param  {number} count 等分数
 * @return {number} 返回弧度值
 */
function divSpiralAngleByLength(startRadius: number, startRadian: number, totalRadian: number, count: number, num = 1) {
  const cal = (x: number) => x * Math.sqrt(1 + x * x) + Math.log(x + Math.sqrt(1 + x * x))
  const totalLength = 0.5 * startRadius * (cal(totalRadian) - cal(4 * Math.PI))
  const target = cal(startRadian) - totalLength / count * 2 / startRadius * num
  // 二分法
  let left = 4 * Math.PI // 最终剩余4圈
  let right = startRadian
  while (left < right) {
    const mid = (left + right) / 2
    const threshold = 0.001
    // 0.001 为 匹配时的阈值
    if (Math.abs(cal(mid) - target) < threshold) {
      return mid
    } else if (cal(mid) > target) {
      right = mid
    } else {
      left = mid
    }
  }
  return left
}

export { isLeapYear, divSpiralAngleByLength }
