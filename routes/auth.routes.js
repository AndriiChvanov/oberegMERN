const express = require("express");
const User = require("@/models/User");
const Token = require("@/models/Token");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const sendEmail = require("@/utils/email/sendEmail");
const { JWT_SECRET, JWT_SECRET_RESET, SERVER_HOST } = require("@/config");

router.post(
  "/register",
  [
    check("email", "Некорректный email").isEmail(),
    check("password", "Минимальная длина паролья 6 символов").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Некорректные данные при регистрации",
        });
      }
      const { name, email, password } = req.body;
      const candidate = await User.findOne({ email: email });
      if (candidate) {
        return res
          .status(400)
          .json({ message: "Такой пользователь уже существует" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
      });
      await user.save((err) => {
        if (err) {
          return res.status(500).send({ msg: err.message });
        }
        let token = new Token({
          _userId: user._id,
          token: jwt.sign({ _userId: user._id }, JWT_SECRET, {
            expiresIn: "1h",
          }),
        });
        token.save((err) => {
          if (err) {
            return res.status(500).send({ msg: err.message });
          }

          //send mail
          const link = `${SERVER_HOST}/auth/confirmation/${user.email}/${token.token}`;

          sendEmail(
            user.email,
            "Подтверждение аккаунта",
            {
              name: user.name,
              link: link,
            },
            "./template/welcome.handlebars"
          );
          return link;
        });
      });
      res.status(201).json({ message: "Пользователь создан" });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте снова" });
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Введите корректный email").normalizeEmail().isEmail(),
    check("password", "Введите пароль").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Некорректные данные при входе в систему",
        });
      }
      const { email, password } = req.body;
      console.log(email);
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: "Пользователь не найден",
        });
      } else if (!user.isVerified) {
        return res.status(401).send({
          msg:
            "Ваш адрес электронной почты не был подтвержден. Пожалуйста, нажмите на повторную отправку",
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Неверный пароль, попробуйте снова" });
      }

      const token = jwt.sign({ _userId: user._id }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token: token, _userId: user._id });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте снова" });
    }
  }
);
router.get("/confirmation/:email/:token", async (req, res) => {
  try {
    const { token, email } = req.params;
    const tokens = await Token.findOne({ token: token });
    if (!tokens) {
      return res.status(400).send({
        msg:
          'Возможно, срок действия вашей ссылки для подтверждения истек. Пожалуйста, нажмите "Отправить", чтобы подтвердить свой адрес электронной почты.',
      });
    } else {
      const user = await User.findOne({
        _id: tokens._userId,
        email: email,
      });
      if (!user) {
        return res.status(401).send({
          msg:
            "Нам не удалось найти пользователя для этой проверки. Пожалуйста, зарегистрируйтесь!",
        });
      }
      if (user.isVerified) {
        return res.status(401).send({
          msg: "Ваш акаунт уже потвержден",
        });
      } else {
        // change isVerified to true
        user.isVerified = true;
        user.save((err) => {
          // error occur
          if (err) {
            return res.status(500).send({ msg: err.message });
          }
          // account successfully verified
          else {
            return res.status(200).send("Ваш акаунт успешно потвержден");
          }
        });
      }
    }
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

router.put(
  "/forgot",
  [check("email", "Введите корректный email").normalizeEmail().isEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Некорректные данные при входе в систему",
        });
      }
      const { email } = req.body;
      const user = await User.findOne({
        email,
      });
      if (!user) {
        return res.status(401).send({
          message: "Пользователь не найден",
        });
      }
      let token = jwt.sign({ _id: user._id }, JWT_SECRET_RESET, {
        expiresIn: "1h",
      });

      //send mail
      const link = `${SERVER_HOST}/auth/reset/${token}`;

      sendEmail(
        user.email,
        "Сброс пароля",
        {
          name: user.name,
          link: link,
        },
        "./template/requestResetPassword.handlebars"
      );

      return user.updateOne({ resetLink: token }, (err) => {
        if (err) {
          return res.json({ message: "Введены неправельные данные" });
        } else {
          return res.json({ message: "Правельно введены данные" });
        }
      });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте снова" });
    }
  }
);
router.put(
  "/reset/:resetLink",
  [
    check("newPass", "Минимальная длина паролья 6 символов").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const { resetLink } = req.params;
      const { newPass } = req.body;

      const hashedPassword = await bcrypt.hash(newPass, 12);

      const user = User.findOne({ resetLink });
      if (!user) {
        return res.status(401).send({
          message: "Пользователь не найден",
        });
      }
      if (resetLink) {
        jwt.verify(resetLink, JWT_SECRET_RESET, (err, decodedToken) => {
          if (err) {
            return res.status(401).send({
              message: "Неправельный токен",
            });
          }

          return user.updateOne({ password: hashedPassword }, (err) => {
            if (err) {
              return res.json({ message: "Введены неправельные данные" });
            } else {
              return res.json({ message: "Правельно введены данные" });
            }
          });
        });
      }
    } catch (e) {
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте снова" });
    }
  }
);
module.exports = router;
