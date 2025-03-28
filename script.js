
let map = L.map('map').setView([48.3794, 31.1656], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
let markers = L.layerGroup().addTo(map);

let citySelect = document.getElementById("citySelect");
let customCityInput = document.getElementById("customCity");

// Показати поле для введення міста, якщо вибрано "Ввести місто"
citySelect.addEventListener("change", function() {
    if (this.value === "custom") {
        customCityInput.style.display = "block";
    } else {
        customCityInput.style.display = "none";
    }
});

document.getElementById("addressInput").addEventListener("input", async function() {
    let addressText = this.value.trim();
    let selectedCity = citySelect.value;
    let customCity = customCityInput.value.trim();
    let tableBody = document.getElementById("addressTable").querySelector("tbody");

    tableBody.innerHTML = "";
    markers.clearLayers();

    if (!addressText) return;

    let addresses = addressText.split("
").map(a => a.trim()).filter(a => a);
    let bounds = new L.LatLngBounds();

    for (let address of addresses) {
        let city = (selectedCity === "custom") ? customCity : selectedCity;
        let fullAddress = city ? `${address}, ${city}, Україна` : `${address}, Україна`;
        let row = tableBody.insertRow();
        let cellAddress = row.insertCell(0);
        let cellCoords = row.insertCell(1);
        cellAddress.textContent = address;
        cellCoords.textContent = "Шукаю...";

        try {
            let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`;
            let response = await fetch(url);
            let data = await response.json();

            if (data.length > 0) {
                let { lat, lon } = data[0];
                cellCoords.textContent = `${lat}, ${lon}`;
                let marker = L.marker([lat, lon]).addTo(markers)
                    .bindPopup(`<b>${address}</b><br>${lat}, ${lon}`)
                    .openPopup();
                bounds.extend([lat, lon]);

                row.dataset.lat = lat;
                row.dataset.lon = lon;

                row.addEventListener("click", function() {
                    let lat = parseFloat(this.dataset.lat);
                    let lon = parseFloat(this.dataset.lon);
                    if (!isNaN(lat) && !isNaN(lon)) {
                        map.setView([lat, lon], 15);
                    }
                });
            } else {
                cellCoords.textContent = "Не знайдено";
            }
        } catch (error) {
            cellCoords.textContent = "Помилка";
        }
    }

    if (bounds.isValid()) {
        map.fitBounds(bounds);
    }
});
