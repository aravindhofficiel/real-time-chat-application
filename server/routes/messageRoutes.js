const router = require("express").Router();
const Message = require("../models/Message");

router.get("/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = router;