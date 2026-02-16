const Label = require("../models/label.model");
const Log = require("../models/logs.model");
const { generateTagPayload, STORE_TOPIC_PREFIX, client } = require("../services/mqtt");

const labelControllers = {};

labelControllers.checkIn = async (req, res) => {
    const { mac } = req.params;
    const { battery, wifi, ip } = req.query; // ESP32 sends status in URL params

    try {
        // A. Find the device configuration
        let device = await Label.findOne({ macAddress: mac });

        // If new device, create it automatically (Auto-Discovery!)
        if (!device) {
            device = await new Label({ macAddress: mac }).save();
            console.log(`✨ New Device Discovered: ${mac}`);
        }

        // B. LOGGING (Crucial for your troubleshooting!)
        // We save a log entry every time the device checks in
        await new Log({
            macAddress: mac,
            batteryLevel: battery,
            wifiSignal: wifi,
            message: "Heartbeat / Config Fetch",
            ipAddress: ip || req.ip,
        }).save();

        console.log(`📡 Device ${mac} checked in. Battery: ${battery}%`);

        // C. Send the clean JSON configuration back to ESP32
        res.json({
            name: device.productName,
            price: device.price,
            currency: device.currency,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

labelControllers.updateTag = async (req, res) => {
    const { tagId, name, price } = req.body; // tagId = macAddress

    if (!tagId || !name || !price) {
        return res.status(400).send({ error: "Missing tagId, name, or price" });
    }

    try {
        // 1. VALIDATION: Check if Tag exists in MongoDB 

        const existingLabel = await Label.findOne({ macAddress: tagId });

        if (!existingLabel) {
            console.log(`[Security] Blocked update for unknown tag: ${tagId}`);

            return res.status(404).json({ error: "Tag not registered in system" });
        }

        console.log(`[Manager] Authorized update for ${tagId}`);

        // 2. UPDATE TAG CONFIG IN MONGODB

        existingLabel.productName = name;
        existingLabel.price = price;
        await existingLabel.save();

        // 2. GENERATE IMAGE (vCore)

        const imageBuffer = await generateTagPayload(name, price);

        // 3. PUBLISH TO MQTT (vTransmit)

        const topic = `${STORE_TOPIC_PREFIX}/${tagId}`;

        console.log(imageBuffer)

        client.publish(topic, imageBuffer, (err) => {
            if (err) {
                console.error("[vTransmit] MQTT Error:", err);

                return res.status(500).json({ error: "MQTT Publish Failed" });
            }

            console.log(`[vTransmit] Published update to ${topic}`);

            res.json({ message: "Tag updated successfully" });
        });
    } catch (error) {
        console.error(error);

        res.status(500).send("Server Error");
    }
};

module.exports = labelControllers;
