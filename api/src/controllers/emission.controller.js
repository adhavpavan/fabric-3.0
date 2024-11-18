const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, agreementService } = require('../services');
const { getPagination } = require('../utils/pagination');
const { getSuccessResponse } = require('../utils/Response');
const { addEmission, queryEmissionById } = require('../services/emission.service');

const createEmission = catchAsync(async (req, res) => {
  let { user } = req.loggerInfo;
  console.log('============user========', user);
  const result = await addEmission(req.body, user) //await agreementService.createAgreement(req.body, fileMetadata, user);
  res.status(httpStatus.CREATED).send(getSuccessResponse(httpStatus.CREATED, 'Emission data created successfully', result));
});

const getHistoryById = catchAsync(async (req, res) => {
  const { id } = req.params;

  let { user } = req.loggerInfo;
  let data = await agreementService.queryHistoryById(id, user);

  res.status(httpStatus.OK).send(getSuccessResponse(httpStatus.OK, 'Agreement fetched successfully', data));
});

const getEmissionById = catchAsync(async (req, res) => {
  const { id } = req.params;

  let { user } = req.loggerInfo;
  let data = await queryEmissionById(id, user) //await agreementService.queryAgreementById(id, user);

  res.status(httpStatus.OK).send(getSuccessResponse(httpStatus.OK, 'Emission fetched successfully', data));
});

module.exports = {
  createEmission,
  getEmissionById,
  getHistoryById,
};
