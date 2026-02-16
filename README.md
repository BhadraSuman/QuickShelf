# Velarc: IoT Electronic Shelf Label (ESL) System

Velarc is an open-source, scalable Electronic Shelf Label (ESL) system built with **ESP32** microcontrollers and a **Node.js** backend. 

Unlike traditional IoT displays that render graphics on the device (slow and battery-intensive), Velarc uses a **Server-Side Rendering (SSR)** architecture. The server generates a pixel-perfect PNG image of the price tag and streams it via **MQTT** to the low-power ESP32 tags.



## 🚀 Features

* **Server-Side Graphics:** Uses `pureimage` to generate dynamic price tags on the server. The ESP32 simply decodes and displays the PNG.
* **Auto-Discovery:** New tags automatically register themselves in the MongoDB database upon first boot.
* **Real-Time Updates:** Price changes are pushed instantly via MQTT.
* **Heartbeat Telemetry:** Tags report Battery Level and Wi-Fi Signal strength (RSSI) every 60 seconds.
* **Security:** Updates are cryptographically verified against the MongoDB registry before being published.

## 🛠️ Tech Stack

### **Hardware**
* **Controller:** ESP32 (Dev Kit V1 or similar)
* **Display:** 1.8" TFT Display (ST7735 or ILI9341 Driver)
* **Connectivity:** Wi-Fi (2.4GHz)

### **Backend Software**
* **Runtime:** Node.js (v18+)
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose)
* **Message Broker:** MQTT (HiveMQ / Mosquitto)
* **Image Processing:** PureImage (Canvas API implementation)

---

## 📦 Installation & Setup

### **1. Backend Setup (Server)**

1.  Clone the repository:
    ```bash
    git clone [https://github.com/yourusername/velarc-esl.git](https://github.com/yourusername/velarc-esl.git)
    cd velarc-esl/backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment:
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    MONGO_URI=mongodb+srv://your_mongo_connection_string
    MQTT_BROKER=mqtt://broker.hivemq.com
    MQTT_TOPIC_PREFIX=velarc/store_01
    ```

4.  Add Fonts:
    * Create a folder named `fonts/` in the backend root.
    * Download `OpenSans-Bold.ttf` (or your preferred font) and place it inside.

5.  Run the Server:
    ```bash
    node server.js
    ```

### **2. Firmware Setup (ESP32)**

1.  Open `firmware/esp32_tag/esp32_tag.ino` in Arduino IDE.
2.  Install required libraries via Library Manager:
    * `Adafruit_ST7735` (Display Driver)
    * `Adafruit_GFX` (Graphics Core)
    * `PubSubClient` (MQTT)
    * `PNGdec` (Image Decoding)
3.  Configure your credentials in the `.ino` file:
    ```cpp
    const char* ssid = "YOUR_WIFI_SSID";
    const char* password = "YOUR_WIFI_PASSWORD";
    const char* backend_url = "http://YOUR_LOCAL_IP:3000/api/checkin/";
    ```
4.  **Wiring Configuration (Default for VSPI):**
    * **CS:** Pin 5
    * **RST:** Pin 4
    * **DC:** Pin 2
    * **MOSI:** Pin 23
    * **SCLK:** Pin 18
    * **VCC:** 3.3V
    * **GND:** GND

---

## 🔌 API Documentation

### **1. Update Price Tag**
Triggers the server to generate a new image and push it to the specific tag via MQTT.

* **Endpoint:** `POST /api/update-tag`
* **Body:**
    ```json
    {
        "tagId": "A4:F0:0F:90:9B:FC",
        "name": "Tata Salt 1kg",
        "price": "55.00"
    }
    ```

### **2. Device Check-in (Internal)**
Called automatically by the ESP32 to report status and fetch configuration.

* **Endpoint:** `GET /api/checkin/:macAddress?battery=100&wifi=-60`
* **Response:**
    ```json
    {
        "command": "SLEEP", 
        "nextCheckIn": 60000
    }
    ```

---

## 📂 Project Structure