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
  