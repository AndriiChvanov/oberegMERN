const express = require("express");
const router = express.Router();
const Catalog = require("@/models/Catalog");

router.post("/item-add", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      title,
      address,
      immovable,
      condition,
      area,
      price,
      text,
      isAgree,
      isVerified,
      images,
    } = req.body;

    const catalogItem = new Catalog({
      name: name,
      email: email,
      phone: phone,
      title: title,
      address: address,
      immovable: immovable,
      condition: condition,
      area: area,
      images: images,
      price: price,
      text: text,
      isAgree: isAgree,
      isVerified: isVerified,
    });
    await catalogItem.save((err) => {
      if (err) {
        return res.status(500).send({ msg: err.message });
      }
      res.status(201).json({
        message: "Обьек добавлен",
      });
    });
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});
router.get("/items", async (req, res) => {
  try {
    const catalogItem = await Catalog.find();
    return res.status(200).send(catalogItem);
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});
router.put("/item-confirmed/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const catalogItem = await Catalog.findOne({ _id: id });
    if (!catalogItem) {
      return res.status(400).send({
        message: "Возможно, Данный обьек был потвержден либо не создан.",
      });
    } else {
      if (catalogItem.isVerified) {
        return res.status(400).send({
          message: "Данный обьек был потвержден",
        });
      } else {
        catalogItem.isVerified = true;
        catalogItem.save((err) => {
          // error occur
          if (err) {
            return res.status(500).send({ message: "Что-то пошло не так" });
          } else {
            return res
              .status(200)
              .send({ message: "Данный обьек был потвержден" });
          }
        });
      }
    }
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});
router.delete("/item-delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const catalogItem = await Catalog.findOne({ _id: id });
    if (!catalogItem) {
      return res.status(400).send({
        message: "Возможно, Данный обьек был потвержден либо не создан.",
      });
    } else {
      catalogItem.remove((err) => {
        // error occur
        if (err) {
          return res.status(500).send({ message: "Что-то пошло не так" });
        } else {
          return res.status(200).send({ message: "Данный обьек был удален" });
        }
      });
    }
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

module.exports = router;
