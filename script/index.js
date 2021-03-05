(function () {

    // const countriesBaseUrl = 'https://api.allorigins.win/raw?url=' + 'https://restcountries.herokuapp.com/api/v1';
    const countriesBaseUrl = 'https://api.codetabs.com/v1/proxy?quest=' + 'https://restcountries.herokuapp.com/api/v1';
    const coronaBaseUrl = 'https://corona-api.com/countries/';
    let world = {};
    let currentRegion = 'World';
    const indicatorBtns = document.querySelectorAll('.ind-btns');
    const regionBtns = document.querySelectorAll('.reg-btn');
    const dropDown = document.querySelector('.drop-down');
    let select = document.querySelector('#selection');
    const modal = document.querySelector('.modal');
    const modalHeader = document.querySelector('h3');
    let modalBody = document.querySelector('.modal-body');
    const closeModal = document.querySelector('.close');
    const showCountyBtn = document.querySelector('.select-btn');
    const animation = document.querySelector('.animation');
    getWorld();

    async function getWorld() {
        const countriesArr = (await (await fetch(countriesBaseUrl)).json());
        for (let i = 0; i < countriesArr.length; i++) {
            const country = await getCountryByCCA(countriesArr[i].cca2);
            countriesArr[i].region in world ? world[countriesArr[i].region].push(country) : world[countriesArr[i].region] = [country];
        }
        animation.style.display = 'none';
        convetObjToArrays('confirmed');
    }

    async function getCountryByCCA(code) {
        if (code !== 'XK') {
            const response = await fetch(`${coronaBaseUrl}${code}`);
            const data = (await response.json()).data;
            const country = {
                name: data.name,
                confirmed: data.latest_data.confirmed,
                deaths: data.latest_data.deaths,
                recovered: data.latest_data.recovered,
                critical: data.latest_data.critical,
                code: code,
            }
            return country;
        }
    }

    // convert the world object to 2 arrays(country name ,indicator value) to diplay it in the chart.
    function convetObjToArrays(indicatorBtn) {
        if (select !== null) {
            select.remove();
        }
        select = document.createElement('select');
        dropDown.appendChild(select);
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
                if (country !== undefined) {
                    labelsArr.push(country.name);
                    dataArr.push(country[indicatorBtn]);
                    // adding new option to the dropdown.
                    const option = document.createElement('option');
                    option.value = country.code;
                    option.innerHTML += `${country.name}`;
                    select.appendChild(option);
                }
            })
        }

        displayChart(labelsArr, dataArr, currentRegion);
    }

    // display the chart
    const displayChart = (keys, values, region) => {

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
    };

    // set current indicator + add an event listener
    for (let i = 0; i < indicatorBtns.length; i++) {
        indicatorBtns[i].addEventListener('click', () => {
            let indicatorBtn = (indicatorBtns[i].textContent).toLowerCase();
            convetObjToArrays(indicatorBtn);
        })
    }

    // get the region buttons and set an event listener
    for (let i = 0; i < regionBtns.length; i++) {
        regionBtns[i].addEventListener('click', () => {
            currentRegion = regionBtns[i].textContent
            convetObjToArrays('confirmed');
        });
    }

    // open county modal when clicked
    showCountyBtn.addEventListener('click', async () => {
        const conutry = await getCountryInfo();
        createModal(conutry);
        modal.style.display = "block";
    })

    // duplicate function!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    const getCountryInfo = async () => {
        const cca = select.options[select.selectedIndex].value;
        const response = await fetch(`${coronaBaseUrl}${cca}`);
        const data = (await response.json()).data;
        // getting the country obj from the api
        const country = {
            name: data.name,
            population: data.population,
            deaths: data.latest_data.deaths,
            confirmed: data.latest_data.confirmed,
            critical: data.latest_data.critical,
            recovered: data.latest_data.recovered,
            deathRate: (data.latest_data.calculated.death_rate).toFixed(2),
        }
        return country;
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

    // close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = "none";
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }


})();


