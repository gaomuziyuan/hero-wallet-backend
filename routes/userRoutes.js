const express = require("express");
const router = express.Router();
const { getHomeInfo } = require("../controllers/homeController");

const {
  getUserInfo,
  getUserVerification,
  submitUserInfo,
  checkEmailExists,
  getUserIdByCognitoId
} = require("../controllers/userController");
const { getUserByIdDemo } = require("../controllers/homeController");

const { createSchema, validate } = require("../middlewares/validation")

// Schema for submitting user information
const userInfoSchema = createSchema({
  body: {
    first_name: true,
    last_name: true,
    date_of_birth: true,
    physical_address: true
  },
  params: {
    id: true,
  }
});

// Check Email schema
const checkEmailSchema = createSchema({
  body: {
    email: true
  }
})

// Home info schema
const homeInfoSchema = createSchema({
  query: {
    id: true
  }
})

// Get User id by cognito id schema
const getUserIdByCognitoIdSchema = createSchema({
  query: {
    cognito_id: true
  }
})

// Get user schema
const getUserSchema = createSchema({
  params: {
    id: true
  }
})

router.get("/v1/home_info", validate(homeInfoSchema), getHomeInfo);
router.get("/user-demo", getUserByIdDemo);
router.get("/v1/user_id", validate(getUserIdByCognitoIdSchema), getUserIdByCognitoId);
router.get("/v1/user_verification/:id", getUserVerification)

router.get("/v1/user_info/:id", validate(getUserSchema), getUserInfo);
router.post("/v1/user_info/:id", validate(userInfoSchema), submitUserInfo);
router.post("/v1/check_email_exists", validate(checkEmailSchema), checkEmailExists)

module.exports = router;
