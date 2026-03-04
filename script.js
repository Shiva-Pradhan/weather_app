const apiKey = "e1cccbe654e5a9b991083e1b84f4c835";

function getWeather(){
const city = document.getElementById("cityInput").value.trim();

if(city === ""){
    resetTheme();
    return;
}

fetchWeather(city);
}

function fetchWeather(city){
fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
.then(res=>{
    if(!res.ok){
        alert("City not found");
        resetTheme();
        throw new Error("City not found");
    }
    return res.json();
})
.then(data=>{
    if(data){
        updateCurrent(data);
        createForecast(data);
        getAQI(data.city.coord.lat,data.city.coord.lon);
    }
})
.catch(error=>{
    console.log("Error:", error);
});
}

function updateCurrent(data){

if(!data.list || data.list.length === 0) return;

const current = data.list[0];

document.getElementById("cityName").innerText=data.city.name;
document.getElementById("date").innerText=new Date().toDateString();
document.getElementById("temp").innerText=current.main.temp+"°C";
document.getElementById("condition").innerText=current.weather[0].main;
document.getElementById("humidity").innerText=current.main.humidity+"%";
document.getElementById("wind").innerText=current.wind.speed+" km/h";

document.getElementById("weatherIcon").src=
`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;

changeTheme(current.weather[0].main);
}

function changeTheme(condition){

if(condition.includes("Rain")){
    document.body.style.background =
    "linear-gradient(135deg, #2c3e50, #4ca1af)";
}
else if(condition.includes("Cloud")){
    document.body.style.background =
    "linear-gradient(135deg, #757f9a, #d7dde8)";
}
else if(condition.includes("Clear")){
    document.body.style.background =
    "linear-gradient(135deg, #0f2027, #2c5364)";
}
else if(condition.includes("Snow")){
    document.body.style.background =
    "linear-gradient(135deg, #83a4d4, #b6fbff)";
}
else{
    resetTheme();
}
}

function resetTheme(){
document.getElementById("forecastSection").classList.add("hidden");
document.body.style.background =
"linear-gradient(135deg, #141E30, #243B55)";
}

function createForecast(data){

const section = document.getElementById("forecastSection");
section.classList.remove("hidden");
section.classList.add("show");

const container=document.getElementById("forecastContainer");
container.innerHTML="";

const daily={};

data.list.forEach(item=>{
const date=item.dt_txt.split(" ")[0];

if(!daily[date]){
daily[date]={
min:item.main.temp_min,
max:item.main.temp_max,
weather:item.weather[0].main,
icon:item.weather[0].icon
};
}else{
daily[date].min=Math.min(daily[date].min,item.main.temp_min);
daily[date].max=Math.max(daily[date].max,item.main.temp_max);
}
});

Object.keys(daily).slice(1,6).forEach(date=>{

const dayName=new Date(date).toLocaleDateString('en-US',{weekday:'long'});

const card=document.createElement("div");
card.className="forecast-card";

card.innerHTML=`
<h3>${dayName}</h3>
<img src="https://openweathermap.org/img/wn/${daily[date].icon}@2x.png">
<p>${daily[date].weather}</p>
<p>⬆ ${daily[date].max.toFixed(1)}°C</p>
<p>⬇ ${daily[date].min.toFixed(1)}°C</p>
`;

container.appendChild(card);

});
}

function getAQI(lat,lon){
fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
.then(res=>res.json())
.then(data=>{

if(!data.list) return;

const level=data.list[0].main.aqi;

let meaning="";

if(level===1) meaning="Good";
if(level===2) meaning="Fair";
if(level===3) meaning="Moderate";
if(level===4) meaning="Poor";
if(level===5) meaning="Very Poor";

document.getElementById("aqi").innerText=`${level} - ${meaning}`;

})
.catch(error=>{
console.log("AQI Error:", error);
});
}

function getLocationWeather(){

if(!navigator.geolocation){
alert("Geolocation not supported by this browser.");
return;
}

navigator.geolocation.getCurrentPosition(

position=>{
const lat=position.coords.latitude;
const lon=position.coords.longitude;

fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
.then(res=>{
if(!res.ok){
alert("Unable to fetch location weather");
throw new Error("Location weather failed");
}
return res.json();
})
.then(data=>{
updateCurrent(data);
createForecast(data);
getAQI(lat,lon);
})
.catch(error=>{
console.log("Location Error:", error);
});

},

error=>{
alert("Location access denied. Please allow location permission.");
}

);
}

document.getElementById("cityInput")
.addEventListener("keypress",function(e){
if(e.key==="Enter"){
getWeather();
}
});