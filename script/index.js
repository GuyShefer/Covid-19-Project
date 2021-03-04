(function () {

    const countriesBaseUrl = 'https://api.allorigins.win/raw?url=' + 'https://restcountries.herokuapp.com/api/v1';
    const coronaBaseUrl = 'https://corona-api.com/countries/';
    let world = {};
    let currentRegion = 'World';
    const indicatorBtns = document.querySelectorAll('.ind-btns');
    const regionBtns = document.querySelectorAll('.reg-btn');

    async function getWorld() {
        const countriesArr = (await (await fetch(countriesBaseUrl)).json());
        for (let i = 0; i < countriesArr.length; i++) {
            const country = await getCountryByCCA(countriesArr[i].cca2);
            countriesArr[i].region in world ? world[countriesArr[i].region].push(country) : world[countriesArr[i].region] = [country];
        }
    }

    async function getCountryByCCA(code) {
        if (code !== 'XK') {
            const response = await fetch(`${coronaBaseUrl}${code}`);
            const data = await response.json();
            let country;
            country = {
                name: data.data.name,
                confirmed: data.data.latest_data.confirmed,
                deaths: data.data.latest_data.deaths,
                recovered: data.data.latest_data.recovered,
                critical: data.data.latest_data.critical,
            }
            return country;
        }
    }

    getWorld();

    // convert the world object to 2 arrays for diplay in the chart. (region become global varible)
    function worldToRegion(indicatorBtn) {
        const labelsArr = [];
        const dataArr = [];
        if (currentRegion === 'World') {
            Object.keys(world).forEach(region => {
                addRegionIndicatorToArrays(region);
            })
        } else {
            addRegionIndicatorToArrays(currentRegion);
        }

        function addRegionIndicatorToArrays(currReg) {
            world[currReg].forEach(city => {
                if (city !== undefined) {
                    labelsArr.push(city.name);
                    dataArr.push(city[indicatorBtn]);
                }
            })
        }

        displayChart(labelsArr, dataArr, currentRegion);
    }

    // display the chart
    const displayChart = (keys, values, region) => {
        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
            // The data for our dataset
            data: {
                labels: keys,
                datasets: [{
                    label: region,
                    backgroundColor: 'rgb(107, 255, 99)',
                    borderColor: 'rgb(120, 122, 119)',
                    data: values
                }]
            },
            // Configuration options go here
            options: {}
        });
    };

    // get the indication buttons and set a listener
    // set current indicator
    for (let i = 0; i < indicatorBtns.length; i++) {
        indicatorBtns[i].addEventListener('click', () => {
            let indicatorBtn = (indicatorBtns[i].textContent).toLowerCase();
            worldToRegion(indicatorBtn);
        })
    }

    // get the region buttons and set a listener
    for (let i = 0; i < regionBtns.length; i++) {
        regionBtns[i].addEventListener('click', () => {
            currentRegion = regionBtns[i].textContent
            worldToRegion('confirmed');
        });
    }

})();


