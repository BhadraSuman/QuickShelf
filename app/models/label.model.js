const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
    macAddress: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        uppercase: true // vital: ensures 'a0:b1' matches 'A0:B1'
    },
    productName: { 
        type: String, 
        default: "New Item" 
    },
    price: { 
        type: String, 
        default: "0.00" 
    },
    currency: { 
        type: String, 
        default: "₹" 
    },
    // Telemetry Fields (Updated during Check-in)
    batteryLevel: { 
        type: Number, 
        default: 0 
    },
    wifiSignal: { 
        type: Number, 
        default: 0 
    },
    lastCheckIn: { 
        type: Date, 
        default: Date.now 
    }
}, { 
    timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Label', labelSchema);