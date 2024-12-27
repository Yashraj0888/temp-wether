class CityWeather extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default settings
    this._city = 'Los Angeles';
    this._theme = localStorage.getItem('weatherTheme') || 'light';
    this._unit = localStorage.getItem('tempUnit') || 'metric';
    
    // Create styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        font-family: 'Arial', sans-serif;
      }
      
      .weather-card {
  max-width: 600px; /* Increased from 400px to 600px */
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

 .weather-card.light {
  background: linear-gradient(135deg, #3498DB, #2ECC71);
  color: white;
}

      .weather-card.dark {
        background: linear-gradient(135deg, #1a1a1a, #2d3748);
        color: #e2e8f0;
      }
      
      .weather-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
      }
      
      h2 {
        margin: 0 0 15px 0;
        font-size: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .weather-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .weather-item {
        padding: 10px;
        border-radius: 8px;
        text-align: center;
      }

      .weather-item.light {
        background: rgba(255, 255, 255, 0.1);
      }

      .weather-item.dark {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .temp {
        font-size: 36px;
        font-weight: bold;
      }
      
      .forecast {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;
        margin: 20px 0;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
      }

      .forecast-item {
        text-align: center;
        padding: 10px;
        border-radius: 8px;
      }

      .forecast-item.light {
        background: rgba(255, 255, 255, 0.1);
      }

      .forecast-item.dark {
        background: rgba(255, 255, 255, 0.05);
      }

      .settings {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }

      .theme-toggle, .unit-toggle {
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        border: none;
      }

      .theme-toggle.light, .unit-toggle.light {
        background: rgba(255, 255, 255, 0.9);
        color: #0083B0;
      }

      .theme-toggle.dark, .unit-toggle.dark {
        background: rgba(255, 255, 255, 0.1);
        color: #e2e8f0;
      }
      
      form {
        margin-top: 20px;
      }
      
      input {
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        margin-right: 10px;
        font-size: 16px;
        width: 200px;
      }

      input.dark {
        background: #4a5568;
        color: white;
      }

      input.dark::placeholder {
        color: #a0aec0;
      }
      
      button {
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.3s ease;
      }

      button.light {
        background: white;
        color: #0083B0;
      }

      button.dark {
        background: #4a5568;
        color: white;
      }

      button:hover {
        opacity: 0.9;
      }
    `;

    this.shadowRoot.appendChild(style);
  }

  async fetchWeather(city) {
    try {
      const apiKey = '0aab446bfffd9f84dce2c091d03cd06b';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${this._unit}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }

  async fetchForecast(city) {
    try {
      const apiKey = '0aab446bfffd9f84dce2c091d03cd06b';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${this._unit}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return null;
    }
  }

  formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  toggleTheme() {
    this._theme = this._theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('weatherTheme', this._theme);
    this.updateWeather();
  }

  toggleUnit() {
    this._unit = this._unit === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('tempUnit', this._unit);
    this.updateWeather();
  }

  getTemperatureUnit() {
    return this._unit === 'metric' ? '°C' : '°F';
  }

  getWindSpeedUnit() {
    return this._unit === 'metric' ? 'm/s' : 'mph';
  }

  async updateWeather() {
    const [weatherData, forecastData] = await Promise.all([
      this.fetchWeather(this._city),
      this.fetchForecast(this._city)
    ]);

    if (!weatherData) return;

    const weatherCard = this.shadowRoot.querySelector('.weather-card');
    weatherCard.className = `weather-card ${this._theme}`;

    if (weatherData.cod === '404') {
      weatherCard.innerHTML = `
        <h2>City not found</h2>
        ${this._createForm()}
      `;
      return;
    }

    const dailyForecasts = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5);
    
    weatherCard.innerHTML = `
      <div class="settings">
        <button class="theme-toggle ${this._theme}" onclick="this.getRootNode().host.toggleTheme()">
          ${this._theme === 'light' ? '🌙' : '☀️'} Theme
        </button>
        <button class="unit-toggle ${this._theme}" onclick="this.getRootNode().host.toggleUnit()">
          ${this._unit === 'metric' ? '°F' : '°C'}
        </button>
      </div>
      <h2>
        ${weatherData.name}
        <img src="http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png" 
             alt="${weatherData.weather[0].description}"
             width="50" height="50">
      </h2>
      <div class="weather-info">
        <div class="weather-item ${this._theme}">
          <div class="temp">${Math.round(weatherData.main.temp)}${this.getTemperatureUnit()}</div>
          <div>${weatherData.weather[0].main}</div>
        </div>
        <div class="weather-item ${this._theme}">
          <div>Feels Like</div>
          <div>${Math.round(weatherData.main.feels_like)}${this.getTemperatureUnit()}</div>
        </div>
        <div class="weather-item ${this._theme}">
          <div>Humidity</div>
          <div>${weatherData.main.humidity}%</div>
        </div>
        <div class="weather-item ${this._theme}">
          <div>Wind</div>
          <div>${weatherData.wind.speed} ${this.getWindSpeedUnit()}</div>
        </div>
      </div>
      <div class="forecast">
        ${dailyForecasts.map(day => `
          <div class="forecast-item ${this._theme}">
            <div>${this.formatDate(day.dt)}</div>
            <img src="http://openweathermap.org/img/w/${day.weather[0].icon}.png" 
                 alt="${day.weather[0].description}"
                 width="40" height="40">
            <div>${Math.round(day.main.temp)}${this.getTemperatureUnit()}</div>
            <div>${day.weather[0].main}</div>
          </div>
        `).join('')}
      </div>
      ${this._createForm()}
    `;

    this._setupFormListener();
  }

  _createForm() {
    return `
      <form>
        <input type="text" 
               class="${this._theme}"
               placeholder="Enter city name" 
               value="${this._city}">
        <button type="submit" class="${this._theme}">Update</button>
      </form>
    `;
  }

  _setupFormListener() {
    const form = this.shadowRoot.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = this.shadowRoot.querySelector('input');
      this._city = input.value;
      this.setAttribute('city', this._city);
      this.updateWeather();
    });
  }

  static get observedAttributes() {
    return ['city'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'city' && oldValue !== newValue) {
      this._city = newValue;
      this.updateWeather();
    }
  }

  connectedCallback() {
    const weatherCard = document.createElement('div');
    weatherCard.className = `weather-card ${this._theme}`;
    this.shadowRoot.appendChild(weatherCard);
    
    this._city = this.getAttribute('city') || this._city;
    this.updateWeather();
  }
}

customElements.define('city-weather', CityWeather);
