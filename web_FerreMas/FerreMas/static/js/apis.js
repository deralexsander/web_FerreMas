document.addEventListener("DOMContentLoaded", () => {
  // 🌎 REGIONES Y COMUNAS GENERALES
  const regionGeneral = document.getElementById("region");
  const comunaGeneral = document.getElementById("comuna");

  if (regionGeneral && comunaGeneral) {
    let regionesData = [];

    fetch("https://gist.githubusercontent.com/juanbrujo/0fd2f4d126b3ce5a95a7dd1f28b3d8dd/raw/")
      .then(res => res.json())
      .then(data => {
        regionesData = data.regiones;
        regionesData.forEach(r => {
          const option = document.createElement("option");
          option.value = r.region;
          option.textContent = r.region;
          regionGeneral.appendChild(option);
        });
      })
      .catch(err => {
        console.error("❌ Error al cargar regiones generales:", err);
      });

    regionGeneral.addEventListener("change", function () {
      comunaGeneral.innerHTML = '<option value="">Seleccione una comuna</option>';
      comunaGeneral.disabled = true;

      const regionSeleccionada = this.value;
      if (!regionSeleccionada) return;

      const region = regionesData.find(r => r.region === regionSeleccionada);
      if (region) {
        region.comunas.forEach(comuna => {
          const option = document.createElement("option");
          option.value = comuna;
          option.textContent = comuna;
          comunaGeneral.appendChild(option);
        });
        comunaGeneral.disabled = false;
      }
    });
  }

  // 🏪 REGIONES Y COMUNAS DE SUCURSALES
  const regionSucursal = document.getElementById("region-sucursal");
  const comunaSucursal = document.getElementById("comuna-sucursal");

  if (regionSucursal && comunaSucursal) {
    let sucursalesData = [];

    fetch("https://gist.githubusercontent.com/deralexsander/509c0851749f70c64533fd1bc3c2566e/raw/26f20a43cec48854859345e1fa2e461dd974050b/sucursales-ferremas.json")
      .then(res => res.json())
      .then(data => {
        sucursalesData = data;

        sucursalesData.forEach(region => {
          const option = document.createElement("option");
          option.value = region.region;
          option.textContent = region.region;
          regionSucursal.appendChild(option);
        });
      })
      .catch(error => {
        console.error("❌ Error al cargar las regiones de sucursales:", error);
      });

    regionSucursal.addEventListener("change", () => {
      const regionSeleccionada = regionSucursal.value;
      comunaSucursal.innerHTML = '<option value="">Seleccione una comuna</option>';
      comunaSucursal.disabled = true;

      if (!regionSeleccionada) return;

      const region = sucursalesData.find(r => r.region === regionSeleccionada);
      if (!region) return;

      const comunas = [...new Set(
        region.sucursales.map(s => {
          const partesDireccion = s.direccion.split(",");
          return partesDireccion.length > 1 ? partesDireccion[1].trim() : "Desconocida";
        })
      )];

      comunas.forEach(comuna => {
        const option = document.createElement("option");
        option.value = comuna;
        option.textContent = comuna;
        comunaSucursal.appendChild(option);
      });

      comunaSucursal.disabled = false;
    });
  }

  // 🗺️ MOSTRAR TODAS LAS SUCURSALES POR REGIÓN
  const contenedorSucursales = document.getElementById("contenedor-sucursales");

  if (contenedorSucursales) {
    fetch("https://gist.githubusercontent.com/deralexsander/509c0851749f70c64533fd1bc3c2566e/raw/26f20a43cec48854859345e1fa2e461dd974050b/sucursales-ferremas.json")
      .then(res => res.json())
      .then(data => {
        contenedorSucursales.innerHTML = "";

        data.forEach(regionData => {

          regionData.sucursales.forEach(sucursal => {
            const div = document.createElement("div");
            div.classList.add("tarjeta-sucursal");
            div.innerHTML = `
              <h4>${sucursal.nombre}</h4>
              <p><strong>Dirección:</strong> ${sucursal.direccion}</p>
              <p><strong>Teléfono:</strong> ${sucursal.telefono}</p>
            `;
            contenedorSucursales.appendChild(div);
          });
        });
      })
      .catch(error => {
        contenedorSucursales.innerHTML = "<p>Error al cargar las sucursales.</p>";
        console.error("❌ Error cargando sucursales:", error);
      });
  }
});
