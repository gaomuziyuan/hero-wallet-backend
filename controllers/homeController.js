const { pool } = require("../utils/database");
const User = require("../models/user");
const Card = require("../models/card");

const getHomeInfo = async (req, res) => {
  const userId = req.query.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Fetch user info including verification statuses
    const user = await User.findOne({
      where: { id: userId },
      attributes: [
        "info_verification_status",
        "email_verified",
        "first_name",
        "last_name",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const { info_verification_status, email_verified, first_name, last_name } =
      user;

    // Fetch all active cards for the user
    const cards = await Card.findAll({
      where: { user_id: userId, status: 1 }, // Assuming 1 signifies active cards
      attributes: [
        ["id", "card_id"],
        "card_number",
        "balance",
        "expire_date",
        "card_type",
        "card_form",
        // Sequelize doesn't support SQL CASE directly in attributes, so status is fetched directly
        // and will be transformed in the response mapping below
        "status",
      ],
    });

    const responseCards = cards.map((card) => ({
      card_holder_name: `${first_name} ${last_name}`,
      card_number: card.card_number,
      card_id: card.getDataValue("card_id"),
      balance: card.balance,
      expiry_date: card.expire_date,
      card_type: card.card_type,
      card_form: card.card_form,
      status:
        card.status === 1
          ? "Active"
          : card.status === 0
          ? "Expired"
          : card.status === 2
          ? "Lost"
          : "In Review", // Manually handling CASE logic
    }));

    const response = {
      code: 200,
      message: "success",
      data: {
        card_apply_status: 1, //TODO place holder
        info_verification_status,
        email_verified,
        cards: responseCards,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching home info:", error);
    res.status(500).json({ message: "Error fetching home info" });
  }
};

//demo api to fetch a user by its id.
// Assuming you've exported your User model correctly from models/User.js

const getUserByIdDemo = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "No user ID provided" });
  }

  try {
    // Use Sequelize's findOne method to find a user by ID
    const user = await User.findOne({
      where: { id: id },
      attributes: ["first_name", "last_name"], // Specify the fields you want
    });

    if (user) {
      res.json({ fullName: `${user.first_name} ${user.last_name}` });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
};

module.exports = {
  getHomeInfo,
  getUserByIdDemo,
};
