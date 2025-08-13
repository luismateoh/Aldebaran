import { siteConfig } from "@/config/site"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CardsView from "@/components/cards/cards-view"
import TableView from "@/components/table/table-view"

export const metadata = {
  title: `Eventos de Atletismo - ${siteConfig.title}`,
  description: "Encuentra todos los eventos de atletismo en Colombia. Carreras, maratones, trail running y más.",
  keywords: siteConfig.keywords,
}

export default function EventsPage() {
  return (
    <>
      <section className="container grid items-center gap-6 pb-8 pt-12 md:py-20">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Eventos de Atletismo en Colombia
          </h1>
          <p className="max-w-[800px] text-lg text-accent-foreground">
            Explora todos los eventos de atletismo disponibles en Colombia. 
            Filtra por fecha, ubicación, distancia y categoría para encontrar 
            la carrera perfecta para ti.
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