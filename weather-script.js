/* https://api.open-meteo.com/v1/forecast?latitude=41.3909&longitude=-72.8595&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max,wind_speed_10m_max&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=auto&wind_speed_unit=mph&temperature_unit=fahrenheit */
document.addEventListener("DOMContentLoaded", () => {
  const weatherContainer = document.getElementById("weather-container");
  const apiUrl = "https://api.open-meteo.com/v1/forecast?latitude=41.3909&longitude=-72.8595&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max,wind_speed_10m_max&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=auto&wind_speed_unit=mph&temperature_unit=fahrenheit";

  if (!weatherContainer) {
    console.error("Error: #weather-container element not found in the DOM.");
    return;
  }

  const currentConditions = document.getElementById("current-conditions");
  
  function getWeatherDetails(code) {
  if (code >= 0 && code <= 1) {
    return { icon: "weather-icons/sunny-icon.png", label: "Sunny" };
  }
  if (code >= 2 && code <= 3) {
    return { icon: "weather-icons/clouds-icon.png", label: "Partly cloudy" };
  }
  if (code >= 40 && code <= 49) {
    return { icon: "weather-icons/fog-icon.png", label: "Foggy" };
  }
  if (code >= 50 && code <= 69) {
    return { icon: "weather-icons/rain-icon.png", label: "Rain" };
  }
  if ((code >= 70 && code <= 79) || (code >= 85 && code <= 86)) {
    return { icon: "weather-icons/snow-icon", label: "Snow" };
  }
  if (code >= 95 && code <= 99) {
    return { icon: "weather-icons/storm-icon.png", label: "Thunderstorm" };
  }

  return { icon: "weather-icons/cloudy-icon.png", label: "Cloudy" };
  }

   function getUvCategory(uv) {
    if (uv < 3) return { text: "Low", className: "uv-low" };
    if (uv < 6) return { text: "Moderate", className: "uv-moderate" };
    if (uv < 8) return { text: "High", className: "uv-high" };
    if (uv < 11) return { text: "Very High", className: "uv-very-high" };
    return { text: "Extreme", className: "uv-extreme" };
  }

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data || !data.daily || !data.daily.time) {
        throw new Error("Invalid API data structure received.");
      }

      const dates = data.daily.time;
      const weatherCodes = data.daily.weather_code;
      const maxTemps = data.daily.temperature_2m_max;
      const minTemps = data.daily.temperature_2m_min;
      const uvMax = data.daily.uv_index_max;
      const maxWinds = data.daily.wind_speed_10m_max;

      if (currentConditions) {
        currentConditions.innerHTML = "";

        const currentTemp = data.current.temperature_2m;
        const currentCode = data.current.weather_code;
        const currentCondition = getWeatherDetails(currentCode);

        const nowHeading = document.createElement("h2");
        nowHeading.textContent = "Current conditions";

        const currentIcon = document.createElement("img");
        currentIcon.src = currentCondition.icon;
        currentIcon.alt = currentCondition.label;
        currentIcon.classList.add("current-icon");

        const currentTempText = document.createElement("p");
        currentTempText.textContent = Math.round(currentTemp) + "°F";
        currentTempText.classList.add("current-temp");

        const currentLabel = document.createElement("p");
        currentLabel.textContent = currentCondition.label;
        currentLabel.classList.add("current-label");

        const todayWind = document.createElement("p");
        todayWind.textContent = "Max wind today: " + Math.round(maxWinds[0]) + " mph";

        currentConditions.appendChild(nowHeading);
        currentConditions.appendChild(currentIcon);
        currentConditions.appendChild(currentTempText);
        currentConditions.appendChild(currentLabel);
        currentConditions.appendChild(todayWind);
      }

      weatherContainer.innerHTML = "";

      for (let i = 0; i < dates.length; i++) {
        const card = document.createElement("div");
        card.classList.add("card");

        const date = document.createElement("h2");
        date.textContent = new Date(dates[i] + "T00:00:00").toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric"
        });

        const weatherInfo = getWeatherDetails(weatherCodes[i]);

        const icon = document.createElement("img");
        icon.classList.add("weather-icon");
        icon.src = weatherInfo.icon;
        icon.alt = weatherInfo.label;

        const condition = document.createElement("p");
        condition.classList.add("condition");
        condition.textContent = weatherInfo.label;

        const maxTemp = document.createElement("p");
        maxTemp.textContent = "High: " + Math.round(maxTemps[i]) + "°F";

        const minTemp = document.createElement("p");
        minTemp.textContent = "Low: " + Math.round(minTemps[i]) + "°F";

        const windSpeed = Math.round(maxWinds[i]);
        let windIconFile = "";
        let windAltText = "";

        if (windSpeed < 10) {
          windIconFile = "weather-icons/light.png";
          windAltText = "Light wind";
        } else if (windSpeed < 20) {
          windIconFile = "weather-icons/moderate.png";
          windAltText = "Moderate wind";
        } else if (windSpeed < 40) {
          windIconFile = "weather-icons/strong.png";
          windAltText = "Strong wind";
        } else {
          windIconFile = "weather-icons/verystrong.png";
          windAltText = "Very strong wind";
        }

        const windRow = document.createElement("div");
        windRow.classList.add("wind-line");

        const windIcon = document.createElement("img");
        windIcon.src = windIconFile;
        windIcon.alt = windAltText;
        windIcon.classList.add("wind-icon");

        const windText = document.createElement("span");
        windText.textContent = "Max wind: " + windSpeed + " mph";

        windRow.appendChild(windIcon);
        windRow.appendChild(windText);


        const uvValue = Math.round(uvMax[i]);
        const uvInfo = getUvCategory(uvValue);
        const uvElement = document.createElement("p");
        uvElement.classList.add("uv-badge", uvInfo.className);
        uvElement.textContent = `UV: ${uvValue} (${uvInfo.text})`;

        card.appendChild(date);
        card.appendChild(icon);
        card.appendChild(condition);
        card.appendChild(maxTemp);
        card.appendChild(minTemp);
        card.appendChild(windRow);
        card.appendChild(uvElement);

        weatherContainer.appendChild(card);
      }
    })
    .catch(error => {
      weatherContainer.innerHTML = "<p>Sorry, weather data could not be loaded.</p>";
      console.error("Error fetching weather data:", error);
    });
});


/*  function getWeatherDetails(code) {
  if (code === 0) {
    return { icon: "weather-icons/sunny-icon.png", label: "Sunny" };
  }
  if (code >= 1 && code <= 3) {
    return { icon: "weather-icons/cloudy-icon.png", label: "Partly cloudy" };
  }
  if (code === 45 || code === 48) {
    return { icon: "weather-icons/fog-icon.png", label: "Foggy" };
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return { icon: "weather-icons/rain-icon.png", label: "Rain" };
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return { icon: "weather-icons/snow-icon", label: "Snow" };
  }
  if (code >= 95 && code <= 99) {
    return { icon: "weather-icons/storm-icon.png", label: "Thunderstorm" };
  }

  // Fallback to cloudy.png if an unexpected code appears
  return { icon: "weather-icons/cloudy-icon.png", label: "Cloudy" };
} */