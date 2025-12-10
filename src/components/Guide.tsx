import React, { useState } from 'react';

const Guide: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Recorre recursivamente los items y devuelve un objeto con todas las rutas marcadas o desmarcadas
  const toggleChildren = (items: Item[], basePath: string, checked: boolean, acc: Record<string, boolean> = {}) => {
    items.forEach((item, index) => {
      const path = `${basePath}.${index}`;
      acc[path] = checked;
      if (item.children) {
        toggleChildren(item.children, path, checked, acc);
      }
    });
    return acc;
  };

  const toggleCheck = (path: string, item: Item, checked: boolean) => {
    setCheckedItems(prev => {
      const newChecked = { ...prev, [path]: checked };
      if (item.children) {
        const childStates = toggleChildren(item.children, path, checked);
        Object.assign(newChecked, childStates);
      }
      return newChecked;
    });
  };

  // Determina si todos los hijos están marcados (para checkbox indeterminado visual — opcional, no implementado aquí)
  // Nota: React no soporta `indeterminate` vía props, requeriría ref, pero lo omitimos por simplicidad.

  const renderList = (items: Item[], basePath = '') => {
    return (
      <ul className="space-y-1 ml-4">
        {items.map((item, index) => {
          const path = `${basePath}.${index}`;
          const isChecked = !!checkedItems[path];
          const hasChildren = !!item.children;

          return (
            <li key={path} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => toggleCheck(path, item, e.target.checked)}
                className="mt-1 shrink-0 h-5 w-5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span
                  className={`${isChecked ? 'line-through text-gray-400' : 'text-gray-200'} ${
                    basePath === '' ? 'text-base font-medium' : 'text-sm'
                  }`}
                >
                  {item.text}
                </span>
                {hasChildren && (
                  <div className="mt-1">
                    {renderList(item.children!, path)}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  const guideData: Section[] = [
    {
      title: 'Funcionalidades de la versión actualización',
      items: [
        {
          text: 'Drag&Drop ficheros para abrir.',
          children: [{ text: 'Solo permite 1 fichero abierto simultáneamente.' }]
        },
        {
          text: 'Tiene un pacificador que aparece durante los tiempos de espera: [filtrado/carga]',
          children: [
            { text: 'Si el fichero es muy pesado, durante la carga se muestra el nombre del fichero.' },
            {
              text: 'Si se filtra con mucha información y hay tiempos de espera aparece el pacificador.',
              children: [
                { text: 'El texto con el nombre del fichero.' },
                {
                  text: 'Un set de 8 GIF\'s que se muestran de forma randomizada.',
                  children: [
                    { text: 'Se pueden modificar, adaptar, reemplazar, quitar, .... totalmente libre, es una propuesta para mostrar algo durante la carga.' },
                    { text: 'El contenido de los ficheros GIF es todo relacionado con el mundo del juego y el casino.' }
                  ]
                }
              ]
            }
          ]
        },
        {
          text: 'Carga de ficheros de gran tamaño.',
          children: [{ text: 'Configurable a nivel de usuario la virtualización del renderizado de los árboles.' }]
        },
        {
          text: 'Filtrado de información',
          children: [
            { text: 'Filtro por texto de los nodos.' },
            { text: 'Filtro por duración mínima y/o máxima de los nodos (métodos).' }
          ]
        },
        {
          text: 'Virtualización de los árboles.',
          children: [
            { text: 'Establece a partir de cuantos nodos se ha de empezar a virtualizar un arbol (carga bajo demanda).' },
            { text: 'Por debajo de ese umbral el arbol se renderiza colapsado entero.' }
          ]
        },
        {
          text: 'Resaltado de información',
          children: [
            { text: 'Se pueden resaltar nodos de los árboles.' },
            { text: 'Y se pueden mostrar todos los nodos (con los resaltados), o filtrar (con el Switch) para ver solo los resaltados con su camino dentro de su respectivo arbol.' }
          ]
        },
        {
          text: 'Colapsar / Expandir información',
          children: [
            { text: 'Se puede a nivel de árbol individual los nodos de cada uno (Toggle).' },
            { text: 'Menú superior Colapsar/Expandir todas las capas de los árboles (mantiene el estado toggle individual de cada arbol).' }
          ]
        },
        {
          text: 'Paneles:',
          children: [
            {
              text: 'Header:',
              children: [
                { text: 'Buscar: Para abrir un explorer y buscar el fichero de performance.' },
                { text: 'Filtro de búsqueda literal' },
                { text: 'Expandir todo/Colapsar todo/Colapsar' },
                { text: 'Modo (Oscuro/Sistema) (El claro se deprecó porque hay que tocar todavía mucho estilo para permitirlo, pero si puede recuperar fácil).' }
              ]
            },
            {
              text: 'Sidebar:',
              children: [
                {
                  text: 'Panel de rendimiento',
                  children: [
                    { text: 'Total nodos en fichero' },
                    { text: 'Tiempo medio de ejecuciones del fichero (ms)' },
                    { text: 'Tiempo mínimo de ejecución (ms)' },
                    { text: 'Tiempo máximo de ejecución (ms)' }
                  ]
                },
                {
                  text: 'Resumen de ejecución',
                  children: [{ text: 'Sumario de árboles (con link a ellos) y su tiempo máximo y su total de nodos.' }]
                },
                {
                  text: 'Análisis del tiempo de ejecución',
                  children: [{ text: 'Gráfico para ver la evolución de las ejecuciones en el tiempo.' }]
                },
                {
                  text: 'Nodos resaltados',
                  children: [
                    { text: 'Listado de nodos que se han resaltados' },
                    { text: 'Switch para mostrar solo filtrados (con su camino) o todos los nodos.' }
                  ]
                }
              ]
            },
            {
              text: 'Ejecuciones',
              children: [
                { text: 'Contenido del fichero mostrado en formato arbol.' },
                { text: 'Se utiliza un sistema de código de colores de modo que cada nivel de nodos se muestra de un color para identificar de forma más clara en que nivel estamos ubicados.' },
                { text: 'La iconografía de los nodos es aleatoria no tiene ningún motivo más que poner un glyph distinto a cada nivel. (Se puede cambiar o quitar si se quiere).' },
                { text: 'Se puede interactuar con el mismo desplegando los nodos para compactar o expandir la vista.' },
                {
                  text: 'A nivel de cada nodo hay un menú contextual que permite:',
                  children: [
                    {
                      text: 'Ver detalle',
                      children: [
                        { text: 'Muestra un diálogo modal en donde se muestra desde el nodo resaltado hacia dentro de la rama del arbol su contenido.' },
                        { text: 'Las métricas (código de colores incluído) son relativas a la sección de arbol mostrada.' },
                        { text: 'Se permite Ver detalle de un detalle para afinar más en el contenido mostrado y las métricas que se visualizan.' }
                      ]
                    },
                    { text: 'Expandir/Colapsar (si tiene hijos)' },
                    { text: 'Resaltar/Quitar resaltado' }
                  ]
                },
                { text: 'Hilos: Se muestra a nivel de cada arbol el identificador de thread que ha escrito cada arbol, no es por ninguna necesidad concreta, pero la información estaba en el fichero y se consideró mostrarlo por si surgia necesidad de disponer de la información.' },
                {
                  text: 'Código de colores de los tiempos de cada nodo:',
                  children: [
                    { text: 'Relativo al fichero completo siempre en la vista principal.' },
                    { text: 'Rojo: tiempos por encima de la media de tiempo de ejecución del fichero completo.' },
                    { text: 'Ambar: tiempos en la media del tiempo de ejecución del fichero.' },
                    { text: 'Verde: tiempos por debajo de la media del tiempo de ejecución del fichero.' }
                  ]
                },
                {
                  text: 'Iconografía:',
                  children: [
                    {
                      text: 'Conejo (background verde): (Rápido!)',
                      children: [
                        { text: 'Simboliza que el árbol no está virtualizado, que está por debajo del tiempo configurado en cantidad de nodos respecto al filtro de "Virtualización a partir de (nodos): ".' }
                      ]
                    },
                    {
                      text: 'Caracol (background rojo): (Lento!)',
                      children: [
                        { text: 'Simboliza que el árbol está virtualizado y de este solamente se ha pre-cargado su primer nivel, por lo que para ver el resto de nodos que contiene se deberá expandir.' },
                        {
                          text: 'Opción 1: (Toggle):',
                          children: [{ text: 'Desplegará el árbol completo.' }]
                        },
                        {
                          text: 'Opción 2: (Click en el nodo desplegable):',
                          children: [{ text: 'Desplegará solamente ese nodo en ese nivel.' }]
                        }
                      ]
                    }
                  ]
                },
                {
                  text: 'Si el fichero es de GamingHallApi, se solicitó mostrar el "Tiempo promedio de ejecución".',
                  children: [
                    { text: 'Solamente aplica para GamingHallApi porque cada fichero contiene llamadas a solamente un único método por lo que la media es relativa a las ejecuciones del mismo y se requiere para hacer promedios de ejecución de un solo método, para el resto de escenarios.' },
                    { text: 'GUI, Cashier,... no aplica porque el contenido es más heterogeneo.' }
                  ]
                }
              ]
            },
            {
              text: 'Footer:',
              children: [
                { text: 'Versión de la aplicación.' },
                { text: 'Indicador de actualización para nueva versión si esta es detectada en el repositorio de las mismas.' },
                {
                  text: 'Indicador del formato de fichero cargado.',
                  children: [
                    {
                      text: 'Formato Antiguo',
                      children: [
                        { text: 'Si el fichero no contiene la marca de "Version YYYYMMDD" o la contiene con una fecha anterior a una establecida, pendiente de revisión.' }
                      ]
                    },
                    {
                      text: 'Formato Nuevo',
                      children: [
                        { text: 'Si el fichero contiene la marca de "Version YYYYMMDD" y es igual o posterior a una establecida, pendiente de revisar.' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Puntos pendientes de implementación',
      items: [
        {
          text: 'Una vez se disponga de tiempo para dedicar a la aplicación:',
          children: [
            { text: 'Crear un bucket en AWS a efectos de la aplicación, para colocar ahí las releases que se vayan generando.' },
            {
              text: 'Actualmente la detección de versiones está hecha contra un repositorio local a la aplicación:',
              children: [{ text: 'Donde hay un json que indica la información de la última versión y su path para realizar la descarga.' }]
            },
            { text: 'Esto debería de funcionar para obtener la información y realizar la descarga desde AWS.' },
            { text: 'Para esto se ha de tratar el tema conjuntamente con Specialists.' }
          ]
        }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-100 bg-gray-600 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-400">
        Guía de Reunión - Performance Log Tree Viewer
      </h1>

      <div className="space-y-8">
        {guideData.map((section, idx) => (
          <section key={idx} className="border border-gray-700 rounded-lg p-5 bg-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-white border-b border-gray-600 pb-2 text-center">
              {section.title}
            </h2>
            {section.items.length > 0 ? renderList(section.items) : null}
          </section>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        ✅ Marca los puntos que ya hayas cubierto durante la reunión.
      </div>
    </div>
  );
};

interface Item {
  text: string;
  children?: Item[];
}

interface Section {
  title: string;
  items: Item[];
}

export default Guide;