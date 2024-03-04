const User = require("../models/user");
const UserVerification = require("../models/userVerification");
const {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
  UserNotFoundException
} = require("@aws-sdk/client-cognito-identity-provider")

// Use .env AWS settings to create Cognito client
const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

// Get user's information
const getUserInfo = async (req, res) => {
  const userId = req.params.id;

  try {
    const userInfo = await User.findOne({
      where: {id: userId}
    })

    console.log(userInfo)

    if (!userInfo) {
      return res.status(404).json({
        code: 404,
        message: "User not found."
      });
    }

    return res.status(200).json({
      code: 200,
      message: "success",
      data: userInfo
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: `Error getting user's table. Query database failed.`
    });
  }
}

// Get User's verification information
const getUserVerification = async (req, res) => {
  const userId = req.params.id;

  try {
    const verification = await UserVerification.findOne({
      where: {user_id: userId}
    })

    if (!verification) {
      return res.status(404).json({
        code: 404,
        message: "User verification record not found",
      });
    }

    return res.status(200).json({
      code: 200,
      message: "success",
      data: verification
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Error getting user verification status.",
    })
  }
}

// Check if email is already registered
const checkEmailExists = async (req, res) => {
  const { email } = req.body;

  // Check if email exists by getting the user on Cognito
  let commandResult = null;
  try {
    const command = new AdminGetUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL,
      Username: email
    });

    commandResult= await client.send(command);
  } catch (error ) {
    // User Not Found Exception means email is not registered
    if (error instanceof UserNotFoundException) {
      res.status(200).json({
        code: 200,
        message: "success",
        data: {
          "exists": false
        }
      });
    } else { // Any other exceptions
      console.log("Error getting user:", error.message);
      res.status(500).json({
        code: 500,
        message: `Error getting user: ${error.message}`,
      });
    }

    return
  }

  // If no exception happened, means user is already registered
  if (commandResult && commandResult.Username) {
    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        "exists": true
      }
    });
  } else { // Should not happen
    res.status(500).json({
      code: 500,
      message: "Error checking email, AWS command result error"
    });
  }
}

// Submit User's info and save to database
const submitUserInfo = async (req, res) => {
  const user_id = req.params.id;
  const { first_name, last_name, date_of_birth, physical_address } =
    req.body;

  // Convert physical_address object to a JSON string
  // This should already be checked by yup, still possible to have errors
  let residentialAddressStr;
  try {
    residentialAddressStr = JSON.stringify(physical_address);
  } catch (err) {
    return res.status(400).json({
      code: 400,
      message: `Error parsing address. Malformed json: ${error.message}`
    })
  }

  // Check if user has submitted verification
  // Do not allow them to submit information again if they are verified or
  // during the verification process.
  let userVerification;
  try {
    userVerification = await UserVerification.findOne({
      where: { user_id: user_id },
      attributes: ["status"]
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: `Error getting user verification info: ${error.message}`
    })
  }

  // Check userVerification's verification status
  // Do not allow userVerification to update if verified or has pending verification
  if (userVerification && (userVerification.status == 1 || userVerification.status == 3)) {
    return res.status(400).json({
      code: 400,
      message: "user is already verified or has pending verification"
    });
  }

  // Update user info
  try {
    const [affectedRows] = await User.update({
      first_name: first_name,
      last_name: last_name,
      birthday: date_of_birth,
      residential_address: residentialAddressStr
    }, {
      where: { id: user_id }
    });

    // Should not happen
    if (affectedRows == 0) {
      return res.status(500).json({
        code: 500,
        message: `Error submitting user information. Failed to write to database`
      });
    } else { // User info updated successfully
      return res.status(200).json({
        code: 200,
        message: "success"
      });
    }
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: `Error submitting user information. ${error.message}`
    });
  }
};


// Get user's id in the database by cognito id
const getUserIdByCognitoId = async (req, res) => {
  const cognito_id = req.query.cognito_id;

  let user;
  try {
    user = await User.findOne({
      where: { cognito_id: cognito_id },
      attributes: ["id"],
    });
  } catch (err) {
    return res.status(500).json({
      code: 500,
      message: `Server error. ${err.message}`
    });
  }

  if (user) {
    return res.json({
      code: 200,
      message: "success",
      data: {
        id: user.id
      }
    });
  } else {
    return res.status(404).json({
      code: 404,
      message: "User not found"
    });
  }
};

module.exports = {
  getUserInfo,
  submitUserInfo,
  checkEmailExists,
  getUserVerification,
  getUserIdByCognitoId
};
