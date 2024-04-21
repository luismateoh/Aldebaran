import Link from "next/link"

export default function SeeAllEventsCta() {
  return (
    <div className="mt-12 flex flex-col flex-wrap justify-center gap-2 overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm sm:p-3 md:col-span-1 md:row-span-2 md:p-4">
      <div className="z-20 mx-auto w-full gap-2 space-y-4 px-3 py-6 sm:px-4 md:px-6 md:py-12 lg:flex lg:items-center lg:justify-between lg:px-8 lg:py-16">
        <h3 className="bg-gradient-to-br from-green-400 to-blue-600 bg-clip-text text-3xl font-extrabold text-transparent">
          <span className="">¡Descubre más carreras!</span>
          <span className="block text-[20px] leading-5 text-black dark:text-white">
            Explora otros emocionantes eventos{" "}
            <br className="hidden lg:block" /> cercanos a ti.
          </span>
        </h3>
        <div>
          <Link
            href="/"
            className="group relative inline-block rounded px-5 py-2.5 font-medium text-white"
          >
            <span className="absolute left-0 top-0 size-full rounded bg-gradient-to-br from-green-400 to-blue-600 opacity-50 blur-sm"></span>
            <span className="absolute inset-0 ml-0.5 mt-0.5 size-full rounded bg-gradient-to-br from-green-400 to-blue-600 opacity-50 group-active:opacity-0"></span>
            <span className="absolute inset-0 size-full rounded bg-gradient-to-br from-green-400 to-blue-600  shadow-xl transition-all duration-200 ease-out group-hover:blur-sm group-active:opacity-0"></span>
            <span className="absolute inset-0 size-full rounded bg-gradient-to-br from-green-400 to-blue-600 transition duration-200 ease-out"></span>
            <span className="relative">Ver más eventos</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
