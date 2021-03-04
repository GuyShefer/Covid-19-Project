(function () {

    const countriesBaseUrl = 'https://api.allorigins.win/raw?url=' + 'https://restcountries.herokuapp.com/api/v1';
    const coronaBaseUrl = 'https://corona-api.com/countries/';
    let world = {};

    async function getWorld() {
        const countriesArr = (await (await fetch(countriesBaseUrl)).json());

        for (let i = 0; i < countriesArr.length; i++) {
            const country = await getCountryByCCA(countriesArr[i].cca2);
            countriesArr[i].region in world ? world[countriesArr[i].region].push(country) : world[countriesArr[i].region] = [country];
        }
        console.log(world);
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

})();


