// state
let currCity = "Moscow";
let units = "metric";
const API_KEY = '64f60853740a1ee3ba20d0fb595c97d5'; 

// Selectors
let city = document.querySelector(".weather__city");
let datetime = document.querySelector(".datetime-in-city");
let weather__forecast = document.querySelector('.weather-forecast');
let weather__temperature = document.querySelector(".weather-temperature");
let weather__icon = document.querySelector(".weather-icon");
let weather__minmax = document.querySelector(".weather-temperature__minmax")
let weather__realfeel = document.querySelector('.weather__realfeel');
let weather__humidity = document.querySelector('.weather__humidity');
let weather__wind = document.querySelector('.weather__wind');
let weather__pressure = document.querySelector('.weather__pressure');
let forecastSection = document.querySelector('.section-days-forecast');

// search
document.querySelector(".search-box").addEventListener('submit', e => {
    let search = document.querySelector(".search-boxform");
    e.preventDefault();
    currCity = search.value;
    getWeather();
    search.value = ""
})

// units
document.querySelector(".weather_unit_celsius").addEventListener('click', () => {
    if(units !== "metric"){
        units = "metric"
        getWeather()
    }
})

document.querySelector(".weather_unit_farenheit").addEventListener('click', () => {
    if(units !== "imperial"){
        units = "imperial"
        getWeather()
    }
})

function convertTimeStamp(timestamp, timezone){
     const convertTimezone = timezone / 3600; // convert seconds to hours 

    const date = new Date(timestamp * 1000);
    
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: `Etc/GMT${convertTimezone >= 0 ? "-" : "+"}${Math.abs(convertTimezone)}`,
        hour12: true,
    }
    return date.toLocaleString("en-US", options)
}

// convert country code to name
function convertCountryCode(country){
    let regionNames = new Intl.DisplayNames(["en"], {type: "region"});
    return regionNames.of(country)
}

function get5DaysForecast() {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${currCity}&appid=${API_KEY}&units=${units}`)
    .then(res => res.json())
    .then(data => {
        const forecastData = data.list;
        const today = new Date();
        const todayDate = today.getDate();

        forecastSection.innerHTML = '';

        let currentDay = null;
        let forecastByDay = {};

        forecastData.forEach(forecast => {
            const forecastDate = new Date(forecast.dt * 1000).getDate();
            const forecastHour = new Date(forecast.dt * 1000).getHours();

            if (forecastDate === todayDate || forecastHour < 6 || forecastHour > 18) {
                return;
            }

            const forecastDay = convertTimeStamp(forecast.dt, data.city.timezone).split(',')[0];

            if (!forecastByDay[forecastDay]) {
                forecastByDay[forecastDay] = [];
            }

            forecastByDay[forecastDay].push(forecast);
        });

        Object.keys(forecastByDay).forEach(day => {
            const forecasts = forecastByDay[day];
            let maxTemp = Number.MIN_SAFE_INTEGER;
            let minTemp = Number.MAX_SAFE_INTEGER;

            forecasts.forEach(forecast => {
                const temp = forecast.main.temp;
                if (temp > maxTemp) {
                    maxTemp = temp;
                }
                if (temp < minTemp) {
                    minTemp = temp;
                }
            });

            let iconCode = '';
            let weatherDescription = '';
            forecasts.some(forecast => {
                const forecastHour = new Date(forecast.dt * 1000).getHours();
                if (forecastHour >= 6 && forecastHour <= 18) {
                    iconCode = forecast.weather[0].icon;
                    weatherDescription = forecast.weather[0].description;
                    return true; 
                }
                return false;
            });

            const forecastDayElement = document.createElement('div');
            forecastDayElement.textContent = day;
            forecastDayElement.classList.add('forecast-day');

            const forecastIcon = document.createElement('img');
            forecastIcon.src = `http://openweathermap.org/img/wn/${iconCode}.png`;
            forecastIcon.alt = weatherDescription;
            forecastIcon.classList.add('forecast-icon');

            const forecastTemperature = document.createElement('div');
            forecastTemperature.innerHTML = `<p class="forecast-temperature__day">Day: ${maxTemp.toFixed()}&#176;</p> Night: ${minTemp.toFixed()}&#176;</p>`;
            forecastTemperature.classList.add('forecast-temperature');

            const forecastContainer = document.createElement('div');
            forecastContainer.classList.add('forecast-card-day');
            forecastContainer.appendChild(forecastDayElement);
            forecastContainer.appendChild(forecastIcon);
            forecastContainer.appendChild(forecastTemperature);

            forecastSection.appendChild(forecastContainer);
        });
    });
}




function getWeather() {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${currCity}&appid=${API_KEY}&units=${units}`)
    .then(res => res.json())
    .then(data => {
        city.innerHTML = `${data.name}, ${convertCountryCode(data.sys.country)}`
        datetime.innerHTML = convertTimeStamp(data.dt, data.timezone); 
        weather__forecast.innerHTML = `<p>${data.weather[0].main}`
        weather__temperature.innerHTML = `${data.main.temp.toFixed()}&#176`
        weather__icon.innerHTML = `   <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" />`
        weather__minmax.innerHTML = `<p>Min: ${data.main.temp_min.toFixed()}&#176</p><p>Max: ${data.main.temp_max.toFixed()}&#176</p>`
        weather__realfeel.innerHTML = `${data.main.feels_like.toFixed()}&#176`
        weather__humidity.innerHTML = `${data.main.humidity}%`
        weather__wind.innerHTML = `${data.wind.speed} ${units === "imperial" ? "mph": "m/s"}` 
        weather__pressure.innerHTML = `${data.main.pressure} hPa`

        
        get5DaysForecast();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    getWeather();
});