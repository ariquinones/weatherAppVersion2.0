console.log("hi")

//https://api.forecast.io/forecast/2af24699275f34e8a9b7f95cf5b6de4c/29.711642961073185,-95.38003781323678
//var baseUrl = 'https://api.forecast.io/forecast/'
//var chromeSecurityCode = '?callback=?'
//var apiKey = '2af24699275f34e8a9b7f95cf5b6de4c/'
var weatherContainer = document.querySelector('.weatherContainer')
var buttonsContainer = document.querySelector('.buttonsContainer')
var currentCityContainer = document.querySelector('.currentCityContainer')
var weekObject = {
		1: "Monday",
		2: "Tuesday", 
		3: "Wednesday", 
		4: "Thursday",
		5: "Friday", 
		6: "Saturday",
		7: "Sunday",

}
var getDayOfWeek = new Date() 
var today = getDayOfWeek.getDay()
var searchBar = document.querySelector("input")

// Two models to obtain data from two urls
var WeatherModel = Backbone.Model.extend({
	generateUrl: function(lat,lng) {
		this.url = "https://api.forecast.io/forecast/2af24699275f34e8a9b7f95cf5b6de4c/" + lat + ',' + lng + '?callback=?'
	}
})
var SearchCityModel = Backbone.Model.extend({
	generateUrl: function(searchCity) {
		this.url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + searchCity
	}
})

// Middle Man Views 
var CurrentSearchView = Backbone.View.extend ({
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},
	render: function(data) {
		console.log(data.attributes.results[0].geometry.location)
		var lat = data.attributes.results[0].geometry.location.lat
		var lng = data.attributes.results[0].geometry.location.lng
		console.log(lat)
		console.log(lng)
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var cv = new CurrentView(wm)
		wm.fetch() 
	}
})
var DailySearchView = Backbone.View.extend ({
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},
	render: function(data) {
		console.log(data.attributes.results[0].geometry.location)
		var lat = data.attributes.results[0].geometry.location.lat
		var lng = data.attributes.results[0].geometry.location.lng
		console.log(lat)
		console.log(lng)
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var cv = new DailyView(wm)
		wm.fetch() 
	}
})
var HourlySearchView = Backbone.View.extend ({
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},
	render: function(data) {
		console.log(data.attributes.results[0].geometry.location)
		var lat = data.attributes.results[0].geometry.location.lat
		var lng = data.attributes.results[0].geometry.location.lng
		console.log(lat)
		console.log(lng)
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var cv = new HourlyView(wm)
		wm.fetch() 
	}
})

// Display Views to the Dom 
var CurrentView = Backbone.View.extend({
	el: ".weatherContainer",
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},
	render: function() {
		var currentData = this.model.attributes.currently
		var iconNumber = 1 
		this.el.innerHTML = '<div class="currentCityContainer">' +
							'<p class="currentCityTemperature">' + parseInt(currentData.temperature) + '&deg;F</p>\
							<canvas id="icon'+ iconNumber + '" width="75" height="75"></canvas>\
							<p class="currentCitySummary">' + currentData.summary + '</p>' +
							'<p class="currentDay">' + weekObject[today] + '</p>' +
							'</div>'			
		var iconString = currentData.icon
 		doSkyconStuff(iconString,iconNumber)
	}
})
var DailyView = Backbone.View.extend({
	el: ".weatherContainer",
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},
	render: function() {
		var dailyData = this.model.attributes.daily.data
		var hmtlString = ''
		var iconNumber = 1

		var icon
		for (var i = 0; i < dailyData.length; i++) {
			if (today < 7) {
				today += 1

				var dayObject = dailyData[i]
				var iconString = dayObject.icon

				hmtlString += '<div class="dailyTemperature">\
							<p class="day">' + weekObject[today].substring(0,3) + '</p>\
							<canvas class="skycon" id="icon' + iconNumber + '" width="75" height="75" data-icon="'+ iconString +'"></canvas>\
							<p class="maxTemp">' + parseInt(dayObject.temperatureMax) + '&deg;</p><p class="minTemp"> / ' + parseInt(dayObject.temperatureMin) + '&deg;</p>\
							</div>'
				iconNumber += 1

				// doSkyconStuff(iconNumber, iconString) ... however <canvas> not on page

 			} else { today = 0}
		}
		
		this.el.innerHTML =  hmtlString


		var allSkycons = document.querySelectorAll('canvas.skycon');

		for (var i = 0 ; i < allSkycons.length; i++){
			var iconDataValueForElement = allSkycons[i].dataset.icon 
			doSkyconStuff( iconDataValueForElement, i+1 )

		}

	}
})
var HourlyView = Backbone.View.extend({
	el: ".weatherContainer",
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},
	render: function() {
		var hourlyData = this.model.attributes.hourly.data
		var hmtlString = ''
		function getHourTime (input) {
			var hour = new Date(input * 1000)
			return hour.getHours() + ":" + hour.getMinutes() + hour.getMinutes() 
		}
		for (var i = 0; i < 24 ; i++) {
			var hourlyObject = hourlyData[i] 
			hmtlString += '<div class="hourlyTemperature">\
							<p class="hourlyTime">' + getHourTime(hourlyObject.time) + '</p>\
							<p class="hourlySummary">' + hourlyObject.summary + '</p>\
							<p class="hourlyTemp">' + parseInt(hourlyObject.temperature) + '&deg;F / </p>\
							<p class="hourlyWind">' + parseInt(hourlyObject.windSpeed) + 'mph</p>\
							<p class="hourlyPrecip">Precip: ' + parseInt(hourlyObject.precipProbability*100) + '%</p></div>'
		}
		this.el.innerHTML =  hmtlString 
	}
})

// Main and only router
var WeatherRouter = Backbone.Router.extend ({
	routes: {
		"currentForecast/:searchCity": "handleCurrentSearchCity",
		"dailyForecast/:searchCity": "handleDailySearchCity",
		"hourlyForecast/:searchCity": "handleHourlySearchCity",
		"currentForecast/:lat/:lng": "handleCurrentWeather",
		"dailyForecast/:lat/:lng": "handleDailyWeather",
		"hourlyForecast/:lat/:lng": "handleHourlyWeather",
		"*default": "handleDefault"
	},
	handleCurrentWeather: function(lat,lng) {
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var cv = new CurrentView(wm)
		wm.fetch() 
	},
	handleDailyWeather: function(lat,lng) {
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var dv = new DailyView(wm)
		wm.fetch()
	},
	handleDefault: function() {
			// get current lat long, write into the route
		var successCallback = function(positionObject) {
			var lat = positionObject.coords.latitude 
			var lng = positionObject.coords.longitude 
			location.hash = "currentForecast/" + lat + "/" + lng
		}
		var errorCallback = function(error) {
			console.log(error)
		}
		window.navigator.geolocation.getCurrentPosition(successCallback,errorCallback)
	},
	handleHourlyWeather: function(lat,lng) {
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var hv = new HourlyView(wm)
		wm.fetch()
	},
	handleCurrentSearchCity: function(searchCity) {
		var scm = new SearchCityModel()
		scm.generateUrl(searchCity)
		var csv = new CurrentSearchView(scm)
		scm.fetch()
	},
		handleDailySearchCity: function(searchCity) {
		var scm = new SearchCityModel()
		scm.generateUrl(searchCity)
		var csv = new DailySearchView(scm)
		scm.fetch()
	},
		handleHourlySearchCity: function(searchCity) {
		var scm = new SearchCityModel()
		scm.generateUrl(searchCity)
		var csv = new HourlySearchView(scm)
		scm.fetch()
	},
	initialize: function() {
		Backbone.history.start()
	}

})



// Changing the route and hash functions 
function hashChanging(clickEvent) {
	var route = window.location.hash.substring(1),
		routeParts = route.split('/')
		// lat = routeParts[1]
		// lng = routeParts[2]
		searchCity = routeParts[1]
	var buttonClicked = clickEvent.target
	var userSearch = buttonClicked.value
	//location.hash = userSearch + "/" + lat + '/' + lng
	location.hash = userSearch + "/" + searchCity
}

function searchNewCity (keyEvent) {
	var inputEl = keyEvent.target
	if (keyEvent.keyCode === 13) {
		var newSearchQuery = inputEl.value
		location.hash = "currentForecast/" + newSearchQuery
		inputEl.value = ''
	}
}

var myRtr = new WeatherRouter() 
searchBar.addEventListener('keydown',searchNewCity)
buttonsContainer.addEventListener('click',hashChanging)
//window.addEventListener('hashchange', weatherRouter)



var doSkyconStuff = function(iconString, iconNumber) {

	var formattedIcon = iconString.toUpperCase().replace(/-/g,"_")
	  // on Android, a nasty hack is needed: {"resizeClear": true}
	//add CANVAS DOM element on the page to list of animitable elements (finds Canvas-element on 'id' attribute)
	//    NOTE: Canvas-Element MUST be present on page  
	var skycons = new Skycons({"color": "white"});
	    		//1.DOM_element: id    2.skycon-icon-label(must be uppercase)
	skycons.add("icon" + iconNumber, Skycons[formattedIcon]);

	  // start animation!
	skycons.play();
}










// var weatherRouter = Backbone.Router.extend({
// 	routes: {
// 		"currentForecast/:lat/:lng": "showCurrentView",
// 		"hourlyForecast/:lat/:lng": "showHourlyView",
// 		"weeklyForecast/:lat/:lng": "showWeeklyView",
// 		"*default": "showDefaultView"
// 	},
// 	showCurrentView: function(lat,lng) {
// 		var promise = getPromise(lat,lng)
// 		promise.then(renderCurrentView)
// 	},
// 	showHourlyView: function(lat,lng) {
// 		var promise = getPromise(lat,lng)
// 		promise.then(renderHourlyView)
// 	},
// 	showDefaultView: function() {
// 		// get current lat long, write into the route
// 		var successCallback = function(positionObject) {
// 			var lat = positionObject.coords.latitude 
// 			var lng = positionObject.coords.longitude 
// 			location.hash = "current/" + lat + "/" + lng
// 		}
// 		var errorCallback = function(error) {
// 			console.log(error)
// 		}
// 		window.navigator.geolocation.getCurrentPosition(successCallback,errorCallback)
// 	},

// 	showWeeklyView: function(lat,lng) {
// 		var promise = getPromise(lat,lng)
// 		promise.then(renderWeeklyView)
// 	}
// })

// function getPromise(lat,lng) {
// 	var promise = $.getJSON(baseUrl + apiKey + lat + "," + lng + chromeSecurityCode)
// 	return promise
// }


// function renderCurrentView(jsonData) {
// 	weatherContainer.innerHTML = ''
// 	console.log(jsonData)
// 	weatherContainer.innerHTML = '<p>' + parseInt(jsonData.currently.temperature) + '&deg;F</p><p>' + jsonData.currently.summary + '</p>' +
// 								'<p>' + weekObject[today] + '</p>' +
// 								'<canvas id="icon1" width="128" height="128"></canvas>'
// 	var iconString = jsonData.currently.icon
// 	doSkyconStuff(iconString)

// }
// function renderHourlyView(jsonData) {
// 	weatherContainer.innerHTML = ''
// 	var hourlyArray = jsonData.hourly.data 
// 	console.log (hourlyArray)
// 	for (var i = 0; i<24; i++) {
// 		weatherContainer.innerHTML += '<div class="hourlyTemperature"><p>' + hourlyArray[i].temperature + '</p><p>' + jsonData.currently.summary + '</p></div>'
// 	}
// }
// function renderWeeklyView(jsonData) {
// 	weatherContainer.innerHTML = ''
// 	console.log(jsonData)
// 	var weeklyArray = jsonData.daily.data 
// 	for (var i=0; i<weeklyArray.length; i++) {
// 		weatherContainer.innerHTML +=  '<div class="weeklyTemperature"><p>' + weeklyArray[i].summary + '</p><p>' + parseInt(weeklyArray[i].temperatureMax) + '</p></div>'
// 	}
// }




