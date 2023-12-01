import User from "../models/user.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(user.friends.map((id) => User.findById));
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturepath }) => {
        return { _id, firstName, lastName, occupation, location, picturepath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }

    // Create sets to store unique friend IDs
    const userFriendsSet = new Set(user.friends);
    const friendFriendsSet = new Set(friend.friends);

    if (userFriendsSet.has(friendId)) {
      // Remove friendId if it exists in the sets
      userFriendsSet.delete(friendId);
      friendFriendsSet.delete(id);
    } else {
      // Add friendId if it doesn't exist in the sets
      userFriendsSet.add(friendId);
      friendFriendsSet.add(id);
    }

    // Update user and friend with unique friend IDs
    user.friends = Array.from(userFriendsSet);
    friend.friends = Array.from(friendFriendsSet);

    await user.save();
    await friend.save();

    // Fetch the updated list of friends
    // const friends = await Promise.all(
    //   user.friends.map((friendId) => User.findById(friendId))
    // );

    // const formattedFriends = friends.map(
    //   ({ _id, firstName, lastName, occupation, location, picturePath }) => {
    //     return { _id, firstName, lastName, occupation, location, picturePath };
    //   }
    // );

    // res.status(200).json(formattedFriends);

    const friends = await Promise.all(
      user.friends.map((friendId) => User.findById(friendId))
    );

    const friendIds = friends.map(({ _id }) => _id);

    res.status(200).json(friendIds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
