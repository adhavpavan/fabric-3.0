const Joi = require('joi');
const { USER_DEPARTMENT, APPROVAL_STATUS } = require('../utils/Constants');
const { password } = require('./custom.validation');

const createEmission = Joi.object().keys({
  facilityName: Joi.string().required(),
  companyName: Joi.string().required(),
  latitude: Joi.number().required().min(-90).max(90),
  longitude: Joi.number().required().min(-180).max(180),
  year: Joi.number().required().min(1900).max(new Date().getFullYear()),
  emissionsTons: Joi.number().required().min(1).max(5000)
});


const getEmissionById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
}

module.exports = {
  createEmission,
  getEmissionById,

};
