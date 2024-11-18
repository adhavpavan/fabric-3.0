const mongoose = require('mongoose');

const emissionsSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  year: {
    type: Number,
    required: true,
  },
  facilityName: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  emissionsTons: {
    type: Number,
    required: true,
  }
}, { timestamps:true });

const Emissions = mongoose.model('Emissions', emissionsSchema);

module.exports = Emissions;
