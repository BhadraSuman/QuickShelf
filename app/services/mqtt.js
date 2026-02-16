const mqtt = require("mqtt");
const PImage = require("pureimage");
const { Writable } = require("stream");
const path = require("path"); // Required to find the font file

// --- MQTT SETUP ---
const MQTT_BROKER = process.env.MQTT_BROKER || "mqtt://broker.hivemq.com";
const STORE_TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || "velarc/store_01";

const client = mqtt.connect(MQTT_BROKER);

client.on("connect", () => {
    console.log(`[vTransmit] Connected to MQTT: ${MQTT_BROKER}`);
});

// --- FONT SETUP (CRITICAL) ---
// 1. Point this to where you saved your .ttf file
const fontPath = path.join(__dirname, "../fonts/OpenSans-Bold.ttf"); 

// 2. Register the font with PureImage
const fnt = PImage.registerFont(fontPath, 'OpenSans');

// --- HELPER: IMAGE GENERATOR ---
const generateTagPayload = async (productName, price) => {
    try {
        // 3. Ensure Font is Loaded before drawing
        // PureImage requires the font to be loaded into memory first
        if (!fnt.loaded) {
            console.log("[vCore] Loading Font...");
            await fnt.loadPromise(); // Wait for load
        }

        const width = 160;
        const height = 128;
        const img = PImage.make(width, height);
        const ctx = img.getContext("2d");

        // --- DRAWING THE UI ---

        // 1. Background (White)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);

        // 2. Top Header Bar (Black)
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, 25);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "12pt OpenSans"; // Use the font family name you registered
        ctx.fillText("SMART STORE", 35, 18); // x, y (baseline)

        // 3. Product Name (Black Text)
        ctx.fillStyle = "#000000";
        
        // Auto-resize text slightly based on length
        if (productName.length > 15) {
            ctx.font = "14pt OpenSans";
        } else {
            ctx.font = "18pt OpenSans";
        }
        ctx.fillText(productName, 10, 55);

        // 4. Price Box (Red)
        ctx.fillStyle = "red";
        ctx.fillRect(10, 70, 140, 45);

        // 5. Price Text (White)
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "28pt OpenSans"; 
        ctx.fillText("Rs " + price, 20, 105);

        // --- ENCODING TO PNG ---
        const stream = new Writable();
        const chunks = [];
        stream._write = (chunk, encoding, next) => {
            chunks.push(chunk);
            next();
        };

        await PImage.encodePNGToStream(img, stream);
        
        console.log(`[vCore] Generated Image for ${productName}: ${chunks.length} chunks`);
        return Buffer.concat(chunks);

    } catch (error) {
        console.error("[vCore] Image Generation Error:", error);
        // Fallback: If font fails, throw error so Controller knows
        throw error;
    }
};

module.exports = { generateTagPayload, client, STORE_TOPIC_PREFIX };