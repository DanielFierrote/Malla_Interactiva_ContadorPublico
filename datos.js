// Datos de la malla. Si editás desde "Administrar", descargá este archivo de nuevo y reemplazalo en GitHub.
window.MALLA_DATOS = {
  "titulo": "Contador Público",
  "actualizado": 0,
  "anios": [
    {
      "nombre": "Introductorio",
      "cuatrimestres": [
        {
          "nombre": "Materias introductorias",
          "materias": [
            {
              "codigo": "CP01",
              "nombre": "Introducción a la Matemática",
              "requiere": []
            },
            {
              "codigo": "CP02",
              "nombre": "Introducción a la Contabilidad",
              "requiere": []
            }
          ]
        }
      ]
    },
    {
      "nombre": "Primer Año",
      "cuatrimestres": [
        {
          "nombre": "Primer Cuatrimestre",
          "materias": [
            {
              "codigo": "CP03",
              "nombre": "Contabilidad Elemental",
              "requiere": []
            },
            {
              "codigo": "CP04",
              "nombre": "Matemática I",
              "requiere": []
            },
            {
              "codigo": "CP05",
              "nombre": "Administración I",
              "requiere": []
            },
            {
              "codigo": "CP06",
              "nombre": "Introducción a la Economía",
              "requiere": []
            }
          ]
        },
        {
          "nombre": "Segundo Cuatrimestre",
          "materias": [
            {
              "codigo": "CP07",
              "nombre": "Contabilidad Básica",
              "requiere": [
                "CP03"
              ]
            },
            {
              "codigo": "CP08",
              "nombre": "Matemática II",
              "requiere": [
                "CP04"
              ]
            },
            {
              "codigo": "CP09",
              "nombre": "Introducción a las Ciencias Sociales",
              "requiere": []
            },
            {
              "codigo": "CP10",
              "nombre": "Administración II",
              "requiere": [
                "CP05"
              ]
            }
          ]
        }
      ]
    },
    {
      "nombre": "Segundo Año",
      "cuatrimestres": [
        {
          "nombre": "Primer Cuatrimestre",
          "materias": [
            {
              "codigo": "CP11",
              "nombre": "Contabilidad Superior I",
              "requiere": [
                "CP07"
              ]
            },
            {
              "codigo": "CP12",
              "nombre": "Estadística",
              "requiere": [
                "CP08"
              ]
            },
            {
              "codigo": "CP13",
              "nombre": "Derecho Privado",
              "requiere": [
                "CP09"
              ]
            },
            {
              "codigo": "CP14",
              "nombre": "Microeconomía",
              "requiere": [
                "CP06"
              ]
            }
          ]
        },
        {
          "nombre": "Segundo Cuatrimestre",
          "materias": [
            {
              "codigo": "CP15-2",
              "nombre": "Tecnologías de la Información",
              "requiere": [
                "CP10"
              ]
            },
            {
              "codigo": "CP16",
              "nombre": "Contabilidad Superior II",
              "requiere": [
                "CP11"
              ]
            },
            {
              "codigo": "CP17",
              "nombre": "Derecho Público",
              "requiere": [
                "CP13"
              ]
            },
            {
              "codigo": "CP18",
              "nombre": "Macroeconomía",
              "requiere": [
                "CP14"
              ]
            }
          ]
        }
      ]
    },
    {
      "nombre": "Tercer Año",
      "cuatrimestres": [
        {
          "nombre": "Primer Cuatrimestre",
          "materias": [
            {
              "codigo": "CP19",
              "nombre": "Contabilidad Superior III",
              "requiere": [
                "CP16"
              ]
            },
            {
              "codigo": "CP20",
              "nombre": "Finanzas Públicas",
              "requiere": [
                "CP18"
              ]
            },
            {
              "codigo": "CP21",
              "nombre": "Sistemas de Información",
              "requiere": [
                "CP15-2"
              ]
            },
            {
              "codigo": "CP22",
              "nombre": "Cálculo Financiero",
              "requiere": [
                "CP12"
              ]
            }
          ]
        },
        {
          "nombre": "Segundo Cuatrimestre",
          "materias": [
            {
              "codigo": "CP23",
              "nombre": "Derecho Laboral",
              "requiere": [
                "CP17"
              ]
            },
            {
              "codigo": "CP24",
              "nombre": "Administración Financiera",
              "requiere": [
                "CP22"
              ]
            },
            {
              "codigo": "CP25",
              "nombre": "Costos",
              "requiere": [
                "CP19"
              ]
            },
            {
              "codigo": "CP26",
              "nombre": "Historia Económica y Social",
              "requiere": []
            }
          ]
        }
      ]
    },
    {
      "nombre": "Cuarto Año",
      "cuatrimestres": [
        {
          "nombre": "Primer Cuatrimestre",
          "materias": [
            {
              "codigo": "CP27",
              "nombre": "Análisis e Interpretación de Estados Contables",
              "requiere": [
                "CP19"
              ]
            },
            {
              "codigo": "CP28",
              "nombre": "Impuestos I",
              "requiere": [
                "CP20"
              ]
            },
            {
              "codigo": "CP29",
              "nombre": "Derecho Societario",
              "requiere": [
                "CP23"
              ]
            },
            {
              "codigo": "CP30",
              "nombre": "Contabilidad de Gestión",
              "requiere": [
                "CP25"
              ]
            }
          ]
        },
        {
          "nombre": "Segundo Cuatrimestre",
          "materias": [
            {
              "codigo": "CP31",
              "nombre": "Impuestos II",
              "requiere": [
                "CP28"
              ]
            },
            {
              "codigo": "CP32",
              "nombre": "Derecho Concursal",
              "requiere": [
                "CP29"
              ]
            },
            {
              "codigo": "CP33",
              "nombre": "Auditoría I",
              "requiere": [
                "CP19"
              ]
            },
            {
              "codigo": "CP34",
              "nombre": "Contabilidad Gubernamental",
              "requiere": [
                "CP20"
              ]
            }
          ]
        }
      ]
    },
    {
      "nombre": "Quinto Año",
      "cuatrimestres": [
        {
          "nombre": "Primer Cuatrimestre",
          "materias": [
            {
              "codigo": "CP35",
              "nombre": "Auditoría II",
              "requiere": [
                "CP33"
              ]
            },
            {
              "codigo": "CP36",
              "nombre": "Metodología de la Investigación",
              "requiere": []
            },
            {
              "codigo": "CP37",
              "nombre": "Taller de Integración Jurídico Contable",
              "requiere": [
                "CP32"
              ]
            },
            {
              "codigo": "CP38",
              "nombre": "Electiva I",
              "requiere": []
            }
          ]
        },
        {
          "nombre": "Segundo Cuatrimestre",
          "materias": [
            {
              "codigo": "CP39",
              "nombre": "Práctica Profesional",
              "requiere": [
                "CP31",
                "CP35"
              ]
            },
            {
              "codigo": "CP40",
              "nombre": "Seminario Contable",
              "requiere": [
                "CP31",
                "CP35",
                "CP36"
              ]
            },
            {
              "codigo": "CP41",
              "nombre": "Electiva II",
              "requiere": []
            }
          ]
        }
      ]
    }
  ],
  "estado": {
    "CP01": "aprobada",
    "CP02": "aprobada",
    "CP05": "aprobada",
    "CP07": "aprobada",
    "CP03": "aprobada",
    "CP06": "aprobada",
    "CP09": "aprobada",
    "CP04": "aprobada",
    "CP08": "aprobada",
    "CP10": "aprobada",
    "CP11": "aprobada",
    "CP16": "aprobada",
    "CP13": "aprobada",
    "CP17": "aprobada",
    "CP12": "aprobada",
    "CP18": "aprobada",
    "CP14": "aprobada",
    "CP15-2": "aprobada",
    "CP22": "aprobada",
    "CP23": "aprobada",
    "CP21": "aprobada"
  },
  "notas": {
    "CP01": 8,
    "CP02": 7,
    "CP05": 7,
    "CP07": 4,
    "CP03": 7,
    "CP06": 8,
    "CP09": 7,
    "CP04": 6,
    "CP08": 8,
    "CP10": 9,
    "CP11": 8,
    "CP16": 9,
    "CP13": 7,
    "CP17": 7,
    "CP12": 8,
    "CP18": 7,
    "CP14": 8,
    "CP15-2": 10,
    "CP22": 9,
    "CP23": 6,
    "CP21": 9
  }
};
