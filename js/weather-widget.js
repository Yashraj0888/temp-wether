// weather-widget.js
const API_KEY = "0aab446bfffd9f84dce2c091d03cd06b"; // OpenWeatherMap API key

class CityWeather extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Default city
    this.city = this.getAttribute("city") || "Los Angeles";

    // Render the initial structure
    this.render();
  }

  connectedCallback() {
    // Fetch initial weather data
    this.fetchWeather(this.city);

    // Attach event listener for form submission
    this.shadowRoot.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const cityInput = this.shadowRoot.querySelector("input").value.trim();
      if (cityInput) {
        this.city = cityInput;
        this.setAttribute("city", cityInput); // Update the attribute
        this.fetchWeather(this.city);
      }
    });
  }

  async fetchWeather(city) {
    const loading = this.shadowRoot.querySelector(".loading");
    const error = this.shadowRoot.querySelector(".error");
    const weatherDetails = this.shadowRoot.querySelector(".weather-details");

    loading.textContent = "Loading...";
    error.textContent = "";
    weatherDetails.innerHTML = "";

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (data.cod !== 200) {
        throw new Error(data.message);
      }

      this.updateWeatherDetails(data);
    } catch (err) {
      error.textContent = `Error: ${err.message}`;
    } finally {
      loading.textContent = "";
    }
  }

  updateWeatherDetails(data) {
    const weatherDetails = this.shadowRoot.querySelector(".weather-details");
    weatherDetails.innerHTML = `
      <h3>${data.name}, ${data.sys.country}</h3>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" 
           alt="${data.weather[0].description}" />
      <p><strong>Condition:</strong> ${data.weather[0].description}</p>
      <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
      <p><strong>Feels Like:</strong> ${data.main.feels_like}°C</p>
      <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
    `;
    weatherDetails.style.fontFamily = "Arial, sans-serif";
  weatherDetails.style.color = "#333";
  weatherDetails.style.backgroundColor = "#f9f9f9";
  weatherDetails.style.padding = "16px";
  weatherDetails.style.borderRadius = "8px";
  weatherDetails.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  weatherDetails.style.textAlign = "center";
  weatherDetails.style.maxWidth = "300px";
  weatherDetails.style.margin = "auto";
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="style.css">
      <div class="widget">
        <form style="display: flex; align-items: center;justify-content: space-between; margin-top: 20px;">
  <input 
    type="text" 
    placeholder="Enter city" 
    style="flex: 1; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 16px; outline: none; transition: border-color 0.2s ease;"
  />
  <button 
    type="submit" 
    style="background-color:rgb(0, 3, 7); color: white; border: none; border-radius: 6px;margin-left: 10px; padding: 12px 24px; font-weight: 500; cursor: pointer; transition: background-color 0.2s ease; hover: background-color:rgb(0, 0, 0);"
  >
    Search
  </button>
</form>
        <p class="loading"></p>
        <p class="error"></p>
        <div class="weather-details"></div>
      </div>
    `;
  }
}

// Define the custom element
customElements.define("city-weather", CityWeather);
