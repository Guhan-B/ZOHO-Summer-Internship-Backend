const { body } = require("express-validator");

exports.userName = body("name")
  .trim()
  .notEmpty()
  .withMessage("Name is required");

exports.email = body("email")
  .trim()
  .notEmpty()
  .withMessage("Email is required")
  .isEmail()
  .withMessage("Email is badly formatted");

exports.password = body("password")
  .trim()
  .notEmpty()
  .withMessage("Password is required")
  .isLength({ min: 8 })
  .withMessage("Passowrd should be minimum 8 characters long");

exports.mobileNumber = body('mobileNumber')
  .trim()
  .notEmpty()
  .withMessage("Mobile Number is required")
  .isLength({ min: 10, max: 10 })
  .withMessage("Mobile Number is badly formated");

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
  .withMessage("Tournament name is required");

exports.description = body('description')
  .trim()
  .notEmpty()
  .withMessage("Tournament description is required");

exports.sport = body('sport')
  .trim()
  .notEmpty()
  .withMessage("Sport Name is required");

exports.teamSize = body('teamSize')
  .trim()
  .notEmpty()
  .withMessage("Team size is required")
  .isInt({ min: 1 })
  .withMessage("Team size cannot be less that 1")
  .toInt();

exports.eventDate = body("eventDate")
  .trim()
  .notEmpty()
  .withMessage("Event date is required");

exports.deadlineDate = body("deadlineDate")
  .trim()
  .notEmpty()
  .withMessage("Deadline date is required");

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
  .isInt({ min: 1, max: 4 })
  .withMessage("Result is invalid")
  .toInt();

exports.teamName = body("teamName")
  .trim()
  .notEmpty()
  .withMessage("Team name is required");

exports.memberEmails = body("emails")
  .notEmpty()
  .withMessage("Participant emails are required");

