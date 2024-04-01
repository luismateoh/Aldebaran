import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Circle,
  LucideProps,
  MapPin,
  Moon,
  Mountain,
  SquarePlus,
  SunMedium,
  Twitter,
  X,
} from "lucide-react"

export const Icons = {
  sun: SunMedium,
  moon: Moon,
  twitter: Twitter,
  mountain: Mountain,
  marker: MapPin,
  calendar: Calendar,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronsLeft: ChevronsLeft,
  chevronsRight: ChevronsRight,
  check: Check,
  squarePlus: SquarePlus,
  cross: X,

  logo: (props: LucideProps) => (
    <svg viewBox="0 0 375 375" height="1em" {...props}>
      <defs>
        <clipPath id="a">
          <path fill="currentColor" d="M67 162.48h80.1v21H67Zm0 0" />
        </clipPath>
        <clipPath id="b">
          <path fill="currentColor" d="M35.13 193.84h111.96v21H35.12Zm0 0" />
        </clipPath>
        <clipPath id="c">
          <path fill="currentColor" d="M4.9 225.28h142.2v21H4.9Zm0 0" />
        </clipPath>
      </defs>
      <path
        fill="currentColor"
        d="M253.42 248.14c-4.63 3.68-10.44 6.64-17.4 8.88a66.77 66.77 0 0 1-20.52 3.36c-18.24 0-32.68-4.92-43.33-14.75-10.63-9.85-15.95-23.4-15.95-40.7 0-11.2 2.6-21 7.8-29.4a51.87 51.87 0 0 1 20.51-19.2 58.55 58.55 0 0 1 27.38-6.6c17.43 0 31.6 4.63 42.48 13.91l-16.33 21.61a36.2 36.2 0 0 0-23.04-8.15c-7.04 0-13 2.64-17.88 7.92-4.89 5.28-7.33 11.92-7.33 19.92 0 8 2.64 14.68 7.92 20.05 5.29 5.35 12.17 8.03 20.66 8.03 7.35 0 13.43-2 18.24-6Zm0 0"
      />
      <path
        fill="currentColor"
        d="M246.47 203.74c0-10.72 2.52-20.32 7.56-28.8 5.04-8.49 12.16-15.17 21.36-20.05 9.2-4.88 19.64-7.33 31.33-7.33 11.68 0 21.95 2.45 30.83 7.33a51.52 51.52 0 0 1 20.53 20.05c4.8 8.48 7.2 18.08 7.2 28.8 0 10.71-2.4 20.4-7.2 29.04a51.18 51.18 0 0 1-20.53 20.28c-8.88 4.88-19.31 7.32-31.31 7.32-11.7 0-22.06-2.28-31.1-6.83a50.46 50.46 0 0 1-21.1-19.56c-5.05-8.5-7.57-18.57-7.57-30.25Zm33.84.23c0 8.32 2.4 15.25 7.2 20.77a23.11 23.11 0 0 0 18.24 8.28c7.69 0 13.9-2.72 18.61-8.16 4.72-5.44 7.08-12.4 7.08-20.89 0-8.48-2.36-15.44-7.08-20.87-4.72-5.45-10.92-8.18-18.6-8.18a23.12 23.12 0 0 0-18.24 8.28c-4.8 5.53-7.2 12.45-7.2 20.77Zm0 0"
      />
      <g clipPath="url(#a)">
        <path fill="currentColor" d="M67 162.48h80.07v21H66.99Zm0 0" />
      </g>
      <g clipPath="url(#b)">
        <path fill="currentColor" d="M35.13 193.84h112v21h-112Zm0 0" />
      </g>
      <g clipPath="url(#c)">
        <path fill="currentColor" d="M4.9 225.28h142.19v21H4.89Zm0 0" />
      </g>
    </svg>
  ),
  gitHub: (props: LucideProps) => (
    <svg viewBox="0 0 438.549 438.549" {...props}>
      <path
        fill="currentColor"
        d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
      ></path>
    </svg>
  ),
  apple: (props: LucideProps) => (
    <svg viewBox="0 0 256 315" {...props}>
      <path
        fill="currentColor"
        d="M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.615c-.35 1.116-6.599 22.563-21.757 44.716c-13.104 19.153-26.705 38.235-48.13 38.63c-21.05.388-27.82-12.483-51.888-12.483c-24.061 0-31.582 12.088-51.51 12.871c-20.68.783-36.428-20.71-49.64-39.793c-27-39.033-47.633-110.3-19.928-158.406c13.763-23.89 38.36-39.017 65.056-39.405c20.307-.387 39.475 13.662 51.889 13.662c12.406 0 35.699-16.895 60.186-14.414c10.25.427 39.026 4.14 57.503 31.186c-1.49.923-34.335 20.044-33.978 59.822M174.24 50.199c10.98-13.29 18.369-31.79 16.353-50.199c-15.826.636-34.962 10.546-46.314 23.828c-10.173 11.763-19.082 30.589-16.678 48.633c17.64 1.365 35.66-8.964 46.64-22.262"
      ></path>
    </svg>
  ),
  googleCalendar: (props: LucideProps) => (
    <svg viewBox="0 0 256 256" {...props}>
      <path fill="#fff" d="M195.368 60.632H60.632v134.736h134.736z"></path>
      <path
        fill="#ea4335"
        d="M195.368 256L256 195.368l-30.316-5.172l-30.316 5.172l-5.533 27.73z"
      ></path>
      <path
        fill="#188038"
        d="M0 195.368v40.421C0 246.956 9.044 256 20.21 256h40.422l6.225-30.316l-6.225-30.316l-33.033-5.172z"
      ></path>
      <path
        fill="#1967d2"
        d="M256 60.632V20.21C256 9.044 246.956 0 235.79 0h-40.422c-3.688 15.036-5.533 26.101-5.533 33.196c0 7.094 1.845 16.24 5.533 27.436c13.41 3.84 23.515 5.76 30.316 5.76c6.801 0 16.906-1.92 30.316-5.76"
      ></path>
      <path fill="#fbbc04" d="M256 60.632h-60.632v134.736H256z"></path>
      <path fill="#34a853" d="M195.368 195.368H60.632V256h134.736z"></path>
      <path
        fill="#4285f4"
        d="M195.368 0H20.211C9.044 0 0 9.044 0 20.21v175.158h60.632V60.632h134.736z"
      ></path>
      <path
        fill="#4285f4"
        d="M88.27 165.154c-5.036-3.402-8.523-8.37-10.426-14.94l11.689-4.816c1.06 4.042 2.913 7.175 5.558 9.398c2.627 2.223 5.827 3.318 9.566 3.318c3.823 0 7.107-1.162 9.852-3.487c2.746-2.324 4.127-5.288 4.127-8.875c0-3.672-1.449-6.67-4.345-8.994c-2.897-2.324-6.535-3.486-10.88-3.486h-6.754v-11.57h6.063c3.739 0 6.888-1.011 9.448-3.033c2.56-2.02 3.84-4.783 3.84-8.303c0-3.132-1.145-5.625-3.435-7.494c-2.29-1.87-5.188-2.813-8.708-2.813c-3.436 0-6.164.91-8.185 2.745a16.115 16.115 0 0 0-4.413 6.754l-11.57-4.817c1.532-4.345 4.345-8.185 8.471-11.503c4.127-3.318 9.398-4.985 15.798-4.985c4.733 0 8.994.91 12.767 2.745c3.772 1.836 6.736 4.379 8.875 7.613c2.14 3.25 3.2 6.888 3.2 10.93c0 4.126-.993 7.613-2.98 10.476c-1.988 2.863-4.43 5.052-7.327 6.585v.69a22.248 22.248 0 0 1 9.398 7.327c2.442 3.284 3.672 7.208 3.672 11.79c0 4.58-1.163 8.673-3.487 12.26c-2.324 3.588-5.54 6.417-9.617 8.472c-4.092 2.055-8.69 3.1-13.793 3.1c-5.912.016-11.369-1.685-16.405-5.087m71.797-58.005l-12.833 9.28l-6.417-9.734l23.023-16.607h8.825v78.333h-12.598z"
      ></path>
    </svg>
  ),
  yahoo: (props: LucideProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M10.5 7.59L8.16 13.2L5.85 7.59H2l4.29 9.64l-1.54 3.47H8.5l5.74-13.11zm4.5 5.14c-1.37 0-2.41 1.04-2.41 2.27c0 1.17 1 2.16 2.34 2.16c1.39 0 2.43-1.03 2.43-2.26c0-1.21-1-2.17-2.36-2.17m2.72-9.43l-3.83 8.59h4.28L22 3.3z"
      ></path>
    </svg>
  ),
  microsoftTeams: (props: LucideProps) => (
    <svg viewBox="0 0 256 239" {...props}>
      <defs>
        <linearGradient
          id="logosMicrosoftTeams0"
          x1="17.372%"
          x2="82.628%"
          y1="-6.51%"
          y2="106.51%"
        >
          <stop offset="0%" stopColor="#5a62c3"></stop>
          <stop offset="50%" stopColor="#4d55bd"></stop>
          <stop offset="100%" stopColor="#3940ab"></stop>
        </linearGradient>
        <path
          id="logosMicrosoftTeams1"
          d="M136.93 64.476v12.8a32.674 32.674 0 0 1-5.953-.952a38.698 38.698 0 0 1-26.79-22.742h21.848c6.008.022 10.872 4.887 10.895 10.894"
        ></path>
      </defs>
      <path
        fill="#5059c9"
        d="M178.563 89.302h66.125c6.248 0 11.312 5.065 11.312 11.312v60.231c0 22.96-18.613 41.574-41.573 41.574h-.197c-22.96.003-41.576-18.607-41.579-41.568V95.215a5.912 5.912 0 0 1 5.912-5.913"
      ></path>
      <circle cx={223.256} cy={50.605} r={26.791} fill="#5059c9"></circle>
      <circle cx={139.907} cy={38.698} r={38.698} fill="#7b83eb"></circle>
      <path
        fill="#7b83eb"
        d="M191.506 89.302H82.355c-6.173.153-11.056 5.276-10.913 11.449v68.697c-.862 37.044 28.445 67.785 65.488 68.692c37.043-.907 66.35-31.648 65.489-68.692v-68.697c.143-6.173-4.74-11.296-10.913-11.449"
      ></path>
      <path
        d="M142.884 89.302v96.268a10.96 10.96 0 0 1-6.787 10.062c-1.3.55-2.697.833-4.108.833H76.68c-.774-1.965-1.488-3.93-2.084-5.953a72.509 72.509 0 0 1-3.155-21.076v-68.703c-.143-6.163 4.732-11.278 10.895-11.43z"
        opacity={0.1}
      ></path>
      <path
        d="M136.93 89.302v102.222c0 1.411-.283 2.808-.833 4.108a10.96 10.96 0 0 1-10.062 6.787H79.48c-1.012-1.965-1.965-3.93-2.798-5.954a59.049 59.049 0 0 1-2.084-5.953a72.508 72.508 0 0 1-3.155-21.076v-68.703c-.143-6.163 4.732-11.278 10.895-11.43z"
        opacity={0.2}
      ></path>
      <path
        d="M136.93 89.302v90.315c-.045 5.998-4.896 10.85-10.895 10.895H74.597a72.508 72.508 0 0 1-3.155-21.076v-68.703c-.143-6.163 4.732-11.278 10.895-11.43z"
        opacity={0.2}
      ></path>
      <path
        d="M130.977 89.302v90.315c-.046 5.998-4.897 10.85-10.895 10.895H74.597a72.508 72.508 0 0 1-3.155-21.076v-68.703c-.143-6.163 4.732-11.278 10.895-11.43z"
        opacity={0.2}
      ></path>
      <path
        d="M142.884 58.523v18.753c-1.012.06-1.965.12-2.977.12c-1.012 0-1.965-.06-2.977-.12a32.674 32.674 0 0 1-5.953-.952a38.698 38.698 0 0 1-26.791-22.742a33.082 33.082 0 0 1-1.905-5.954h29.708c6.007.023 10.872 4.887 10.895 10.895"
        opacity={0.1}
      ></path>
      <use href="#logosMicrosoftTeams1" opacity={0.2}></use>
      <use href="#logosMicrosoftTeams1" opacity={0.2}></use>
      <path
        d="M130.977 64.476v11.848a38.698 38.698 0 0 1-26.791-22.743h15.896c6.008.023 10.872 4.888 10.895 10.895"
        opacity={0.2}
      ></path>
      <path
        fill="url(#logosMicrosoftTeams0)"
        d="M10.913 53.581h109.15c6.028 0 10.914 4.886 10.914 10.913v109.151c0 6.027-4.886 10.913-10.913 10.913H10.913C4.886 184.558 0 179.672 0 173.645V64.495C0 58.466 4.886 53.58 10.913 53.58"
      ></path>
      <path
        fill="#fff"
        d="M94.208 95.125h-21.82v59.416H58.487V95.125H36.769V83.599h57.439z"
      ></path>
    </svg>
  ),
  outlook: (props: LucideProps) => (
    <svg viewBox="0 0 32 32" {...props}>
      <path
        fill="#0072c6"
        d="M19.484 7.937v5.477l1.916 1.205a.489.489 0 0 0 .21 0l8.238-5.554a1.174 1.174 0 0 0-.959-1.128Z"
      ></path>
      <path
        fill="#0072c6"
        d="m19.484 15.457l1.747 1.2a.522.522 0 0 0 .543 0c-.3.181 8.073-5.378 8.073-5.378v10.066a1.408 1.408 0 0 1-1.49 1.555h-8.874zm-9.044-2.525a1.609 1.609 0 0 0-1.42.838a4.131 4.131 0 0 0-.526 2.218A4.05 4.05 0 0 0 9.02 18.2a1.6 1.6 0 0 0 2.771.022a4.014 4.014 0 0 0 .515-2.2a4.369 4.369 0 0 0-.5-2.281a1.536 1.536 0 0 0-1.366-.809"
      ></path>
      <path
        fill="#0072c6"
        d="M2.153 5.155v21.427L18.453 30V2Zm10.908 14.336a3.231 3.231 0 0 1-2.7 1.361a3.19 3.19 0 0 1-2.64-1.318A5.459 5.459 0 0 1 6.706 16.1a5.868 5.868 0 0 1 1.036-3.616a3.267 3.267 0 0 1 2.744-1.384a3.116 3.116 0 0 1 2.61 1.321a5.639 5.639 0 0 1 1 3.484a5.763 5.763 0 0 1-1.035 3.586"
      ></path>
    </svg>
  ),
  office365: (props: LucideProps) => (
    <svg
      viewBox="0 -9.2 960 1074.5000000000002"
      width="2215"
      height="2500"
      {...props}
    >
      <radialGradient
        id="a"
        cx="322"
        cy="207.3"
        gradientUnits="userSpaceOnUse"
        r="800.8"
      >
        <stop offset=".064" stopColor="#ae7fe2" />
        <stop offset="1" stopColor="#0078d4" />
      </radialGradient>
      <linearGradient
        id="b"
        gradientUnits="userSpaceOnUse"
        x1="324.3"
        x2="210"
        y1="860.8"
        y2="663.2"
      >
        <stop offset="0" stopColor="#114a8b" />
        <stop offset="1" stopColor="#0078d4" stopOpacity="0" />
      </linearGradient>
      <radialGradient
        id="c"
        cx="154.3"
        cy="824.4"
        gradientUnits="userSpaceOnUse"
        r="745.2"
      >
        <stop offset=".134" stopColor="#d59dff" />
        <stop offset="1" stopColor="#5e438f" />
      </radialGradient>
      <linearGradient
        id="d"
        gradientUnits="userSpaceOnUse"
        x1="872.6"
        x2="750.1"
        y1="561"
        y2="736.6"
      >
        <stop offset="0" stopColor="#493474" />
        <stop offset="1" stopColor="#8c66ba" stopOpacity="0" />
      </linearGradient>
      <radialGradient
        id="e"
        cx="889.3"
        cy="588.1"
        gradientUnits="userSpaceOnUse"
        r="598.1"
      >
        <stop offset=".058" stopColor="#50e6ff" />
        <stop offset="1" stopColor="#436dcd" />
      </radialGradient>
      <linearGradient
        id="f"
        gradientUnits="userSpaceOnUse"
        x1="311.4"
        x2="491.7"
        y1="25.4"
        y2="25.4"
      >
        <stop offset="0" stopColor="#2d3f80" />
        <stop offset="1" stopColor="#436dcd" stopOpacity="0" />
      </linearGradient>
      <path
        d="M386 24.6l-5.4 3.3c-8.5 5.2-16.6 11-24.2 17.3L372 34.3h132L528 216 408 336l-120 83.4v96.2c0 67.2 35.1 129.5 92.6 164.2l126.3 76.5L240 912h-51.5l-95.9-58.1C35.1 819.1 0 756.9 0 689.7V366.3C0 299.1 35.1 236.7 92.6 202l288-174.2q2.7-1.7 5.4-3.2z"
        fill="url(#a)"
      />
      <path
        d="M386 24.6l-5.4 3.3c-8.5 5.2-16.6 11-24.2 17.3L372 34.3h132L528 216 408 336l-120 83.4v96.2c0 67.2 35.1 129.5 92.6 164.2l126.3 76.5L240 912h-51.5l-95.9-58.1C35.1 819.1 0 756.9 0 689.7V366.3C0 299.1 35.1 236.7 92.6 202l288-174.2q2.7-1.7 5.4-3.2z"
        fill="url(#b)"
      />
      <path
        d="M936 576l24 36v77.7c0 67.1-35.1 129.4-92.6 164.2l-288 174.4c-61.1 37-137.7 37-198.8 0L99.3 858c59.9 33.1 133.2 31.8 192.1-3.9l288-174.3C636.9 645 672 582.7 672 515.5V408z"
        fill="url(#c)"
      />
      <path
        d="M936 576l24 36v77.7c0 67.1-35.1 129.4-92.6 164.2l-288 174.4c-61.1 37-137.7 37-198.8 0L99.3 858c59.9 33.1 133.2 31.8 192.1-3.9l288-174.3C636.9 645 672 582.7 672 515.5V408z"
        fill="url(#d)"
      />
      <path
        d="M960 366.3v323.4q0 3.1-.1 6.3c-2.1-64.8-36.8-124.3-92.5-158l-288-174.2c-61.1-37-137.7-37-198.8 0l-92.6 56V192.2c0-67.2 35.1-129.5 92.6-164.3l5.7-3.5C446.5-9.2 520.2-8 579.4 27.8l288 174.2c57.5 34.7 92.6 97.1 92.6 164.3z"
        fill="url(#e)"
      />
      <path
        d="M960 366.3v323.4q0 3.1-.1 6.3c-2.1-64.8-36.8-124.3-92.5-158l-288-174.2c-61.1-37-137.7-37-198.8 0l-92.6 56V192.2c0-67.2 35.1-129.5 92.6-164.3l5.7-3.5C446.5-9.2 520.2-8 579.4 27.8l288 174.2c57.5 34.7 92.6 97.1 92.6 164.3z"
        fill="url(#f)"
      />
    </svg>
  ),
  aol: (props: LucideProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M13.07 9.334c2.526 0 3.74 1.997 3.74 3.706c0 1.709-1.214 3.706-3.74 3.706c-2.527 0-3.74-1.997-3.74-3.706c0-1.709 1.213-3.706 3.74-3.706m0 5.465c.9 0 1.663-.741 1.663-1.759c0-1.018-.763-1.759-1.663-1.759s-1.664.741-1.664 1.759c0 1.018.764 1.76 1.664 1.76m4.913-7.546h2.104v9.298h-2.104zm4.618 6.567a1.398 1.398 0 1 0 .002 2.796a1.398 1.398 0 0 0-.002-2.796M5.536 7.254H3.662L0 16.55h2.482l.49-1.343h3.23l.452 1.343H9.16zm-1.91 6.068L4.6 10.08l.974 3.242z"
      ></path>
    </svg>
  ),
}
