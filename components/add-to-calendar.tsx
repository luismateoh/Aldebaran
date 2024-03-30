import Link from "next/link"

import {Button} from "@/components/ui/button"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"

import {Icons} from "./icons"

interface AddToCalendarProps {
  title: string
  description: string
  location: string
  evenDate: string
  organizer: string
  website: string
}

export default function AddToCalendar({
  title,
  description,
  location,
  evenDate,
  organizer,
  website,
}: AddToCalendarProps) {
  /*
  Link generator

  Google Calendar
  https://calendar.google.com/calendar/render?action=TEMPLATE&dates=20240330T050000Z%2F20240330T050000Z&details=Event%20description&location=Location%2C%20example&text=event%20title
  Yahoo Calendar
  https://calendar.yahoo.com/?desc=Event%20description&dur=false&et=20240330T050000Z&in_loc=Location%2C%20example&st=20240330T050000Z&title=event%20title&v=60
  Outlook Calendar
  https://outlook.live.com/calendar/0/action/compose?allday=false&body=Event%20description&enddt=2024-03-30T00%3A00%3A00&location=Location%2C%20example&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&startdt=2024-03-30T00%3A00%3A00&subject=event%20title
  AOL Calendar
  https://calendar.aol.com/?desc=Event%20description&dur=false&et=20240330T050000Z&in_loc=Location%2C%20example&st=20240330T050000Z&title=event%20title&v=60
  ICS File
  data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0AURL:https://calendar.google.com/calendar/render%0ADTSTART:20240330T050000Z%0ADTEND:20240330T050000Z%0ASUMMARY:event%20title%0ADESCRIPTION:Event%20description%0ALOCATION:Location%2C%20example%0AEND:VEVENT%0AEND:VCALENDAR

   */
  const MINUTE_IN_MS = 60 * 1000

  function formatDateForCalendarUrl(date: Date) {
    return date.toISOString().replace(/-|:|\.\d+/g, "")
  }

  function generateGoogleCalendarUrl() {
    const date = formatDateForCalendarUrl(new Date(evenDate))
    return encodeURI(
      [
        "https://calendar.google.com/calendar/render",
        "?action=TEMPLATE",
        `&dates=${date}%2F${date}`,
        `&details=${description}`,
        `&location=${location}`,
        `&text=${title}`,
      ].join("")
    )
  }

  // Generates ICS for Apple and Outlook calendars
  function generateIcsCalendarFile() {
    const date = formatDateForCalendarUrl(new Date(evenDate))

    return encodeURI(
      [
        "data:text/calendar;charset=utf8,BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `URL:${website}`,
        `DTSTART:${date}`,
        `DTEND:${date}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("%0A")
    )
  }

  function generateYahooCalendarUrl() {
    const date = formatDateForCalendarUrl(new Date(evenDate))
    return encodeURI(
      [
        "https://calendar.yahoo.com",
        "?desc=" + description,
        "&dur=false",
        "&et=" + date,
        "&in_loc=" + location,
        "&st=" + date,
        "&title=" + title,
        "&v=60",
      ].join("")
    )
  }

  function generateMicrosoftTeamsUrl() {
    const date = formatDateForCalendarUrl(new Date(evenDate))
    return encodeURI(
      [
        "https://teams.microsoft.com/l/meeting/new?subject=" + title,
        "&startTime=" + date,
        "&endTime=" + date,
        "&location=" + location,
        "&attendees=",
      ].join("")
    )
  }

  //AOL
  function generateAolCalendarUrl() {
    const date = formatDateForCalendarUrl(new Date(evenDate))
    return encodeURI(
      [
        "https://calendar.aol.com",
        "?desc=" + description,
        "&dur=false",
        "&et=" + date,
        "&in_loc=" + location,
        "&st=" + date,
        "&title=" + title,
        "&v=60",
      ].join("")
    )
  }

  function generateOutlookCalendarUrl() {
    const date = formatDateForCalendarUrl(new Date(evenDate))
    return encodeURI(
      [
        "https://outlook.live.com/calendar/0/action/compose",
        "?allday=false",
        "&body=" + description,
        "&enddt=" + date,
        "&location=" + location,
        "&path=%2Fcalendar%2Faction%2Fcompose",
        "&rru=addevent",
        "&startdt=" + date,
        "&subject=" + title,
      ].join("")
    )
  }

  function generateMicrosoft365Url() {
    const date = formatDateForCalendarUrl(new Date(evenDate))
    return encodeURI(
      [
        "https://outlook.office.com/calendar/0/deeplink/compose?start=" + date,
        "&end=" + date,
        "&location=" + location,
        "&subject=" + title,
        "&body=" + description,
      ].join("")
    )
  }

  return (
    <div className="sm:w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 text-ellipsis sm:min-w-full">
            <Icons.calendar className="size-4" />
            Añadir al calendario
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Link
              className="flex items-center gap-2"
              href={generateIcsCalendarFile()}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icons.apple className="size-4 dark:text-white" /> Apple
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              className="flex items-center gap-2"
              href={generateGoogleCalendarUrl()}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icons.googleCalendar className="size-4" />
              Google
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              className="flex items-center gap-2"
              href={generateYahooCalendarUrl()}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icons.yahoo className="size-4 text-[#410093] dark:text-white" />
              Yahoo
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              className="flex items-center gap-2"
              href={generateMicrosoftTeamsUrl()}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icons.microsoftTeams className="size-4" />
              Microsoft Teams
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              className="flex items-center gap-2"
              href={generateOutlookCalendarUrl()}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icons.outlook className="size-4" />
              Outlook
            </Link>
          </DropdownMenuItem>
          {/*          <DropdownMenuItem>
            <Link className="flex gap-1 items-center" href={generateMicrosoft365Url()} rel="noopener noreferrer"
                  target="_blank">
              <Icons.office365 className="size-3"/>
              Microsoft 365
            </Link>
          </DropdownMenuItem>*/}
          <DropdownMenuItem>
            <Link
              className="flex items-center gap-2"
              href={generateAolCalendarUrl()}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icons.aol className="size-4 dark:text-white" />
              AOL Calendar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              className="flex items-center gap-2"
              href={generateIcsCalendarFile()}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icons.calendar className="size-4 dark:text-white" />
              iCal File
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
