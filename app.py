from flask import Flask, render_template, request, jsonify
import os
import requests
from dotenv import load_dotenv


load_dotenv()

SWEDAVIA_API_KEY = os.getenv("SWEDAVIA_API_KEY")

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/flights")
def get_flights():

    # Get values sent from the frontend
    airport = request.args.get("airport")
    date = request.args.get("date")
    flight_type = request.args.get("type")

    # Basic validation
    if not airport or not date or flight_type not in ["departures", "arrivals"]:
        return jsonify({
            "error": "Missing or invalid parameters"
        }), 400

    # Make airport code uppercase
    airport = airport.upper()

    # Build Swedavia API URL
    url = f"https://api.swedavia.se/flightinfo/v2/{airport}/{flight_type}/{date}"

    headers = {
        "Ocp-Apim-Subscription-Key": SWEDAVIA_API_KEY,
        "Accept": "application/json"
    }

    # Request flight data from Swedavia
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return jsonify({
            "error": "Could not get flight information",
            "status": response.status_code
        }), response.status_code

    data = response.json()

    flights = data["flights"]

    return jsonify({
        "airport": airport,
        "date": date,
        "type": flight_type,
        "numberOfFlights": data["numberOfFlights"],
        "flights": flights
    })


if __name__ == "__main__":
    app.run(debug=True)