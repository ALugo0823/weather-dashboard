//method to clear local storage
localStorage.clear();

//function for searching city and fetching data from the api server
function searchCity() {
    var cityName = titleCase($("#cityName")[0].value.trim());
    var apiURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=71311474f5b26fb7bbfa0bc1985b90cd";

    fetch(apiURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                    //jQuery date formatter
                $("#city-name")[0].textContent = cityName + " (" + moment().format('M/D/YYYY') + ")";

                $("#city-list").append('<button type="button" class="list-group-item list-group-item-light list-group-item-action city-name">' + cityName);
                    //latitude and longitude variables that will be used to determine location
                const lat = data.coord.lat;
                const lon = data.coord.lon;

                var latAndLon = lat.toString() + " " + lon.toString();

                localStorage.setItem(cityName, latAndLon);

                apiURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=imperial&appid=71311474f5b26fb7bbfa0bc1985b90cd";

                fetch(apiURL).then(function (newResponse) {
                    if (newResponse.ok) {
                        newResponse.json().then(function (newData) {
                            currentWeather(newData);
                        })
                    }
                })
            })
        } else {
            alert("Cannot find city! Please try again");
        }
    })
}

// function that gets the info for a city already in the list saved by local storage
function listOfCities(coordinates) {
    apiURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + coordinates[0] + "&lon=" + coordinates[1] + "&exclude=minutely,hourly&units=imperial&appid=71311474f5b26fb7bbfa0bc1985b90cd";

    fetch(apiURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                currentWeather(data);
            })
        }
    })
}

//function that will display city forecast for current day. conditional statements will determine which css classes will get added 
function currentWeather(data) {
    $(".results-panel").addClass("visible");

    $("#currentIcon")[0].src = "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png";
    $("#temp")[0].textContent = "Temperature: " + data.current.temp.toFixed(1) + " \u2109";
    $("#humidity")[0].textContent = "Humidity: " + data.current.humidity + "% ";
    $("#wind-speed")[0].textContent = "Wind Speed: " + data.current.wind_speed.toFixed(1) + " MPH";
    $("#uv-index")[0].textContent = "  " + data.current.uvi;

    if (data.current.uvi < 3) {
        $("#uv-index").removeClass("moderate severe");
        $("#uv-index").addClass("light");
    } else if (data.current.uvi < 6) {
        $("#uv-index").removeClass("light severe");
        $("#uv-index").addClass("moderate");
    } else {
        $("#uv-index").removeClass("light moderate");
        $("#uv-index").addClass("severe");
    }

    futureWeather(data);
}

//function that will check the following 5 day weather forecast. 
function futureWeather(data) {
    for (var i = 0; i < 5; i++) {
        var futureWeather = {
            date: unixConverter(data, i),
            icon: "http://openweathermap.org/img/wn/" + data.daily[i + 1].weather[0].icon + "@2x.png",
            temp: data.daily[i + 1].temp.day.toFixed(1),
            humidity: data.daily[i + 1].humidity
        }

        var currentSelector = "#day-" + i;
        $(currentSelector)[0].textContent = futureWeather.date;
        currentSelector = "#img-" + i;
        $(currentSelector)[0].src = futureWeather.icon;
        currentSelector = "#temp-" + i;
        $(currentSelector)[0].textContent = "Temp: " + futureWeather.temp + " \u2109";
        currentSelector = "#hum-" + i;
        $(currentSelector)[0].textContent = "Humidity: " + futureWeather.humidity + "%";
    }
}

//function that uses the split method just in case city name is more than one word
function titleCase(city) {
    var updateCity = city.toLowerCase().split(" ");
    var newCity = "";
    for (var i = 0; i < updateCity.length; i++) {
        updateCity[i] = updateCity[i][0].toUpperCase() + updateCity[i].slice(1);
        newCity += " " + updateCity[i];
    }
    return newCity;
}

// function that converts the UNIX time that is received from the server.
function unixConverter(data, index) {
    const currentDate = new Date(data.daily[index + 1].dt * 1000);

    return (currentDate.toLocaleDateString());
}

//event listener for when the search button is clicked, which prompts the searchCity function to act
$("#search-button").on("click", function (e) {
    e.preventDefault();

    searchCity();

    $("form")[0].reset();
})

//event listener for when the user clicks on a city listed in saved searches from the local storage
$(".city-list-box").on("click", ".city-name", function () {

    var coordinates = (localStorage.getItem($(this)[0].textContent)).split(" ");
    coordinates[0] = parseFloat(coordinates[0]);
    coordinates[1] = parseFloat(coordinates[1]);

    $("#city-name")[0].textContent = $(this)[0].textContent + " (" + moment().format('M/D/YYYY') + ")";

    listOfCities(coordinates);
})