import type { MatchItem } from '~/types'
import { useI18n } from 'vue-i18n'

export function useCalendar() {
  const { locale } = useI18n()

  // Format date to YYYYMMDDTHHMMSSZ for ICS and Google Calendar
  const formatTimeForCalendar = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  // Generate event title based on locale
  const getEventTitle = (match: MatchItem) => {
    const home = locale.value === 'zh' ? match.homeTeam.nameZh : match.homeTeam.nameEn
    const away = locale.value === 'zh' ? match.awayTeam.nameZh : match.awayTeam.nameEn
    return `⚽ ${home} vs ${away} - WorldCup 2026`
  }

  // Generate event description
  const getEventDescription = (match: MatchItem) => {
    const url = `https://worldcupdex.org/${locale.value}/predict/${match.id}`
    const venueName = locale.value === 'zh' ? match.venue.nameZh : match.venue.name
    const venueCity = locale.value === 'zh' ? match.venue.cityZh : match.venue.city
    return `FIFA World Cup 2026 Match\\nVenue: ${venueName}, ${venueCity}\\nPredict this match: ${url}`
  }

  // Generate Google Calendar Link
  const generateGoogleCalendarLink = (match: MatchItem) => {
    const start = formatTimeForCalendar(match.timestamp)
    // Assume match lasts 2 hours
    const end = formatTimeForCalendar(match.timestamp + 2 * 60 * 60 * 1000)
    
    const venueName = locale.value === 'zh' ? match.venue.nameZh : match.venue.name
    const venueCity = locale.value === 'zh' ? match.venue.cityZh : match.venue.city

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: getEventTitle(match),
      dates: `${start}/${end}`,
      details: getEventDescription(match),
      location: `${venueName}, ${venueCity}`
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  // Generate Outlook Calendar Link
  const generateOutlookCalendarLink = (match: MatchItem) => {
    const start = new Date(match.timestamp).toISOString()
    const end = new Date(match.timestamp + 2 * 60 * 60 * 1000).toISOString()
    
    const venueName = locale.value === 'zh' ? match.venue.nameZh : match.venue.name
    const venueCity = locale.value === 'zh' ? match.venue.cityZh : match.venue.city

    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: getEventTitle(match),
      startdt: start,
      enddt: end,
      body: getEventDescription(match),
      location: `${venueName}, ${venueCity}`
    })

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
  }

  // Generate raw ICS content for single or multiple matches
  const generateIcsContent = (matches: MatchItem[]) => {
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//WorldCupDex//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ]

    matches.forEach(match => {
      const start = formatTimeForCalendar(match.timestamp)
      const end = formatTimeForCalendar(match.timestamp + 2 * 60 * 60 * 1000)
      const now = formatTimeForCalendar(Date.now())
      
      const venueName = locale.value === 'zh' ? match.venue.nameZh : match.venue.name
      const venueCity = locale.value === 'zh' ? match.venue.cityZh : match.venue.city

      ics = ics.concat([
        'BEGIN:VEVENT',
        `UID:match-${match.id}@worldcupdex.org`,
        `DTSTAMP:${now}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${getEventTitle(match)}`,
        `DESCRIPTION:${getEventDescription(match).replace(/\\n/g, '\\\\n')}`,
        `LOCATION:${venueName}\\, ${venueCity}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      ])
    })

    ics.push('END:VCALENDAR')
    return ics.join('\\r\\n')
  }

  // Download ICS file
  const downloadIcs = (matches: MatchItem[], filename = 'worldcup-schedule.ics') => {
    const content = generateIcsContent(matches)
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    generateGoogleCalendarLink,
    generateOutlookCalendarLink,
    downloadIcs
  }
}
