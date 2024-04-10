import { MetadataRoute } from "next"

import { getAllEventsIds } from "@/lib/events"

const EXTERNAL_DATA_URL = "https://aldebaran.run/events"

function generateSiteMap(posts: any) {
  const mainUrl = {
    url: "https://aldebaran.run",
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 1,
  }

  const postUrls = posts.map(({ id }: any) => {
    return {
      url: `${EXTERNAL_DATA_URL}/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }
  })

  return [mainUrl, ...postUrls]
}

export async function getServerSideProps({ res }: any) {
  // We make an API call to gather the URLs for our site
  const eventsData = getAllEventsIds()

  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(eventsData)

  res.setHeader("Content-Type", "application/json")
  // we send the JSON to the browser
  res.write(JSON.stringify(sitemap))
  res.end()

  return {
    props: {},
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const eventsData = getAllEventsIds()
  console.log(eventsData)
  return generateSiteMap(eventsData)
}
