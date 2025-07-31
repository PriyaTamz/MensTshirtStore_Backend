import Address from "../Model/Address.js";

export const addAddress = async (req, res) => {
  try {
    const {
      type,
      fullName,
      address,
      city,
      state,
      pincode,
      phone,
    } = req.body;

    if (
      !fullName ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !phone
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res
        .status(400)
        .json({ message: "Invalid pincode (must be 6 digits)" });
    }

    if (!/^\d{10}$/.test(phone.toString())) {
      return res
        .status(400)
        .json({ message: "Invalid phone number (must be 10 digits)" });
    }

    const existingAddress = await Address.findOne({
      user: req.user.id,
      type,
      fullName,
      address,
      city,
      state,
      pincode,
      phone,
    });

    if (existingAddress) {
      return res.status(409).json({ message: "This address already exists." });
    }

    const newAddress = new Address({
      ...req.body,
      user: req.user.id,
    });

    await newAddress.save();

    res.status(201).json({ message: "Address saved", address: newAddress });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to save address", error: error.message });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({
      isDefault: -1,
      updatedAt: -1,
    });

    res.status(200).json({
      message: "Addresses fetched successfully",
      addresses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch addresses",
      error: error.message,
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.id;

    const existingAddress = await Address.findOne({
      _id: addressId,
      user: userId,
    });
    if (!existingAddress) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized" });
    }

    // Update allowed fields
    const updateFields = {
      type: req.body.type,
      fullName: req.body.fullName,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      phone: req.body.phone,
      isDefault: req.body.isDefault,
    };

    // Update the address
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    res
      .status(200)
      .json({
        message: "Address updated successfully",
        address: updatedAddress,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update address", error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.id;

    // Ensure the address belongs to the user
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({ message: "Address not found or unauthorized" });
    }

    await Address.findByIdAndDelete(addressId);

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete address", error: error.message });
  }
};
