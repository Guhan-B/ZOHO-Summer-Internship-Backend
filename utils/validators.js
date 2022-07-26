const { body } = require("express-validator");

exports.userName = body("name")
  .trim()
  .notEmpty()
  .withMessage("Name cannot be empty");

exports.email = body("email")
  .trim()
  .notEmpty()
  .withMessage("Email cannot be empty")
  .isEmail()
  .withMessage("Email is badly formatted");

exports.password = body("password")
  .trim()
  .notEmpty()
  .withMessage("Password cannot be empty")
  .isLength({ min: 8 })
  .withMessage("Passowrd should be minimum 8 characters");

exports.mobileNumber = body('mobileNumber')
  .trim()
  .notEmpty()
  .withMessage("Mobile Number is required")
  .isLength({ min: 10, max: 10 })
  .withMessage("Mobile Number is badly formatted");

exports.bloodGroup = body('bloodGroup')
  .trim()
  .notEmpty()
  .withMessage("Blood Group is required")
  .custom(value => {
      const valid = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  
      if (!valid.includes(value)) 
          throw new Error("Blood Group is invalid");
  
      return true;
  });

exports.tournamentName = body('name')
  .trim()
  .notEmpty()
  .withMessage("Name cannot be empty");

exports.description = body('description')
  .trim()
  .notEmpty()
  .withMessage("Description cannot be empty");

exports.sport = body('sport')
  .trim()
  .notEmpty()
  .withMessage("Sport cannot be empty");

exports.teamSize = body('teamSize')
  .trim()
  .notEmpty()
  .withMessage("Team Size cannot be empty")
  .isInt({ min: 1 })
  .withMessage("Team Size cannot be less that 1")
  .toInt();

exports.eventDate = body("eventDate")
  .trim()
  .notEmpty()
  .withMessage("Event Date cannot be empty")

exports.deadlineDate = body("deadlineDate")
  .trim()
  .notEmpty()
  .withMessage("Deadline Date cannot be empty");

exports.teamId = body("teamId")
  .trim()
  .notEmpty()
  .withMessage("Team ID is required")
  .toInt();

exports.tournamentId = body("tournamentId")
  .trim()
  .notEmpty()
  .withMessage("Torunament ID is required")
  .toInt();

exports.result = body("result")
  .trim()
  .notEmpty()
  .withMessage("Result is required")
  .isInt({ min: 0, max: 7 })
  .withMessage("Result is invalid")
  .toInt();

exports.teamName = body("teamName")
  .trim()
  .notEmpty()
  .withMessage("Team Name cannot be empty");

exports.memberEmails = body("emails")
  .notEmpty()
  .withMessage("Emails cannot be empty");

