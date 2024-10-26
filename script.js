const apiKey = '5e99c4b530c08894e12a75a0d29b81f6'; // Substitua pela sua chave API
const defaultCity = 'Rio Grande do Sul'; // Cidade padrão
let map;
let isMapInitialized = false; // Verificação para inicialização única do mapa

// Função para buscar dados do clima atual
async function fetchWeather(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=pt_br&units=metric`
        );
        const data = await response.json();

        if (data.cod !== 200) {
            throw new Error(data.message);
        }

        document.getElementById('weather').innerHTML = `
            <h3 style="color: #00FF00">${data.name}</h3>
            <p><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Ícone do clima"></p>
            <p style="color: #00FF00">${data.weather[0].description}</p>
            <p style="color: #00FF00">Temperatura: ${data.main.temp.toFixed(1)}°C</p>
        `;
        addMarker(data.coord.lat, data.coord.lon, data.name);

        // Chama a função de previsão
        fetchForecast(city);
    } catch (error) {
        document.getElementById('weather').innerHTML = `<p style="color: red;">Erro ao carregar dados: ${error.message}</p>`;
    }
}

// Função para buscar a previsão do clima
async function fetchForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&lang=pt_br&units=metric`
        );
        const data = await response.json();

        if (data.cod !== "200") {
            throw new Error(data.message);
        }

        displayForecast(data.list);
    } catch (error) {
        document.getElementById('forecast').innerHTML = `<p style="color: red;">Erro ao carregar previsões: ${error.message}</p>`;
    }
}

// Função para exibir a previsão
function displayForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = ''; // Limpa previsões anteriores

    forecastData.forEach((entry) => {
        // Exibe previsões para o meio-dia (24 horas ou 8 entradas de 3 horas)
        if (entry.dt_txt.endsWith('12:00:00')) {
            const date = new Date(entry.dt * 1000).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <h4>${date}</h4>
                <p><img src="https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png" alt="Ícone do clima"></p>
                <p>${entry.weather[0].description}</p>
                <p>Temperatura: ${entry.main.temp.toFixed(1)}°C</p>
                <p>Máxima: ${entry.main.temp_max.toFixed(1)}°C</p>
                <p>Mínima: ${entry.main.temp_min.toFixed(1)}°C</p>
            `;
            forecastContainer.appendChild(forecastItem);
        }
    });
}

// Função para adicionar marcador no mapa
function addMarker(lat, lon, cityName) {
    L.marker([lat, lon]).addTo(map).bindPopup(cityName).openPopup();
}

// Função para buscar clima por coordenadas
async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=pt_br&units=metric`
        );
        const data = await response.json();

        if (data.cod !== 200) {
            throw new Error(data.message);
        }

        document.getElementById('weather').innerHTML = `
            <h3>${data.name}</h3>
            <p><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Ícone do clima"></p>
            <p>${data.weather[0].description}</p>
            <p>Temperatura: ${data.main.temp.toFixed(1)}°C</p>
        `;
        addMarker(lat, lon, data.name);

        // Chama a função de previsão
        fetchForecast(data.name);
    } catch (error) {
        document.getElementById('weather').innerHTML = `<p style="color: red;">Erro ao carregar dados: ${error.message}</p>`;
    }
}

// Função para capturar a localização do usuário
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                map.setView([lat, lon], 12); // Atualiza o mapa para a posição do usuário
                addMarker(lat, lon, 'Você está aqui'); // Adiciona um marcador
                fetchWeatherByCoords(lat, lon); // Obtém o clima para a localização atual
            },
            (error) => {
                console.error('Erro ao obter localização:', error.message);
                alert('Não foi possível obter sua localização.');
            }
        );
    } else {
        alert('Geolocalização não é suportada pelo seu navegador.');
    }
}


// Função para inicializar o mapa
function initMap() {
    if (isMapInitialized) return;
    map = L.map('map').setView([-30.0346, -51.2177], 6); // Posição padrão em Porto Alegre
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
    map.on('click', onMapClick);

    // Chama a função de localização do usuário
    getUserLocation();

    isMapInitialized = true;
}

// Função de clique no mapa para obter clima pela coordenada
function onMapClick(e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    fetchWeatherByCoords(lat, lon);
}

// Função de busca ao clicar no botão ou pressionar Enter
function searchCity() {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        alert('Por favor, insira uma cidade.');
    }
}

// Evento para buscar ao clicar no botão
document.getElementById('searchButton').addEventListener('click', searchCity);

// Evento para buscar ao pressionar Enter
document.getElementById('cityInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') searchCity();
});

// Evento para limpar informações
document.getElementById('clearButton').addEventListener('click', () => {
    // Limpa as informações do clima
    document.getElementById('weather').innerHTML = '';
    document.getElementById('forecast').innerHTML = '';
    document.getElementById('cityInput').value = '';

    // Remove todos os marcadores do mapa
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
});

// Evento para o botão "Obter Localização Atual"
document.getElementById('getLocationButton').addEventListener('click', () => {
    getUserLocation();
});

// Inicializa a busca na cidade padrão
fetchWeather(defaultCity);
initMap();
