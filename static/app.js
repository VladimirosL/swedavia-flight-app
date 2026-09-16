const airportInput = document.getElementById("airport");
const dateInput = document.getElementById("date");
const departuresButton = document.getElementById("departures");
const arrivalsButton = document.getElementById("arrivals");
const results = document.getElementById("results");


async function getFlights(type) {
    const airport = airportInput.value;
    const date = dateInput.value;

    // Send request to our Flask backend
    const response = await fetch(
        `/api/flights?airport=${airport}&date=${date}&type=${type}`
    );

    // Convert response to JavaScript object
    const data = await response.json();

    console.log(data);


    // Remove flights with status "Deleted"
    const activeFlights = data.flights.filter(function (flight) {
        return flight.locationAndStatus?.flightLegStatusEnglish !== "Deleted";
    });


    // Sort flights by scheduled time
    activeFlights.sort(function (a, b) {

        const timeA = type === "departures"
            ? a.departureTime?.scheduledUtc
            : a.arrivalTime?.scheduledUtc;

        const timeB = type === "departures"
            ? b.departureTime?.scheduledUtc
            : b.arrivalTime?.scheduledUtc;

        return new Date(timeA) - new Date(timeB);
    });


    // Change heading depending on departures or arrivals
    const locationHeading =
        type === "departures" ? "Destination" : "From";


    // Start building table
    let flightHTML = `
        <h2>${type} - ${data.airport}</h2>
        <p>${activeFlights.length} flights found</p>

        <table>
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Flight</th>
                    <th>Airline</th>
                    <th>${locationHeading}</th>
                    <th>Terminal</th>
                    <th>Gate</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;


    // Loop through every active flight
    activeFlights.forEach(function (flight) {

        let scheduledTime;
        let location;


        // Departures and arrivals use different API fields
        if (type === "departures") {
            scheduledTime = flight.departureTime?.scheduledUtc;
            location = flight.arrivalAirportEnglish;
        } else {
            scheduledTime = flight.arrivalTime?.scheduledUtc;
            location = flight.departureAirportEnglish;
        }


        // Convert UTC time to local Swedish time
        const time = scheduledTime
            ? new Date(scheduledTime).toLocaleTimeString("sv-SE", {
                hour: "2-digit",
                minute: "2-digit"
            })
            : "-";


        // Extract information from the flight
        const flightId = flight.flightId ?? "-";

        const airline =
            flight.airlineOperator?.name ?? "-";

        const terminal =
            flight.locationAndStatus?.terminal ?? "-";

        const gate =
            flight.locationAndStatus?.gate ?? "-";

        const status =
            flight.locationAndStatus?.flightLegStatusEnglish ?? "-";


        // Add flight to table
        flightHTML += `
            <tr>
                <td>${time}</td>
                <td>${flightId}</td>
                <td>${airline}</td>
                <td>${location ?? "-"}</td>
                <td>${terminal}</td>
                <td>${gate}</td>
                <td>${status}</td>
            </tr>
        `;
    });


    // Finish table
    flightHTML += `
            </tbody>
        </table>
    `;


    // Display table on webpage
    results.innerHTML = flightHTML;
}


// Departures button
departuresButton.addEventListener("click", function () {
    getFlights("departures");
});


// Arrivals button
arrivalsButton.addEventListener("click", function () {
    getFlights("arrivals");
});