import { useEffect, useState } from "react"

const useCountdown = (targetDate: string | number | Date) => {
  const countDownDate = new Date(targetDate).getTime()

  // Get current date and adjust to Colombia, Bogota timezone (GMT-5)
  const currentDate = new Date()
  currentDate.setHours(currentDate.getHours() - 5)

  const [countDown, setCountDown] = useState(
    countDownDate - currentDate.getTime()
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const currentDate = new Date()
      currentDate.setHours(currentDate.getHours() - 5)
      setCountDown(countDownDate - currentDate.getTime())
    }, 1000)

    return () => clearInterval(interval)
  }, [countDownDate])

  return getReturnValues(countDown)
}

const getReturnValues = (countDown: number) => {
  // calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24))
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000)

  return [days, hours, minutes, seconds]
}

export { useCountdown }
