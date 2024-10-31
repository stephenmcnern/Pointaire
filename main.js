// Stephen McNern
// L00161681
// BSc Computing Y3
// Server Side Development

////////////////////////// Global Variables //////////////////////////
let score = 0;
let playerName = "";
let questionNum = 0;
let lifeLineUsed = {
  askAudience: false,
  fiftyfifty: false,
  callFriend: false,
};

////////////////////////// Init Modules //////////////////////////
const readline = require("readline");
const fs = require("fs");

////////////////////////// Create Interface //////////////////////////
const gameInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

////////////////////////// Load Scores //////////////////////////
function loadScores() {
  const scoreData = fs.readFileSync("scores.json", "utf8");
  const parsedScores = JSON.parse(scoreData);
  return parsedScores.scores;
}

////////////////////////// Load Question Bank //////////////////////////
let questions = [];
fs.readFile("questions.json", "utf8", function (err, data) {
  if (err) {
    console.log("Error reading file questions.json");
  } else {
    questions = JSON.parse(data);
    displayMenu();
  }
});

////////////////////////// Display Main Menu //////////////////////////
function displayMenu() {
  console.clear();
  console.log("****************************");
  console.log("Who Wants To Be A Pointaire?");
  console.log("****************************");
  console.log("1: Play");
  console.log("2: Admin");
  console.log("3: Top 5 Scores");
  console.log("4: Quit");
  gameInterface.question("Please Select an Option \n", menuSelection);
  console.log("****************************");
}

////////////////////////// Selection Handling //////////////////////////
function menuSelection(option) {
  switch (option) {
    case "1":
      playGame();
      break;
    case "2":
      adminMenu();
      break;
    case "3":
      displayScores();
      break;
    case "4":
      console.log("Goodbye!");
      gameInterface.close();
      console.clear();
      break;
    default:
      console.log("Please Select a Valid Option");
      displayMenu();
  }
}
////////////////////////// Get the player's name //////////////////////////
function askName() {
  gameInterface.question("Please enter your name: ", function (name) {
    playerName = name.trim();
    if (playerName) {
      console.log(`Hello, ${playerName}. Let's Play!`);
      askQuestion();
    } else {
      console.log("Field cannot be empty");
      askName();
    }
  });
}
////////////////////////// Ask the Question //////////////////////////
function askQuestion() {
  if (questionNum < questions.length) {
    const thisQuestion = questions[questionNum];
    console.clear();
    // Show the current question
    console.log(`Question ${questionNum + 1}: ${thisQuestion.question}`);
    // Show the potential anwers
    thisQuestion.content.forEach(function (option, index) {
      console.log(`${String.fromCharCode(97 + index)}. ${option}`);
    });
    console.log('Type "lifeline" for help ');

    // Player selects answer
    gameInterface.question("Enter your answer: ", function (answer) {
      const myAnswer = answer.toLowerCase().trim();
      // Call lifeline menu if asked
      if (myAnswer === "lifeline") {
        lifeLineMenu();
      }
      // Check if selection matches the correct answer
      else if (["a", "b", "c", "d"].includes(myAnswer)) {
        if (myAnswer === thisQuestion.correct) {
          console.log("Correct Answer!");
          score++;
          // Brief pause
          setTimeout(function () {
            questionNum++;
            askQuestion();
          }, 1500);
        } else {
          console.log(
            `Sorry, the correct answer was ${thisQuestion.correct.toUpperCase()}. `
          );
          console.log("Game Over!");
          console.log(`Your Score is: ${score}`);

          // Save the score
          saveScores(playerName, score);

          // Brief pause
          setTimeout(function () {
            gameInterface.question(
              "Press Enter to return to the menu ",
              function () {
                displayMenu();
              }
            );
          }, 2500);
        }
      } else {
        console.log("Invalid input. Enter a, b, c or d.");
        // Brief Pause
        setTimeout(function () {
          askQuestion();
        }, 2000);
      }
    });
  } else {
    console.log(
      `Congrats! You answered all questions correctly with a final score of ${score}`
    );
    saveScores(playerName, score);
    gameInterface.question("Press Enter to return to the menu", function () {
      displayMenu();
    });
  }
}

////////////////////////// Playing the Game //////////////////////////
function playGame() {
  // Reset Question Number and Score
  questionNum = 0;
  score = 0;
  askName();
}

////////////////////////// Save Scores //////////////////////////
function saveScores(name, score) {
  const scores = loadScores();
  scores.push({ name: name, score: score });
  // Sort scores by highest
  scores.sort((a, b) => b.score - a.score);
  // Isolate the top 5
  const highScores = scores.slice(0, 5);
  // Save the scores
  fs.writeFile(
    "scores.json",
    JSON.stringify({ scores: highScores }, null, 2),
    function (err) {
      if (err) {
        console.error("Couldn't save scores: ", err);
      } else {
        console.log("Score saved");
      }
    }
  );
}

////////////////////////// Displayy Top 5 Scores //////////////////////////
function displayScores() {
  const scores = loadScores();
  console.clear();
  console.log("Top 5 Scores");
  scores.forEach(function (scoreItem, index) {
    console.log(`${index + 1}: ${scoreItem.name} ---> ${scoreItem.score}`);
  });
  console.log("Press Enter to return to menu");
  gameInterface.question("", function () {
    displayMenu();
  });
}

////////////////////////// Lifeline Menu //////////////////////////
function lifeLineMenu() {
  console.clear();
  console.log("Your Options are...");
  // Check Flags
  if (!lifeLineUsed.fiftyfifty) console.log("1: 50/50 ");
  if (!lifeLineUsed.askAudience) console.log("2: Ask the Audience ");
  if (!lifeLineUsed.callFriend) console.log("3: Call a Friend ");
  console.log("4: Go Back");

  gameInterface.question("What is your decision? ", function (decision) {
    switch (decision) {
      case "1":
        if (!lifeLineUsed.fiftyfifty) {
          lifeLineUsed.fiftyfifty = true; // Change Flag to True
          choiceFiftyFifty();
        }
        break;
      case "2":
        if (!lifeLineUsed.askAudience) {
          lifeLineUsed.askAudience = true; // Change Flag to True
          choiceAudience();
        }
        break;
      case "3":
        if (!lifeLineUsed.callFriend) {
          lifeLineUsed.callFriend = true; // Change Flag to True
          choiceFriend();
        }
        break;
      case "4":
        askQuestion();
        break;
      default:
        console.log(
          "Please enter 1, 2, 3 for a lifeline or enter 4 to go back to the question "
        );
        setTimeout(function () {
          lifeLineMenu();
        }, 2000);
    }
  });
}

////////////////////////// 50/50 //////////////////////////
function choiceFiftyFifty() {
  const thisQuestion = questions[questionNum];
  const correctAnswer =
    thisQuestion.content[thisQuestion.correct.charCodeAt(0) - 97];
  const wrongAnswers = [];

  // Find wrong answers
  for (let i = 0; i < thisQuestion.content.length; i++) {
    if (thisQuestion.content[i] !== correctAnswer) {
      wrongAnswers.push(thisQuestion.content[i]);
    }
  }

  // Randomly select one incorrect answer to keep
  const ranIndex = Math.floor(Math.random() * wrongAnswers.length);
  const wrongAnswerToKeep = wrongAnswers[ranIndex];

  // Randomly assign options so the correct answer isn't always in the same place
  const options =
    Math.random() < 0.5
      ? { a: correctAnswer, b: wrongAnswerToKeep }
      : { a: wrongAnswerToKeep, b: correctAnswer };

  // Set Flag to True
  lifeLineUsed.fiftyfifty = true;

  // Display remaining options
  //console.clear();
  askQuestion();
  console.log("The remaining options are:");
  console.log(`a. ${options.a}`);
  console.log(`b. ${options.b}`);

  // Ask the player for their choice
  gameInterface.question("What is your decision?:  ", function (decision) {
    const playerAnswer = decision.toLowerCase().trim();

    // Check if the answer is valid
    if (["a", "b"].includes(playerAnswer)) {
      // Validate answr
      const chosenAnswer = options[playerAnswer];

      // Check if the chosen answer is correct
      if (chosenAnswer === correctAnswer) {
        console.log("Correct!");
        score++;
        // Brief pause
        setTimeout(function () {
          questionNum++;
          askQuestion();
        }, 1500);
      } else {
        console.log(
          `Sorry, the correct answer was ${correctAnswer.toUpperCase()}.`
        );
        console.log("Game Over!");
        console.log(`Your Score is: ${score}`);

        // Save the score
        saveScores(playerName, score);

        // Brief pause
        setTimeout(function () {
          gameInterface.question(
            "Press Enter to return to the menu",
            function () {
              displayMenu();
            }
          );
        }, 2500);
      }
    } else {
      console.log("Invalid input. Enter a or b.");
      // Brief pause
      setTimeout(function () {
        choiceFiftyFifty();
      }, 2000);
    }
  });
}

////////////////////////// Call a Friend //////////////////////////
function choiceFriend() {
  const thisQuestion = questions[questionNum];
  const correctAnswer =
    thisQuestion.content[thisQuestion.correct.charCodeAt(0) - 97];
  const wrongAnswers = [];

  // Find wrong answers
  for (let i = 0; i < thisQuestion.content.length; i++) {
    if (thisQuestion.content[i] !== correctAnswer) {
      wrongAnswers.push(thisQuestion.content[i]);
    }
  }
  // Friends's answer with 60% probability
  const friendAnswer =
    Math.random() < 0.6
      ? correctAnswer
      : wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];

  // Set flag to true
  lifeLineUsed.callFriend = true;

  // Show suggestion from friend
  //console.clear();
  askQuestion();
  console.log(`Your friend believes ${friendAnswer} is the correct answer`);

  // Ask the player fr their choice
  gameInterface.question("What is your decision? ", function (decision) {
    const playerAnswer = decision.toLowerCase().trim();

    // Validate answer
    if (["a", "b", "c", "d"].includes(playerAnswer)) {
      // Check if the answer  is correct
      if (playerAnswer === thisQuestion.correct) {
        console.log("Correct!");
        score++;
        // Brief pause
        setTimeout(function () {
          questionNum++;
          askQuestion();
        }, 1500);
      } else {
        console.log(
          `Sorry, the correct answer was ${correctAnswer.toUpperCase()}.`
        );
        console.log("Game Over!");
        console.log(`Your Score is: ${score}`);

        // Save the score
        saveScores(playerName, score);

        // Brief pause
        setTimeout(function () {
          gameInterface.question(
            "Press Enter to return to the menu",
            function () {
              displayMenu();
            }
          );
        }, 2500);
      }
    } else {
      console.log("Invalid input. Enter a or b.");
      // Brief pause
      setTimeout(choiceFriend, 2000);
    }
  });
}

////////////////////////// Ask the Audience //////////////////////////
function choiceAudience() {
  const thisQuestion = questions[questionNum];
  const correctAnswer =
    thisQuestion.content[thisQuestion.correct.charCodeAt(0) - 97];
  const wrongAnswers = [];

  // Find wrong answers
  for (let i = 0; i < thisQuestion.content.length; i++) {
    if (thisQuestion.content[i] !== correctAnswer) {
      wrongAnswers.push(thisQuestion.content[i]);
    }
  }
  // Audience's answer with 75% probability
  const audienceAnswer =
    Math.random() < 0.75
      ? correctAnswer
      : wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];

  // Set flag to true
  lifeLineUsed.askAudience = true;

  // Show suggestion from audience
  //console.clear();
  askQuestion();
  console.log(
    `75% of the audience believe "${audienceAnswer}" could be the right answer`
  );

  // Ask the player fr their choice
  gameInterface.question("What is your decision? ", function (decision) {
    const playerAnswer = decision.toLowerCase().trim();

    // Validate answer
    if (["a", "b", "c", "d"].includes(playerAnswer)) {
      // Check if the answer  is correct
      if (playerAnswer === thisQuestion.correct) {
        console.log("Correct!");
        score++;
        // Brief pause
        setTimeout(function () {
          questionNum++;
          askQuestion();
        }, 1500);
      } else {
        console.log(
          `Sorry, the correct answer was ${correctAnswer.toUpperCase()}.`
        );
        console.log("Game Over!");
        console.log(`Your Score is: ${score}`);

        // Save the score
        saveScores(playerName, score);

        // Brief pause
        setTimeout(function () {
          gameInterface.question(
            "Press Enter to return to the menu",
            function () {
              displayMenu();
            }
          );
        }, 2500);
      }
    } else {
      console.log("Invalid input. Enter a or b.");
      // Brief pause
      setTimeout(choiceFriend, 1500);
    }
  });
}

////////////////////////// Admin Menu //////////////////////////
function adminMenu() {
  console.clear();
  console.log("Admin Mode");
  console.log("1. Add Question");
  console.log("2. Delete Question");
  console.log("3. Edit Question");
  console.log("4. View Question");
  console.log("5. Go Back");

  gameInterface.question("Choose an option: ", function (option) {
    switch (option.trim()) {
      case "1":
        addQuestion();
        break;
      case "2":
        deleteQuestion();
        break;
      case "3":
        editQuestion();
        break;
      case "4":
        viewQuestion();
        break;
      case "5":
        displayMenu();
        break;
      default:
        console.log("Please select a valid option ");
        // Brief pause
        setTimeout(adminMenu, 1500);
    }
  });
}

////////////////////////// Add Question //////////////////////////
function addQuestion() {
  console.clear();

  // Ask user for the question
  gameInterface.question(
    "Enter the question you want to add: ",
    function (questionText) {
      // Ask for the 4 potential answers
      let options = [];
      let index = 0;

      // Function to retrieve options
      function retrieveOptions() {
        if (index < 4) {
          gameInterface.question(
            "Enter option " + String.fromCharCode(97 + index) + ": ",
            function (option) {
              options.push(option);
              index++;
              retrieveOptions();
            }
          );
        } else {
          // Designate the correct answer
          gameInterface.question(
            "Which one should be designated as the correct answer? (a, b, c, or d): ",
            function (correctOption) {
              if (["a", "b", "c", "d"].includes(correctOption.toLowerCase())) {
                // Create the new question object
                var newQuestion = {
                  question: questionText,
                  content: options,
                  correct: correctOption.toLowerCase(),
                };
                // Add the new question to the question bank
                questions.push(newQuestion);
                console.log("Question added successfully!");

                // Brief pause
                setTimeout(adminMenu, 1500);
              } else {
                console.log("Please select a valid option (a, b, c, or d).");
                setTimeout(addQuestion, 1500);
              }
            }
          );
        }
      }

      retrieveOptions();
    }
  );
}
////////////////////////// Delete Question //////////////////////////
function deleteQuestion() {
  console.clear();

  // Ask for the question number to delete
  gameInterface.question(
    "Which question do ou want to delete? (1 - " + questions.length + "): ",
    function (input) {
      // Convert to index
      const index = parseInt(input.trim(), 10) - 1;

      // Validate number input
      if (index >= 0 && index < questions.length) {
        // Display the selected question
        console.log(`Question: '${questions[index].question}'`);

        // Confirm deletion
        gameInterface.question(
          "Are you sure you want to delete this question? (yes/no): ",
          function (confirmation) {
            if (confirmation.toLowerCase() === "yes") {
              const deletedQuestion = questions.splice(index, 1);
              console.log(`Deleted question: '${deletedQuestion[0].question}'`);
            } else {
              console.log("Deletion canceled.");
            }
            setTimeout(adminMenu, 1500);
          }
        );
      } else {
        console.log("Please enter a valid number");
        setTimeout(deleteQuestion, 1500);
      }
    }
  );
}

////////////////////////// Edit Question //////////////////////////
function editQuestion() {
  console.clear();
  // Ask for the question number to edit
  gameInterface.question(
    "Which question do you want to edit? (1 - " + questions.length + "): ",
    function (input) {
      // Convert to index
      const index = parseInt(input.trim(), 10) - 1;

      // Validate number input
      if (index >= 0 && index < questions.length) {
        const thisQuestion = questions[index];

        // Display the selected question
        console.log(`Current Question: '${thisQuestion.question}'`);
        console.log("Current Options");
        for (let i = 0; i < thisQuestion.content.length; i++) {
          console.log(
            `${String.fromCharCode(97 + i)}. ${thisQuestion.content[i]}`
          );
        }
        // Ask for new question
        gameInterface.question(
          "Enter new question text: ",
          function (newQText) {
            // Don't update if left blank
            if (newQText.trim() !== "") {
              thisQuestion.question = newQText.trim();
            }
            // Show edited version of question
            console.log("\nEdited Question");
            console.log(`Question: '${thisQuestion.question}'`);
            // Show options
            for (let i = 0; i < thisQuestion.content.length; i++) {
              console.log(
                `${String.fromCharCode(97 + i)}. ${thisQuestion.content[i]}`
              );
            }
            console.log("Question edited");
            // Brief pause
            setTimeout(function () {
              gameInterface.question(
                "Press Enter to return to the admin menu ",
                function () {
                  adminMenu();
                }
              );
            }, 2000);
          }
        );
      } else {
        console.log("Please enter a valid number");
        setTimeout("editQuestion", 1500);
      }
    }
  );
}
////////////////////////// View Question //////////////////////////

function viewQuestion() {
  console.clear();

  // Ask for the question number to view
  gameInterface.question(
    "Which question do you want to view? (1 - " + questions.length + "): ",
    function (input) {
      // Convert input to an index
      const index = parseInt(input.trim(), 10) - 1;

      // Validate number input
      if (index >= 0 && index < questions.length) {
        const thisQuestion = questions[index];

        // Display the selected question and its options
        console.log(`Question: '${thisQuestion.question}'`);
        console.log("Options:");
        for (let i = 0; i < thisQuestion.content.length; i++) {
          console.log(
            `${String.fromCharCode(97 + i)}. ${thisQuestion.content[i]}`
          );
        }

        gameInterface.question(
          "Press Enter to return to the admin menu ",
          function () {
            adminMenu();
          }
        );
      } else {
        console.log("Please enter a valid number");
        setTimeout(viewQuestion, 1500);
      }
    }
  );
}
