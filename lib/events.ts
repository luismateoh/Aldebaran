import fs from "fs"
import path from "path"
import matter from "gray-matter"
// Import 'remark', library for rendering markdown
import { remark } from "remark"
import html from "remark-html"

const eventsDirectory = path.join(process.cwd(), "events")

// -------------------------------------------------
// GET THE DATA OF ALL EVENTS IN SORTED ORDER BY DATE
/*
  Returns an array that looks like this:
  [
    {
    id: '2024-11-24_guasca_newbalanceguasca',
    title: 'NB Race Series Guasca 15K',
    author: 'Luis Hincapie',
    publishDate: '2024-3-26',
    draft: false,
    category: 'Running',
    tags: [ 'Media maratón' ],
    snippet: 'Con la NB RACE SERIES GUASCA decidimos reflejar nuestra independencia y ofrecer una competencia fuera de la ciudad, invitado a vivir una experiencia diferente, que rompe los esquemas y desafía los límites.',
    altitude: '2681m',
    eventDate: '2024-nov-24',
    organizer: 'MCM',
    registrationDeadline: '2024-nov-24',
    registrationFeed: '$90.000',
    website: 'https://www.newbalance15k.com.co',
    distances: [ '15k' ],
    cover: 'https://www.newbalance15k.com.co/wp-content/uploads/2023/03/header_Guasca.jpg',
    department: 'Cundinamarca',
    municipality: 'Guasca'
  },
  {
    id: '2024-11-24_guasca_newbalanceguasca',
    title: 'NB Race Series Guasca 15K',
    author: 'Luis Hincapie',
    publishDate: '2024-3-26',
    draft: false,
    category: 'Running',
    tags: [ 'Media maratón' ],
    snippet: 'Con la NB RACE SERIES GUASCA decidimos reflejar nuestra independencia y ofrecer una competencia fuera de la ciudad, invitado a vivir una experiencia diferente, que rompe los esquemas y desafía los límites.',
    altitude: '2681m',
    eventDate: '2024-nov-24',
    organizer: 'MCM',
    registrationDeadline: '2024-nov-24',
    registrationFeed: '$90.000',
    website: 'https://www.newbalance15k.com.co',
    distances: [ '15k' ],
    cover: 'https://www.newbalance15k.com.co/wp-content/uploads/2023/03/header_Guasca.jpg',
    department: 'Cundinamarca',
    municipality: 'Guasca'
  },
  ]
*/

export function getSortedEventsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(eventsDirectory)
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "")

    // Read markdown file as string
    const fullPath = path.join(eventsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, "utf8")

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    return {
      id,
      contentHtml: "",
      ...(matterResult.data as {
        title: string
        author: string
        publishDate: string
        draft: false
        category: string
        tags: string[]
        snippet: string
        altitude: string
        eventDate: string
        organizer: string
        registrationDeadline: string
        registrationFeed: string
        website: string
        distances: string[]
        cover: string
        department: string
        municipality: string
      }),
    }
  })
  //filter out drafts and events that have already happened
  const publishedEvents = allPostsData
    .filter((event) => !event.draft)
    .filter((event) => new Date(event.eventDate) > new Date())

  // Sort posts by date
  return publishedEvents.sort(
    (b, a) => new Date(b.eventDate).valueOf() - new Date(a.eventDate).valueOf()
  )
}

// ------------------------------------------------
// GET THE IDs OF ALL EVENTS FOR THE DYNAMIC ROUTING
/*
  Returns an array that looks like this:
  [
    {
      params: {
        id: 'ssg-ssr'
      }
    },
    {
      params: {
        id: 'pre-rendering'
      }
    }
  ]
  */

export function getAllEventsIds() {
  const fileNames = fs.readdirSync(eventsDirectory)

  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    }
  })
}

// The returned array must have the params key otherwise `getStaticPaths` will fail

// --------------------------------
// GET THE DATA OF A SINGLE EVENT FROM THE ID
export async function getEventData(id: string) {
  const fullPath = path.join(eventsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, "utf8")

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Combine the data with the id
  return {
    id,
    contentHtml,
    ...(matterResult.data as {
      title: string
      author: string
      publishDate: string
      draft: false
      category: string
      tags: string[]
      snippet: string
      altitude: string
      eventDate: string
      organizer: string
      registrationDeadline: string
      registrationFeed: string
      website: string
      distances: string[]
      cover: string
      department: string
      municipality: string
    }),
  }
}
