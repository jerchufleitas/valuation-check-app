export const ncmData = [
  {
    id: "SEC-I",
    code: "SECCIÓN I",
    name: "ANIMALES VIVOS Y PRODUCTOS DEL REINO ANIMAL",
    children: [
      {
        id: "CH-01",
        code: "01",
        name: "Animales vivos",
        children: [
          { id: "POS-01.01", code: "01.01", name: "Caballos, asnos, mulos y burdéganos, vivos." },
          { id: "POS-01.02", code: "01.02", name: "Animales vivos de la especie bovina." }
        ]
      }
    ]
  },
  {
    id: "SEC-XVI",
    code: "SECCIÓN XVI",
    name: "MÁQUINAS Y APARATOS, MATERIAL ELÉCTRICO Y SUS PARTES",
    children: [
      {
        id: "CH-84",
        code: "84",
        name: "Reactores nucleares, calderas, máquinas, aparatos y artefactos mecánicos; partes de estas máquinas o aparatos",
        children: [
          { id: "POS-84.71", code: "84.71", name: "Máquinas automáticas para tratamiento o procesamiento de datos (Computadoras)." }
        ]
      }
    ]
  },
  {
    id: "SEC-XVII",
    code: "SECCIÓN XVII",
    name: "MATERIAL DE TRANSPORTE",
    children: [
      {
        id: "CH-88",
        code: "88",
        name: "Aeronavegación, astronavegación y sus partes",
        children: [
          { 
            id: "POS-88.06", 
            code: "88.06", 
            name: "Aeronaves no tripuladas (Drones).",
            keywords: ["drone", "dron", "cuadricoptero", "uav", "aeronave no tripulada"]
          },
          { id: "POS-88.07", code: "88.07", name: "Partes de los aparatos de las partidas 88.01, 88.02 u 88.06." }
        ]
      }
    ]
  }
];
