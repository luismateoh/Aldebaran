import { siteConfig } from "@/config/site"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CardsView from "@/components/cards/cards-view"
import TableView from "@/components/table/table-view"

export const metadata = {
  title: siteConfig.title,
  keywords: siteConfig.keywords,
}

export default function IndexPage() {
  return (
    <>
      {/* Disclaimer de construcción */}
      <div className="border-b bg-yellow-50 dark:bg-yellow-950/20">
        <div className="container flex h-14 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">🚧 Sitio en construcción temporal</span>
            <span className="hidden sm:inline">- Algunos datos pueden estar desactualizados</span>
          </div>
        </div>
      </div>

      <section className="container grid items-center gap-6 pb-8 pt-12 md:py-20">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            ¡Bienvenido a Aldebaran: <br className="hidden sm:inline" />
            Tu Guía de Carreras de Atletismo en Colombia!
          </h1>
          <p className="max-w-[800px] text-lg text-accent-foreground">
            Descubre las mejores carreras de atletismo en todo Colombia con
            Aldebaran. Desde emocionantes maratones en las montañas hasta
            rápidas carreras urbanas, te ofrecemos toda la información que
            necesitas para participar y disfrutar del emocionante mundo del
            atletismo.
          </p>
          <p className="max-w-[800px] text-lg text-accent-foreground">
            ¡Prepárate para correr, superarte y vivir experiencias inolvidables
            con Aldebaran!
          </p>
        </div>
      </section>
      <section className="container py-5">
        <Tabs defaultValue="cards">
          <TabsList className="mb-5">
            <TabsTrigger value="cards">Tarjetas</TabsTrigger>
            <TabsTrigger value="table">Tabla</TabsTrigger>
          </TabsList>
          <TabsContent value="cards">
            <CardsView />
          </TabsContent>
          <TabsContent value="table">
            <TableView />
          </TabsContent>
        </Tabs>
      </section>
    </>
  )
}
