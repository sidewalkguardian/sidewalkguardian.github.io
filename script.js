var list;
var lat= "";
var lng= "";
var city= "";
var suburb= "";
var neighbourhood = "";
var road= "";
var fullAddress= "";

$.get('list.json', function(dataList) {
list = dataList;
});

$("#twzipcode").twzipcode({
                });

// initial map
var mymap = L.map('mapid').setView([25.0478, 121.5319], 13);

// load OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18,
}).addTo(mymap);

// click map
mymap.on('click', function(e) {
    lat = e.latlng.lat;
    lng = e.latlng.lng;
    let addressResult = new Promise(resolve => {
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&zoom=18&format=json`)
        .then(res => res.json())
        .then(data => {
            city = data.address.city;
            suburb = data.address.suburb || data.address.town;
            neighbourhood = data.address.neighbourhood || data.address.village || "";
            road = data.address.road;
            fullAddress = city+suburb+neighbourhood+road;
            resolve(fullAddress);
        })
    });
    
    addressResult.then(fullAddress => {
        document.querySelector('#address').value = fullAddress;
    });
});

// clear
function emptyForm()
{
    initial();
    $('#form')[0].reset();
    document.getElementById("output").innerHTML = ``;
}

function initial()
{
    lat= "";
    lng= "";
    city= "";
    suburb= "";
    neighbourhood = "";
    road= "";
    fullAddress= "";
}

// query
function query(){
    document.getElementById("output").innerHTML = `<div class="spinner-border" role="status"></div>`;
    //var county = $("#twzipcode").twzipcode('get', 'county');
    //var district = $("#twzipcode").twzipcode('get', 'district');
    var content = "";

    if (fullAddress != "")
    {
        processXMLtoContent(city, suburb, neighbourhood, content)
        return;
    }
    else
    {
        var address = $("#address").val();
        address = address.replace(/\d+號/, "");
        let addressResult = new Promise(resolve => {
            fetch(`https://nominatim.openstreetmap.org/search?q=${address}&format=json&addressdetails=1&limit=1`)
            .then(res => res.json())
            .then(data => {
                if (data.length == 0)
                {
                    document.getElementById("output").innerHTML = address + " 查無資料";
                    initial();
                    return;
                }
                city = data[0].address.city;
                suburb = data[0].address.suburb;
                neighbourhood = data[0].address.neighbourhood;
                road = data[0].address.road;
                fullAddress = city+suburb+neighbourhood+road;
                resolve(fullAddress);
            })
        });
        
        addressResult.then(fullAddress => {
            processXMLtoContent(city, suburb, neighbourhood, content)
            return;
        });
    }
    
}

// map point to select place
var districtSelect = document.querySelector('[data-name="district"]');

// change listener
districtSelect.addEventListener('change', function() {
    var county = $("#twzipcode").twzipcode('get', 'county');
    var district = $("#twzipcode").twzipcode('get', 'district');
    var address = county + district;

    fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(address) + '&format=json&limit=1')
        .then(function(response) {
        return response.json();
        })
        .then(function(data) {
            var lat = data[0].lat;
            var lon = data[0].lon;
            mymap.setView([lat, lon], 13);
    });
});

// main process
function processXMLtoContent(city, suburb, neighbourhood, content)
{
    for (var i = 0; i < list.length; i++)
    {
        if (city == list[i].county && suburb == list[i].town && neighbourhood == list[i].village)
        {
            content = content + city + suburb + neighbourhood + "<br>" + list[i].name + "<br>" + list[i].phone + "<br>" + list[i].address;
            document.getElementById("output").innerHTML = content;
            initial();
            return;
        }
    }

    if (content == "")
    {
        document.getElementById("output").innerHTML = fullAddress + " 查無資料";
        initial();
    }
}
