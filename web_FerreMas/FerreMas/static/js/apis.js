document.addEventListener("DOMContentLoaded", function () {
    let regionesData = [];
  
    fetch("https://gist.githubusercontent.com/juanbrujo/0fd2f4d126b3ce5a95a7dd1f28b3d8dd/raw/")
      .then(res => res.json())
      .then(data => {
        regionesData = data.regiones;
        const selectRegion = document.getElementById("region");
  
        regionesData.forEach(r => {
          const option = document.createElement("option");
          option.value = r.region;
          option.textContent = r.region;
          selectRegion.appendChild(option);
        });
      })
      .catch(err => {
        console.error("❌ Error al cargar regiones:", err);
      });
  
    document.getElementById("region").addEventListener("change", function () {
      const comunaSelect = document.getElementById("comuna");
      comunaSelect.innerHTML = '<option value="">Seleccione una comuna</option>';
      comunaSelect.disabled = true;
  
      const regionSeleccionada = this.value;
      if (!regionSeleccionada) return;
  
      const region = regionesData.find(r => r.region === regionSeleccionada);
      if (region) {
        region.comunas.forEach(comuna => {
          const option = document.createElement("option");
          option.value = comuna;
          option.textContent = comuna;
          comunaSelect.appendChild(option);
        });
        comunaSelect.disabled = false;
      }
    });

    
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const selectRegion = document.getElementById("region-sucursal");
    const selectComuna = document.getElementById("comuna-sucursal");
    let sucursalesData = [];
  
    fetch("https://gist.githubusercontent.com/deralexsander/509c0851749f70c64533fd1bc3c2566e/raw/26f20a43cec48854859345e1fa2e461dd974050b/sucursales-ferremas.json")
      .then(res => res.json())
      .then(data => {
        sucursalesData = data;
  
        // Llenar regiones
        sucursalesData.forEach(region => {
          const option = document.createElement("option");
          option.value = region.region;
          option.textContent = region.region;
          selectRegion.appendChild(option);
        });
      })
      .catch(error => {
        console.error("Error al cargar las regiones:", error);
      });
  
    // Al cambiar región, llenamos comunas
    selectRegion.addEventListener("change", () => {
      const regionSeleccionada = selectRegion.value;
      selectComuna.innerHTML = '<option value="">Seleccione una comuna</option>';
      selectComuna.disabled = true;
  
      if (!regionSeleccionada) return;
  
      const region = sucursalesData.find(r => r.region === regionSeleccionada);
      if (!region) return;
  
      // Obtener comunas extrayéndolas desde dirección (luego de la coma)
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
        selectComuna.appendChild(option);
      });
  
      selectComuna.disabled = false;
    });
  });
  

  document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedor-sucursales");

  fetch("https://gist.githubusercontent.com/deralexsander/509c0851749f70c64533fd1bc3c2566e/raw/26f20a43cec48854859345e1fa2e461dd974050b/sucursales-ferremas.json")
    .then(res => res.json())
    .then(data => {
      contenedor.innerHTML = ""; // Limpiar por si acaso

      data.forEach(regionData => {
        const regionTitulo = document.createElement("h3");
        regionTitulo.textContent = regionData.region;
        contenedor.appendChild(regionTitulo);

        regionData.sucursales.forEach(sucursal => {
          const div = document.createElement("div");
          div.classList.add("tarjeta-sucursal");
          div.innerHTML = `
            <h4>${sucursal.nombre}</h4>
            <p><strong>Dirección:</strong> ${sucursal.direccion}</p>
            <p><strong>Teléfono:</strong> ${sucursal.telefono}</p>
          `;
          contenedor.appendChild(div);
        });
      });
    })
    .catch(error => {
      contenedor.innerHTML = "<p>Error al cargar las sucursales.</p>";
      console.error("❌ Error cargando sucursales:", error);
    });
});
