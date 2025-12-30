# Proyecto 2 - OLC2 VD

# estructura basica del proyecto 
```bash
InsightCluster/
├── data/
│   └── nltk_data/
│       ├── corpora/
│       └── tokenizers/
├── docs/
│   └── README.md
├── entrenamiento/
│   ├── __init__.py
│   └── entrenamiento.py
├── procesamiento/
│   ├── __init__.py
│   ├── limpieza_datos.py
│   └── normalizacion_texto.py
├── reportes/
│   ├── __init__.py
│   └── reportes.py
├── utils/
│   ├── __init__.py
│   └── nltk_utils.py
└── app.py
```

# Endpoint entrenar
`http://127.0.0.1:5000/entrenar POST`

que espera 
```json
{
  "n_clusters": 5,
  "random_state": 42,
  "n_init": 20,
  "k_max": 12
}
```
retorna
```json
{
    "mensaje": "Entrenamiento K-Means completado exitosamente",
    "resultado": {
        "analisis_reseñas_por_cluster": {
            "0": {
                "cantidad_reseñas": 185,
                "palabras_frecuentes": [
                    [
                        "aunque",
                        87
                    ],
                    [
                        "bien",
                        48
                    ],
                    [
                        "agradable",
                        35
                    ],
                    [
                        "mayor",
                        32
                    ],
                    [
                        "cumple",
                        32
                    ],
                    [
                        "producto",
                        31
                    ],
                    [
                        "diario",
                        31
                    ],
                    [
                        "sabor",
                        24
                    ],
                    [
                        "aceptable",
                        24
                    ],
                    [
                        "textura",
                        24
                    ]
                ]
            },
            "1": {
                "cantidad_reseñas": 224,
                "palabras_frecuentes": [
                    [
                        "aunque",
                        89
                    ],
                    [
                        "bien",
                        47
                    ],
                    [
                        "producto",
                        42
                    ],
                    [
                        "diario",
                        42
                    ],
                    [
                        "uso",
                        38
                    ],
                    [
                        "cumple",
                        38
                    ],
                    [
                        "experiencia",
                        35
                    ],
                    [
                        "mayor",
                        29
                    ],
                    [
                        "atención",
                        29
                    ],
                    [
                        "podría",
                        28
                    ]
                ]
            },
            "2": {
                "cantidad_reseñas": 193,
                "palabras_frecuentes": [
                    [
                        "aunque",
                        90
                    ],
                    [
                        "bien",
                        44
                    ],
                    [
                        "mayor",
                        33
                    ],
                    [
                        "experiencia",
                        31
                    ],
                    [
                        "atención",
                        31
                    ],
                    [
                        "podría",
                        31
                    ],
                    [
                        "agradable",
                        30
                    ],
                    [
                        "uso",
                        26
                    ],
                    [
                        "producto",
                        25
                    ],
                    [
                        "diario",
                        25
                    ]
                ]
            },
            "3": {
                "cantidad_reseñas": 202,
                "palabras_frecuentes": [
                    [
                        "aunque",
                        93
                    ],
                    [
                        "bien",
                        38
                    ],
                    [
                        "producto",
                        37
                    ],
                    [
                        "uso",
                        37
                    ],
                    [
                        "diario",
                        37
                    ],
                    [
                        "podría",
                        31
                    ],
                    [
                        "agradable",
                        30
                    ],
                    [
                        "experiencia",
                        30
                    ],
                    [
                        "mayor",
                        28
                    ],
                    [
                        "electrónico",
                        24
                    ]
                ]
            },
            "4": {
                "cantidad_reseñas": 196,
                "palabras_frecuentes": [
                    [
                        "aunque",
                        82
                    ],
                    [
                        "bien",
                        41
                    ],
                    [
                        "uso",
                        39
                    ],
                    [
                        "producto",
                        36
                    ],
                    [
                        "diario",
                        36
                    ],
                    [
                        "cumple",
                        33
                    ],
                    [
                        "podría",
                        32
                    ],
                    [
                        "experiencia",
                        31
                    ],
                    [
                        "mayor",
                        30
                    ],
                    [
                        "agradable",
                        25
                    ]
                ]
            }
        },
        "descripcion_segmentos": {
            "0": "Segmento 0: clientes con frecuencia promedio de 59.1 compras, gasto total promedio de $4583, y recencia de 175 días.",
            "1": "Segmento 1: clientes con frecuencia promedio de 76.3 compras, gasto total promedio de $15304, y recencia de 150 días.",
            "2": "Segmento 2: clientes con frecuencia promedio de 31.6 compras, gasto total promedio de $9782, y recencia de 224 días.",
            "3": "Segmento 3: clientes con frecuencia promedio de 24.0 compras, gasto total promedio de $13359, y recencia de 157 días.",
            "4": "Segmento 4: clientes con frecuencia promedio de 63.1 compras, gasto total promedio de $6868, y recencia de 220 días."
        },
        "distribucion_clusters": {
            "0": 185,
            "1": 224,
            "2": 193,
            "3": 202,
            "4": 196
        },
        "metodo_codo": {
            "inercia": [
                6000.000000000001,
                5221.039331638653,
                4721.707627497294,
                4340.072008196583,
                4017.771642412765,
                3759.625462484416,
                3516.9064575123803,
                3364.6825215653926,
                3206.037244735255,
                3092.8655694110416,
                2971.0104060369613,
                2882.714702129101
            ],
            "k": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
            ]
        },
        "metodo_silueta": {
            "k": [
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
            ],
            "silueta": [
                0.1271224602202103,
                0.11962126761173345,
                0.12182828175476405,
                0.1292737356572348,
                0.13097030825820294,
                0.13675305287840955,
                0.13793706977868522,
                0.14038065948897901,
                0.13841161547343517,
                0.14038241834291598,
                0.13992498854336516
            ]
        },
        "metricas_finales": {
            "calinski_harabasz": 122.72,
            "davies_bouldin": 1.8482,
            "silhouette_score": 0.1293
        },
        "parametros_usados": {
            "k_max_evaluado": 12,
            "n_clusters": 5,
            "n_init": 20,
            "random_state": 42
        },
        "perfilado_numerico": [
            {
                "antiguedad_cliente_meses": 126.88,
                "cluster": 0,
                "dias_desde_ultima_compra": 175.06,
                "frecuencia_compra": 59.14,
                "monto_promedio_compra": 357.13,
                "monto_total_gastado": 4583.05,
                "numero_productos_distintos": 33.05
            },
            {
                "antiguedad_cliente_meses": 119.1,
                "cluster": 1,
                "dias_desde_ultima_compra": 150.02,
                "frecuencia_compra": 76.33,
                "monto_promedio_compra": 732.68,
                "monto_total_gastado": 15304.38,
                "numero_productos_distintos": 28.18
            },
            {
                "antiguedad_cliente_meses": 116.78,
                "cluster": 2,
                "dias_desde_ultima_compra": 224.04,
                "frecuencia_compra": 31.65,
                "monto_promedio_compra": 1053.46,
                "monto_total_gastado": 9782.24,
                "numero_productos_distintos": 39.22
            },
            {
                "antiguedad_cliente_meses": 141.89,
                "cluster": 3,
                "dias_desde_ultima_compra": 157.45,
                "frecuencia_compra": 24.0,
                "monto_promedio_compra": 535.92,
                "monto_total_gastado": 13359.0,
                "numero_productos_distintos": 17.35
            },
            {
                "antiguedad_cliente_meses": 93.38,
                "cluster": 4,
                "dias_desde_ultima_compra": 219.77,
                "frecuencia_compra": 63.14,
                "monto_promedio_compra": 1128.23,
                "monto_total_gastado": 6867.78,
                "numero_productos_distintos": 15.24
            }
        ],
        "total_clientes": 1000
    }
}
```