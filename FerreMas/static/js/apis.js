document.addEventListener("DOMContentLoaded", () => {
  // URLs de APIs externas
  const REGIONES_URL =
    window._ENV_CONFIG_?.apis?.regionesUrl ||
    "https://raw.githubusercontent.com/marcelo-p/chile-regiones-provincias-comunas/master/regiones-comunas.json";

  const SUCURSALES_URL =
    window._ENV_CONFIG_?.apis?.sucursalesUrl ||
    "https://gist.githubusercontent.com/deralexsander/509c0851749f70c64533fd1bc3c2566e/raw/26f20a43cec48854859345e1fa2e461dd974050b/sucursales-ferremas.json";

  // Respaldo de sucursales en caso de fallo de red en el Gist
  const SUCURSALES_FALLBACK = [
    {
      region: "Valparaíso",
      sucursales: [
        { nombre: "Ferremas Quilpué Centro", direccion: "Av. Los Carreras 123, Quilpué", comuna: "Quilpué", telefono: "+56 32 123 4567" },
        { nombre: "Ferremas Viña Oriente", direccion: "Calle Uno 456, Viña del Mar", comuna: "Viña del Mar", telefono: "+56 32 987 6543" }
      ]
    },
    {
      region: "Metropolitana",
      sucursales: [
        { nombre: "Ferremas Santiago Centro", direccion: "Av. Libertador 1111, Santiago", comuna: "Santiago", telefono: "+56 2 2345 6789" }
      ]
    },
    {
      region: "Biobío",
      sucursales: [
        { nombre: "Ferremas Concepción Norte", direccion: "Av. Los Carrera 2001, Concepción", comuna: "Concepción", telefono: "+56 41 223 4455" }
      ]
    },
    {
      region: "Los Lagos",
      sucursales: [
        { nombre: "Ferremas Puerto Montt Costanera", direccion: "Av. Diego Portales 1234, Puerto Montt", comuna: "Puerto Montt", telefono: "+56 65 221 3344" }
      ]
    }
  ];

  // =========================================================================
  // 1. REGIONES Y COMUNAS GENERALES (Formulario de Despacho / Datos)
  // =========================================================================
  const regionGeneral = document.getElementById("region");
  const comunaGeneral = document.getElementById("comuna");

  if (regionGeneral && comunaGeneral) {
    let regionesData = [];

    fetch(REGIONES_URL)
      .then((res) => res.json())
      .then((data) => {
        regionesData = Array.isArray(data) ? data : data.regiones || [];
        regionGeneral.innerHTML = '<option value="">Seleccione una región</option>';

        regionesData.forEach((r) => {
          const nombreRegion = (r.region || r.nombre || "").trim();
          if (nombreRegion) {
            const opt = document.createElement("option");
            opt.value = nombreRegion;
            opt.textContent = nombreRegion;
            regionGeneral.appendChild(opt);
          }
        });
      })
      .catch((err) => {
        console.warn("Error cargando regiones generales:", err);
      });

    regionGeneral.addEventListener("change", function () {
      comunaGeneral.innerHTML = '<option value="">Seleccione una comuna</option>';
      comunaGeneral.disabled = true;

      const sel = this.value.trim().toLowerCase();
      if (!sel) return;

      const reg = regionesData.find(
        (r) => (r.region || r.nombre || "").trim().toLowerCase() === sel
      );

      const comunas = reg?.comunas || [];
      if (Array.isArray(comunas) && comunas.length > 0) {
        comunas.forEach((c) => {
          const nombreComuna = (typeof c === "string" ? c : c.comuna || c.nombre || "").trim();
          if (nombreComuna) {
            const opt = document.createElement("option");
            opt.value = nombreComuna;
            opt.textContent = nombreComuna;
            comunaGeneral.appendChild(opt);
          }
        });
        comunaGeneral.disabled = false;
      }
    });
  }

  // =========================================================================
  // 2. RETIRO EN TIENDA: REGIONES, COMUNAS Y SUCURSALES FILTRADAS
  // =========================================================================
  const regionSucursal = document.getElementById("region-sucursal");
  const comunaSucursal = document.getElementById("comuna-sucursal");
  const selectSucursal = document.getElementById("sucursal"); // Si tienes un select de tiendas
  const contenedorSucursales = document.getElementById("contenedor-sucursales");

  let sucursalesData = [];

  function extraerComuna(s) {
    if (s.comuna) return s.comuna.trim();
    if (s.direccion && s.direccion.includes(",")) {
      return s.direccion.split(",")[1].trim();
    }
    return "Principal";
  }

  function renderizarTarjetasSucursales(lista) {
    if (!contenedorSucursales) return;
    contenedorSucursales.innerHTML = "";

    if (lista.length === 0) {
      contenedorSucursales.innerHTML = `<p style="color: #64748b; padding: 15px; font-weight: 500;">No hay sucursales disponibles para la ubicación seleccionada.</p>`;
      return;
    }

    lista.forEach(({ regionNombre, sucursal }) => {
      const div = document.createElement("div");
      div.className = "tarjeta-sucursal";
      div.setAttribute(
        "style",
        "display: flex; flex-direction: column; justify-content: space-between; padding: 20px; background: #ffffff; border-radius: 14px; border-left: 5px solid #0284c7; box-shadow: 0 6px 18px rgba(10, 74, 130, 0.08); margin-bottom: 12px;"
      );

      div.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h4 style="margin: 0; color: #0a4a82; font-size: 1.1rem; font-weight: 700;">${sucursal.nombre}</h4>
            <span style="font-size: 0.75rem; background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 12px; font-weight: 600;">
              ${extraerComuna(sucursal)}
            </span>
          </div>
          <p style="margin: 4px 0; color: #475569; font-size: 0.88rem;"><strong>Dirección:</strong> ${sucursal.direccion}</p>
          <p style="margin: 4px 0; color: #0284c7; font-size: 0.88rem;"><strong>Teléfono:</strong> ${sucursal.telefono}</p>
        </div>
      `;
      contenedorSucursales.appendChild(div);
    });
  }

  function cargarSucursalesInicial(data) {
    sucursalesData = data;

    // Si existe el select de regiones de sucursal
    if (regionSucursal) {
      regionSucursal.innerHTML = '<option value="">Seleccione una región</option>';
      sucursalesData.forEach((r) => {
        const opt = document.createElement("option");
        opt.value = r.region;
        opt.textContent = r.region;
        regionSucursal.appendChild(opt);
      });
    }

    // Si existe un contenedor en la vista (por ejemplo en el inicio o checkout), mostrar todas inicialmente
    if (contenedorSucursales) {
      const todas = [];
      sucursalesData.forEach((r) => {
        (r.sucursales || []).forEach((s) => todas.push({ regionNombre: r.region, sucursal: s }));
      });
      renderizarTarjetasSucursales(todas);
    }
  }

  // Petición de sucursales con fallback
  fetch(SUCURSALES_URL)
    .then((res) => {
      if (!res.ok) throw new Error("Error HTTP " + res.status);
      return res.json();
    })
    .then((data) => {
      cargarSucursalesInicial(Array.isArray(data) ? data : SUCURSALES_FALLBACK);
    })
    .catch((err) => {
      console.warn("Usando sucursales locales:", err);
      cargarSucursalesInicial(SUCURSALES_FALLBACK);
    });

  // Al cambiar la REGIÓN en retiro en tienda
  if (regionSucursal) {
    regionSucursal.addEventListener("change", () => {
      const regionVal = regionSucursal.value.trim().toLowerCase();

      if (comunaSucursal) {
        comunaSucursal.innerHTML = '<option value="">Seleccione una comuna</option>';
        comunaSucursal.disabled = true;
      }

      if (!regionVal) {
        // Mostrar todas de nuevo si deselecciona
        const todas = [];
        sucursalesData.forEach((r) => {
          (r.sucursales || []).forEach((s) => todas.push({ regionNombre: r.region, sucursal: s }));
        });
        renderizarTarjetasSucursales(todas);
        return;
      }

      const regionEncontrada = sucursalesData.find(
        (r) => (r.region || "").trim().toLowerCase() === regionVal
      );

      if (!regionEncontrada || !Array.isArray(regionEncontrada.sucursales)) return;

      // Obtener comunas únicas de esa región
      const comunas = [...new Set(regionEncontrada.sucursales.map(extraerComuna))];

      if (comunaSucursal) {
        comunas.forEach((c) => {
          const opt = document.createElement("option");
          opt.value = c;
          opt.textContent = c;
          comunaSucursal.appendChild(opt);
        });
        comunaSucursal.disabled = false;
      }

      // Filtrar tarjetas por la región seleccionada
      const filtradas = regionEncontrada.sucursales.map((s) => ({
        regionNombre: regionEncontrada.region,
        sucursal: s
      }));
      renderizarTarjetasSucursales(filtradas);
    });
  }

  // Al cambiar la COMUNA en retiro en tienda
  if (comunaSucursal) {
    comunaSucursal.addEventListener("change", () => {
      const comunaVal = comunaSucursal.value.trim().toLowerCase();
      const regionVal = regionSucursal ? regionSucursal.value.trim().toLowerCase() : "";

      const regionEncontrada = sucursalesData.find(
        (r) => (r.region || "").trim().toLowerCase() === regionVal
      );

      if (!regionEncontrada) return;

      let sucursalesFiltradas = regionEncontrada.sucursales;

      if (comunaVal) {
        sucursalesFiltradas = sucursalesFiltradas.filter(
          (s) => extraerComuna(s).toLowerCase() === comunaVal
        );
      }

      // Si existe un select directo para elegir la sucursal específica
      if (selectSucursal) {
        selectSucursal.innerHTML = '<option value="">Seleccione la sucursal de retiro</option>';
        sucursalesFiltradas.forEach((s) => {
          const opt = document.createElement("option");
          opt.value = s.nombre;
          opt.textContent = `${s.nombre} - ${s.direccion}`;
          selectSucursal.appendChild(opt);
        });
        selectSucursal.disabled = false;
      }

      renderizarTarjetasSucursales(
        sucursalesFiltradas.map((s) => ({ regionNombre: regionEncontrada.region, sucursal: s }))
      );
    });
  }
});