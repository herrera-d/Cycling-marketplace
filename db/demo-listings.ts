import type { Condition } from "./schema";

export type DemoListing = {
  /** UUID fijo: hace el seed idempotente (`onConflictDoNothing`). */
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  categorySlug: string;
  condition: Condition;
  brand: string;
  size: string | null;
  location: string;
  imageUrl: string;
  /** Desplaza `created_at` hacia atrás para simular antigüedad. */
  ageHours: number;
};

/** UUID del vendedor de demostración (usuario ficticio). */
export const DEMO_SELLER_ID = "00000000-0000-4000-8000-000000000001";

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;

/**
 * Anuncios de demostración para desarrollar el feed (Fase 3).
 *
 * Se eliminan en producción con `npm run db:seed:clear-demo`. Las imágenes son
 * de Unsplash (uso libre) y se sustituirán por Supabase Storage en la Fase 5.
 */
export const DEMO_LISTINGS: DemoListing[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    title: "Trek Emonda SL 6, talla 56, carbono",
    description:
      "Cuadro de carbono OCLV 500, grupo Shimano 105 R7020 y ruedas Bontrager. Poco uso, siempre guardada en interior. Se entrega con pedales y soporte de botella.",
    priceCents: 245000000,
    currency: "ARS",
    categorySlug: "bicicletas",
    condition: "like_new",
    brand: "Trek",
    size: "56",
    location: "Buenos Aires, CABA",
    imageUrl: u("1571019613454-1cb2f99b2d8b"),
    ageHours: 3,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    title: "Grupo Shimano Ultegra R8000, 11v, completo",
    description:
      "Grupo completo: manetas, desviadores, bielas 52/36 (172,5 mm), cassette 11-30 y frenos de llanta. Desmontado de bici nueva, sin uso.",
    priceCents: 89000000,
    currency: "ARS",
    categorySlug: "componentes",
    condition: "new",
    brand: "Shimano",
    size: "172,5 mm",
    location: "Córdoba Capital",
    imageUrl: u("1485965120184-e220f721d03e"),
    ageHours: 7,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    title: "Ruedas Mavic Ksyrium Elite UST, par",
    description:
      "Ruedas tubeless ready, rodamientos recién engrasados. Incluyen cubiertas Yksion de 25 mm con dibujo al 80 %.",
    priceCents: 42000000,
    currency: "ARS",
    categorySlug: "ruedas",
    condition: "good",
    brand: "Mavic",
    size: "700c",
    location: "Rosario, Santa Fe",
    imageUrl: u("1502744688674-c619d1586c9e"),
    ageHours: 26,
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    title: "Casco Giro Aether MIPS, talla M",
    description:
      "Casco tope de gama con MIPS y ventilación Aura. Usado en dos temporadas, sin golpes. Interior lavado y correas en buen estado.",
    priceCents: 18500000,
    currency: "ARS",
    categorySlug: "cascos",
    condition: "good",
    brand: "Giro",
    size: "M",
    location: "La Plata, Buenos Aires",
    imageUrl: u("1558618666-fcd25c85cd64"),
    ageHours: 30,
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    title: "Zapatillas Shimano RC7, talla 43",
    description:
      "Zapatillas de carretera con suela de carbono y cierre BOA. Muy cómodas para salidas largas. Poco uso.",
    priceCents: 12000000,
    currency: "ARS",
    categorySlug: "calzado",
    condition: "like_new",
    brand: "Shimano",
    size: "43",
    location: "Mendoza",
    imageUrl: u("1549298916-b41d501d3772"),
    ageHours: 40,
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    title: "Maillot Castelli Rosso Corsa, talla L",
    description:
      "Maillot de verano en tejido ligero con protección UV. Dos temporadas de uso, sin manchas ni enganches.",
    priceCents: 3500000,
    currency: "ARS",
    categorySlug: "ropa",
    condition: "good",
    brand: "Castelli",
    size: "L",
    location: "Buenos Aires, CABA",
    imageUrl: u("1517649763962-0c623066013b"),
    ageHours: 52,
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    title: "Rodillo inteligente Wahoo KICKR Core",
    description:
      "Rodillo direct-drive con conectividad ANT+ y Bluetooth. Compatible con Zwift y TrainerRoad. Incluye cassette 11-28 y eje pasante.",
    priceCents: 78000000,
    currency: "ARS",
    categorySlug: "entrenamiento",
    condition: "like_new",
    brand: "Wahoo",
    size: null,
    location: "Villa Carlos Paz, Córdoba",
    imageUrl: u("1517836357463-d25dfeac3438"),
    ageHours: 68,
  },
  {
    id: "10000000-0000-4000-8000-000000000008",
    title: "Bomba de pie Topeak JoeBlow Booster",
    description:
      "Bomba con depósito para inflar cubiertas tubeless de un golpe. Manómetro preciso. Manguera y boquillas nuevas.",
    priceCents: 6500000,
    currency: "ARS",
    categorySlug: "herramientas",
    condition: "good",
    brand: "Topeak",
    size: null,
    location: "San Isidro, Buenos Aires",
    imageUrl: u("1504328345606-18bbc8c9d7d1"),
    ageHours: 80,
  },
  {
    id: "10000000-0000-4000-8000-000000000009",
    title: "Culote ASSOS Mille GT, talla M",
    description:
      "Culote con badana MILLE EVO de alta densidad. Ideal para rutas de más de 4 horas. Impecable.",
    priceCents: 9200000,
    currency: "ARS",
    categorySlug: "ropa",
    condition: "like_new",
    brand: "Assos",
    size: "M",
    location: "Mar del Plata",
    imageUrl: u("1486401899868-0e435ed85128"),
    ageHours: 96,
  },
  {
    id: "10000000-0000-4000-8000-00000000000a",
    title: "Manillar + potencia PRO Vibe, 42 cm",
    description:
      "Manillar de aluminio 6066 con potencia de 100 mm. Cableado interno. Desmontado de bici con poco rodaje.",
    priceCents: 4800000,
    currency: "ARS",
    categorySlug: "componentes",
    condition: "good",
    brand: "PRO",
    size: "42 cm / 100 mm",
    location: "Salta",
    imageUrl: u("1511994298241-608e28f14fde"),
    ageHours: 120,
  },
  {
    id: "10000000-0000-4000-8000-00000000000b",
    title: "Specialized Rockhopper Comp, talla M (MTB)",
    description:
      "MTB rígida con horquilla SR Suntour y frenos hidráulicos. Perfecta para iniciarse en el monte. Service reciente.",
    priceCents: 118000000,
    currency: "ARS",
    categorySlug: "bicicletas",
    condition: "good",
    brand: "Specialized",
    size: "M",
    location: "Bariloche, Río Negro",
    imageUrl: u("1571019614242-c5c5dee9f50b"),
    ageHours: 150,
  },
  {
    id: "10000000-0000-4000-8000-00000000000c",
    title: "Ciclocomputadora Garmin Edge 530",
    description:
      "GPS con mapas, navegación y métricas avanzadas. Incluye soporte, cable y sensores de cadencia y velocidad.",
    priceCents: 34000000,
    currency: "ARS",
    categorySlug: "accesorios",
    condition: "good",
    brand: "Garmin",
    size: null,
    location: "Buenos Aires, CABA",
    imageUrl: u("1517649763962-0c623066013b"),
    ageHours: 180,
  },
  {
    id: "10000000-0000-4000-8000-00000000000d",
    title: "Pedales Look Keo Blade Carbon",
    description:
      "Pedales de carretera con hoja de carbono, tensión 12. Rodamientos suaves. Incluyen calas nuevas.",
    priceCents: 11000000,
    currency: "ARS",
    categorySlug: "componentes",
    condition: "like_new",
    brand: "Look",
    size: null,
    location: "Neuquén",
    imageUrl: u("1485965120184-e220f721d03e"),
    ageHours: 210,
  },
  {
    id: "10000000-0000-4000-8000-00000000000e",
    title: "Casco KASK Mojito3, talla L",
    description:
      "Casco ligero y ventilado, muy usado en pelotón. Talla L (58-62 cm). Sin impactos.",
    priceCents: 14500000,
    currency: "ARS",
    categorySlug: "cascos",
    condition: "good",
    brand: "KASK",
    size: "L",
    location: "Santa Fe Capital",
    imageUrl: u("1558618666-fcd25c85cd64"),
    ageHours: 240,
  },
  {
    id: "10000000-0000-4000-8000-00000000000f",
    title: "Ruedas de carbono 50 mm, tubeless",
    description:
      "Par de ruedas de carbono con bujes DT Swiss 350. Excelente rigidez y aerodinámica. Poco rodadas.",
    priceCents: 165000000,
    currency: "ARS",
    categorySlug: "ruedas",
    condition: "like_new",
    brand: "DT Swiss",
    size: "700c",
    location: "Buenos Aires, CABA",
    imageUrl: u("1502744688674-c619d1586c9e"),
    ageHours: 300,
  },
  {
    id: "10000000-0000-4000-8000-000000000010",
    title: "Bicicleta urbana Bianchi C-Sport, talla 50",
    description:
      "Bici híbrida ideal para ciudad, con guardabarros y portaequipaje. Cambio Shimano Altus. Muy cuidada.",
    priceCents: 96000000,
    currency: "ARS",
    categorySlug: "bicicletas",
    condition: "good",
    brand: "Bianchi",
    size: "50",
    location: "Tigre, Buenos Aires",
    imageUrl: u("1571019613454-1cb2f99b2d8b"),
    ageHours: 360,
  },
  {
    id: "10000000-0000-4000-8000-000000000011",
    title: "Mochila de hidratación CamelBak Chase, 2 L",
    description:
      "Mochila de trail con vejiga de 2 litros, bolsillos y soporte de casco. Higienizada.",
    priceCents: 4200000,
    currency: "ARS",
    categorySlug: "accesorios",
    condition: "good",
    brand: "CamelBak",
    size: null,
    location: "Ushuaia, Tierra del Fuego",
    imageUrl: u("1553062407-98eeb64c6a62"),
    ageHours: 420,
  },
  {
    id: "10000000-0000-4000-8000-000000000012",
    title: "Zapatillas Giro Empire ACC, talla 42",
    description:
      "Zapatillas de carretera con suela de carbono y cordones. Ligeras y rígidas. Poco uso.",
    priceCents: 13500000,
    currency: "ARS",
    categorySlug: "calzado",
    condition: "like_new",
    brand: "Giro",
    size: "42",
    location: "Córdoba Capital",
    imageUrl: u("1549298916-b41d501d3772"),
    ageHours: 470,
  },
  {
    id: "10000000-0000-4000-8000-000000000013",
    title: "Cadena y cassette SRAM Rival 12v",
    description:
      "Cassette 10-36 y cadena Rival AXS con menos de 500 km. Compatible con grupos AXS de 12 velocidades.",
    priceCents: 8500000,
    currency: "ARS",
    categorySlug: "componentes",
    condition: "good",
    brand: "SRAM",
    size: "10-36",
    location: "Mendoza",
    imageUrl: u("1485965120184-e220f721d03e"),
    ageHours: 520,
  },
  {
    id: "10000000-0000-4000-8000-000000000014",
    title: "Banco de trabajo Park Tool PCS-9",
    description:
      "Banco de trabajo plegable con pinza de 360°. Estable y robusto para cualquier service en casa.",
    priceCents: 21000000,
    currency: "ARS",
    categorySlug: "herramientas",
    condition: "good",
    brand: "Park Tool",
    size: null,
    location: "Buenos Aires, CABA",
    imageUrl: u("1504328345606-18bbc8c9d7d1"),
    ageHours: 560,
  },
  {
    id: "10000000-0000-4000-8000-000000000015",
    title: "Bicicleta de ruta Colnago, acero Columbus",
    description:
      "Clásico de acero con grupo Campagnolo y ruedas de perfil bajo. Pieza de colección en excelente estado.",
    priceCents: 480000000,
    currency: "ARS",
    categorySlug: "bicicletas",
    condition: "good",
    brand: "Colnago",
    size: "54",
    location: "Buenos Aires, CABA",
    imageUrl: u("1571019613454-1cb2f99b2d8b"),
    ageHours: 620,
  },
  {
    id: "10000000-0000-4000-8000-000000000016",
    title: "Gafas de sol Oakley Sutro Prizm",
    description:
      "Lente Prizm Road, ideal para carretera. Montura ligera O Matter. Incluye estuche y lente extra.",
    priceCents: 16500000,
    currency: "ARS",
    categorySlug: "accesorios",
    condition: "like_new",
    brand: "Oakley",
    size: null,
    location: "Rosario, Santa Fe",
    imageUrl: u("1511499767150-a48a237f0083"),
    ageHours: 700,
  },
  {
    id: "10000000-0000-4000-8000-000000000017",
    title: "Rueda trasera Zipp 404 Firecrest",
    description:
      "Rueda trasera de carbono de 58 mm con buje Zipp 76D. Tubeless ready. Frenos de disco centerlock.",
    priceCents: 210000000,
    currency: "ARS",
    categorySlug: "ruedas",
    condition: "like_new",
    brand: "Zipp",
    size: "700c",
    location: "Bariloche, Río Negro",
    imageUrl: u("1502744688674-c619d1586c9e"),
    ageHours: 760,
  },
  {
    id: "10000000-0000-4000-8000-000000000018",
    title: "Maillot + culote Gobik conjunto, talla S",
    description:
      "Conjunto de verano en tejido con UPF 50. Badana de alta gama. Usado una temporada, impecable.",
    priceCents: 7800000,
    currency: "ARS",
    categorySlug: "ropa",
    condition: "like_new",
    brand: "Gobik",
    size: "S",
    location: "Valencia (envío)",
    imageUrl: u("1517649763962-0c623066013b"),
    ageHours: 820,
  },
  {
    id: "10000000-0000-4000-8000-000000000019",
    title: "Sillín Fizik Antares Versus Evo R3",
    description:
      "Sillín de carretera con canal central y raíles de Kium. Ancho 139 mm. Muy cómodo.",
    priceCents: 12500000,
    currency: "ARS",
    categorySlug: "componentes",
    condition: "good",
    brand: "Fizik",
    size: "139 mm",
    location: "La Plata, Buenos Aires",
    imageUrl: u("1485965120184-e220f721d03e"),
    ageHours: 900,
  },
  {
    id: "10000000-0000-4000-8000-00000000001a",
    title: "Cuentakilómetros inalámbrico Cateye",
    description:
      "Ciclocomputadora inalámbrica con velocidad, distancia y cadencia. Sensor y soporte incluidos.",
    priceCents: 3200000,
    currency: "ARS",
    categorySlug: "accesorios",
    condition: "good",
    brand: "Cateye",
    size: null,
    location: "Salta",
    imageUrl: u("1517649763962-0c623066013b"),
    ageHours: 980,
  },
  {
    id: "10000000-0000-4000-8000-00000000001b",
    title: "Bicicleta gravel Giant Revolt 2, talla M",
    description:
      "Gravel de aluminio con horquilla de carbono y cubiertas de 40 mm. Ideal para mixto asfalto/tierra.",
    priceCents: 172000000,
    currency: "ARS",
    categorySlug: "bicicletas",
    condition: "good",
    brand: "Giant",
    size: "M",
    location: "Mendoza",
    imageUrl: u("1571019613454-1cb2f99b2d8b"),
    ageHours: 1050,
  },
];
