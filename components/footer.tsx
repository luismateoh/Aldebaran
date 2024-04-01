import Link from "next/link"

import { Icons } from "./icons"

export default function Footer() {
  return (
    <footer className="bg-secondary mt-16">
      <div className="relative mx-auto max-w-screen-xl px-4 pt-8 pb-2 sm:px-6 lg:px-8 lg:pt-10">
        <div className="lg:flex lg:items-end lg:justify-between">
          <div>
            <div className="flex justify-center lg:justify-start">
              <Icons.logo className="h-20" />
            </div>

            <p className="mx-auto max-w-full text-center text-xs font-light leading-relaxed text-gray-500 dark:text-gray-400 lg:text-left">
              *Aldebaran es una plataforma dedicada a la promoción y divulgación
              deportiva en Colombia. No somos organizadores ni responsables de
              los eventos listados en este sitio. Nuestro objetivo es brindarte
              información actualizada sobre las emocionantes carreras de
              atletismo en todo el país, para que puedas participar y disfrutar
              al máximo de tu pasión por el running. Recuerda siempre verificar
              los detalles de cada evento directamente con los organizadores.
              ¡Corre seguro, corre con pasión con Aldebaran!
            </p>
          </div>
        </div>
        <div className="border-t border-gray-300 mt-6 md:mb-1 sm:pb-4">
          <div className="text-center md:flex md:justify-between md:text-left">
            <p className="flex mt-3 text-center text-sm text-gray-500 lg:text-right dark:text-gray-400">
              Aldebaran · Site by{" "}
              <Link
                href="https://www.linkedin.com/in/luismateoh/"
                className="items-center flex justify-center text-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="bg-blue-900 align-middle py-1 mx-1 hover:animate-spin w-5 rounded-sm text-[9px] text-white w-3">
                  <p className="-m-1 align-middle">LM</p>
                </div>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}