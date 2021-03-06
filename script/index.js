(function () {

    // const countriesBaseUrl = 'https://api.allorigins.win/raw?url=' + 'https://restcountries.herokuapp.com/api/v1';
    const countriesBaseUrl = 'https://api.codetabs.com/v1/proxy?quest=' + 'https://restcountries.herokuapp.com/api/v1';
    const coronaBaseUrl = 'https://corona-api.com/countries/';
    let world = {};
    let currentRegion = 'World';
    const indicatorBtns = document.querySelectorAll('.ind-btns');
    const regionBtns = document.querySelectorAll('.reg-btn');
    const selectInput = document.querySelector('#select-input');
    let select = document.querySelector('#selection');
    const modal = document.querySelector('.modal');
    const modalHeader = document.querySelector('h3');
    let modalBody = document.querySelector('.modal-body');
    const closeModal = document.querySelector('.close');
    const showCountyBtn = document.querySelector('.select-btn');
    const animation = document.querySelector('.animation');
    getWorld();

    // Getting the world object from the api.
    async function getWorld() {
        try {
            world = JSON.parse(localStorage.getItem('world'));
            if (world === null) {
                world = {};

                const countriesArr = (await (await fetch(countriesBaseUrl)).json());
                for (let i = 0; i < countriesArr.length; i++) {
                    const country = await getCountryByCCA(countriesArr[i].cca2, countriesArr[i].region);
                    countriesArr[i].region in world ? world[countriesArr[i].region].push(country) : world[countriesArr[i].region] = [country];
                }

                localStorage.setItem('world', JSON.stringify(world));
            }
            animation.style.display = 'none';
            convetObjWorldToArrays('confirmed');
        } catch (err) {
            console.log(err);
        }
    }

    // Getting each conutry by cca code from the api.
    async function getCountryByCCA(code, region) {
        if (code !== 'XK') {
            try {
                const response = await fetch(`${coronaBaseUrl}${code}`);
                const data = (await response.json()).data;

                const country = {
                    name: data.name,
                    region: region,
                    population: data.population,
                    confirmed: data.latest_data.confirmed,
                    deaths: data.latest_data.deaths,
                    recovered: data.latest_data.recovered,
                    critical: data.latest_data.critical,
                }
                return country;
            } catch (err) {
                console.log(err);
            }
        }
    }

    // convert the world object to 2 arrays(country name ,indicator value) to diplay it in the chart.
    function convetObjWorldToArrays(indicatorBtn) {
        if (select !== null) {
            select.remove();
        }
        select = document.createElement('select');
        selectInput.appendChild(select);
        const labelsArr = [];
        const dataArr = [];

        if (currentRegion === 'World') {
            Object.keys(world).forEach(region => {
                addRegionIndicToArraysAndAddDropDownOption(region);
            })
        } else {
            addRegionIndicToArraysAndAddDropDownOption(currentRegion);
        }

        function addRegionIndicToArraysAndAddDropDownOption(currReg) {
            world[currReg].forEach(country => {
                if (country !== undefined && country !== null) {
                    labelsArr.push(country.name);
                    dataArr.push(country[indicatorBtn]);
                    // adding new option to the dropdown.
                    const option = document.createElement('option');
                    option.value = country.region;
                    option.innerHTML += `${country.name}`;
                    select.appendChild(option);
                }
            })
        }

        displayChart(labelsArr, dataArr, currentRegion);
    }

    // display the chart
    function displayChart(keys, values, region) {

        document.getElementById("myChart").remove(); // canvas
        const div = document.querySelector(".canvas"); // parent element
        div.insertAdjacentHTML("afterbegin", "<canvas id='myChart'></canvas>"); //adding the canvas again

        const ctx = document.getElementById('myChart').getContext('2d');
        const myLineChart = new Chart(ctx, {
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
    }

    // set current indicator + add an event listener
    for (let i = 0; i < indicatorBtns.length; i++) {
        indicatorBtns[i].addEventListener('click', () => {
            let indicatorBtn = (indicatorBtns[i].textContent).toLowerCase();
            convetObjWorldToArrays(indicatorBtn);
        })
    }

    // get the region buttons and set an event listener
    for (let i = 0; i < regionBtns.length; i++) {
        regionBtns[i].addEventListener('click', () => {
            currentRegion = regionBtns[i].textContent
            convetObjWorldToArrays('confirmed');
        });
    }

    // open county modal when clicked
    showCountyBtn.addEventListener('click', async () => {
        const country = getCountryInfo();
        createModal(country);
        modal.style.display = "block";
    })

    // getting country information from the 'world' object.
    const getCountryInfo = () => {
        const countryName = select.options[select.selectedIndex].text; // return the country name
        const countryRegion = select.options[select.selectedIndex].value;  // return country region
        for (let i = 0; i < world[countryRegion].length; i++) {
            if (world[countryRegion][i].name === countryName) {
                return world[countryRegion][i];
            }
        }
    }

    // crating the modal
    const createModal = (country) => {
        modalHeader.textContent = (country.name) // set modal title.
        if (modalBody) {
            modalBody.remove();
            modalBody = document.createElement('div')
            modalBody.classList.add("modal-body");
            modal.children[0].appendChild(modalBody);
        }
        for (let [key, value] of Object.entries(country)) {
            const box = document.createElement('div');
            const boxHeader = document.createElement('h4');
            const boxData = document.createElement('p');
            box.classList.add('box');
            boxHeader.textContent = key;
            boxData.textContent = value;
            box.appendChild(boxHeader);
            box.appendChild(boxData);
            modalBody.appendChild(box);
        }
    }

    // close modal button
    closeModal.addEventListener('click', () => {
        modal.style.display = "none";
    });

    // When the user clicks anywhere outside of the modal, close the modal
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

})();


