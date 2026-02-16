const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LogsSchema = new Schema(
    {
        macAddress: { type: String, required: true },
        batteryLevel: { type: Number, required: true },
        wifiSignal: { type: Number, required: true },
        message: { type: String, default: "Heartbeat / Config Fetch" },
        ipAddress: { type: String, default: null },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Logs", LogsSchema);
