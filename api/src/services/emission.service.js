const httpStatus = require('http-status');
const { User } = require('../models');
const mongoose = require('mongoose');

const ApiError = require('../utils/ApiError');
const { Gateway, Wallets } = require('fabric-network');
const { getContractObject, getAgreementsWithPagination } = require('../utils/blockchainUtils');
const {
  NETWORK_ARTIFACTS_DEFAULT,
  BLOCKCHAIN_DOC_TYPE,
  AGREEMENT_STATUS,
  FILTER_TYPE,
} = require('../utils/Constants');
const { getUUID } = require('../utils/uuid');
const { getSignedUrl } = require('../utils/fileUpload');
const Emissions = require('../models/emission.model');

// If we are sure that max records are limited, we can use any max number
const DEFAULT_MAX_RECORDS = 100
const utf8Decoder = new TextDecoder();


/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<Agreement>}
 */
const addEmission = async (emissionData, user) => {

  console.log("----------addEmission--------------",emissionData, user )
  let gateway;
  let client
  let id = new mongoose.Types.ObjectId()
  try {
    let dateTime = new Date();
    let orgName = `org${user.orgId}`;
    const newEmission = new Emissions({
      year: emissionData.year,
      facilityName: emissionData.facilityName,
      companyName: emissionData.companyName,
      latitude: emissionData.latitude,
      longitude: emissionData.longitude,
      emissionsTons: emissionData.emissionsTons,
      createAt: dateTime,
      updatedAt: dateTime,
    });


    const contract = await getContractObject(
      orgName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );
    const emission = JSON.parse(JSON.stringify(newEmission))// Object.assign({}, newEmission);
    console.log("------newEmission-------", newEmission, emission)

    emission.id= id
    await contract.submitTransaction("CreateAsset", JSON.stringify(emission));
    newEmission._id= id
    await newEmission.save()

    return newEmission;
  } catch (error) {
    console.log(error);
  } finally {
    if (gateway) {
      gateway.close();
    }
    if (client) {
      client.close()
    }
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryEmissions = async (companyName) => {
  try {

    query = `{\"selector\":{\"companyName\": \"${companyName}\"}}`;

    console.log('filters--------------', companyName, query);
    let data = await getAgreementsWithPagination(
      query,
      filter.pageSize,
      filter.bookmark,
      filter.orgName,
      filter.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME
    );
    return data;
  } catch (error) {
    console.log('error--------------', error);
  }
};


const queryHistoryById = async (id, user) => {
  let gateway;
  let client
  try {
    let orgName = `org${user.orgId}`;
    const contract = await getContractObject(
      orgName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );
    let result = await contract.submitTransaction('getAssetHistory', id);
    // result = JSON.parse(result.toString());
    result = JSON.parse(utf8Decoder.decode(result));
    if (result) {
      result = result?.map(elm => {
        return { txId: elm?.txId, IsDelete: elm.IsDelete, ...elm.Value, timeStamp: elm?.Timestamp?.seconds?.low * 1000 }
      })
    }
    return result;
  } catch (error) {
    console.log(error);
  } finally {
    if (gateway) {
      gateway.close();
    }
    if (client) {
      client.close()
    }
  }
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const queryEmissionById = async (id, user) => {
  let gateway;
  let client;
  try {
    let orgName = `org${user.orgId}`;

    const contract = await getContractObject(
      orgName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );
    let result = await contract.submitTransaction('getAssetByID', id);
    console.timeEnd('Test');
    result = JSON.parse(utf8Decoder.decode(result));
    if (result) {
      result.document.url = await getSignedUrl(result?.document?.id, orgName);
    }
    let filter = {
      pageSize: DEFAULT_MAX_RECORDS,
      bookmark: '',
      orgName,
      email: user.email,
      agreementId: id
    }

    let approvals = await queryApprovalsByAgreementId(filter)
    result.approvals = approvals?.data?.map(elm => elm.Record) || []
    return result;
  } catch (error) {
    console.log(error);
  } finally {
    if (gateway) {
      gateway.close();
    }
    if (client) {
      client.close()
    }
  }
};

const getDocSignedURL = async (docId, user) => {
  let orgName = `org${user.orgId}`;
  return getSignedUrl(docId, orgName);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

module.exports = {
  addEmission,
  queryEmissions,
  queryEmissionById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  getDocSignedURL,
  queryHistoryById,
};
