const Group = require("../models/Group");

// @desc    Endpoint for creating an group
// @route   POST /api/v1/groups
// @access  signed in users only
const saveGroup = async (req, res) => {
  const { name, description } = req.body;
  const { userID } = req.user;
  if (!name) {
    res.status(400);
    throw new Error("Group must have a name!");
  }
  const savedGroup = await Group.create({
    name,
    description,
    owner: userID,
  });
  return res.json({ msg: "Group saved!", savedGroup });
};

module.exports = {
  saveGroup,
};
