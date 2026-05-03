# Session: 2026-05-03 — E1 design-css

Se utilizó el modelo a través de chat para la elaboaración de un archivo css para el estilo general del fronend. Los archivos mencionados en cada promts fueron adjuntados al momento de realizar la consulta.

## Participantes

- Usuario: OrianaCrescio
- Modelo: OpenAI GPT5.3

## Promt

Quiero un frontend con un mismo estilo (misma tipografia, botones de color verde y que el resto de la pagina tenga tonos azules, las palabas y titulos en negro y que las tablas y otros textos esten centrados), dame un css para index

### Respuesta

Te dejo un CSS unificado para que todos tus archivos mantengan el mismo estilo: misma tipografía, botones verdes, fondo azul, títulos negros y tablas centradas. Vi que tus tablas usan `<table>` directamente y celdas con `className="p"`, y que el `NavBar` ya importa `NavBar.css`.

### `src/index.css` o `src/App.css`

```css
/* Estilo global */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe, #93c5fd);
  color: #000000;
  min-height: 100vh;
}

/* Contenedor principal de páginas */
main {
  width: 90%;
  max-width: 1100px;
  margin: 40px auto;
  padding: 30px;
  background-color: #eff6ff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(30, 64, 175, 0.18);
  text-align: center;
}

/* Títulos */
h1,
h2,
h3,
h4 {
  color: #000000;
  text-align: center;
  margin-bottom: 18px;
}

h1 {
  font-size: 2.3rem;
}

h4 {
  font-weight: 500;
  font-size: 1.1rem;
}

/* Textos */
p,
span,
.p {
  color: #000000;
  text-align: center;
}

/* Links */
a {
  color: #000000;
  text-decoration: none;
  font-weight: 600;
}

a:hover {
  color: #14532d;
}

/* Botones verdes */
button {
  background-color: #22c55e;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 11px 18px;
  margin: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

button:hover {
  background-color: #16a34a;
  transform: translateY(-2px);
}

button:active {
  background-color: #15803d;
  transform: translateY(0);
}

/* Tablas */
table {
  width: 100%;
  margin: 25px auto;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(30, 64, 175, 0.16);
  text-align: center;
}

thead {
  background-color: #1d4ed8;
}

th {
  color: #ffffff;
  font-weight: 700;
  padding: 14px;
  text-align: center;
}

td {
  color: #000000;
  padding: 12px;
  border-bottom: 1px solid #bfdbfe;
  text-align: center;
}

tbody tr:nth-child(even) {
  background-color: #eff6ff;
}

tbody tr:hover {
  background-color: #dbeafe;
}

/* Responsive */
@media (max-width: 768px) {
  main {
    width: 95%;
    padding: 20px;
  }

  table {
    font-size: 0.85rem;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  button {
    width: 100%;
    max-width: 260px;
  }
}
```

### Imports recomendados

En `main.jsx` o `App.jsx`, asegúrate de tener:

```jsx
import './index.css';
```
