// Stephen McNern
// L00161681
// BSc Computing Y3
// Server Side Development

// Global Variables
let score = 0;
let playerName = '';
let questionNum = 0;
let lifeLineUsed = {
    askAudience: false,
    fiftyfifty: false, 
    callFriend: false
};

//////////////////// Init Modules ////////////////////////
const readline = require('readline'); // For The Interface Interaction
const fs = require('fs'); // For Reading JSON



//////////////////// Create an Interface /////////////////
const gameInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//////////////////// Load Scores /////////////////////////
function loadScores(){
    try{
        const scoreData = fs.readFileSync('scores.json', 'utf8');
        const parsedScores = JSON.parse(scoreData);
        return parsedScores.scores;
    }catch(err){
        console.error('Error reading scores.json', err);
        return [];
    }
}

//////////////////// Load Question Bank //////////////////
let questions = [];
fs.readFile('questions.json', 'utf8', function(err, data){
    if(err){
        console.error('Error reading questions.json', err);
        return;
    }
    questions = JSON.parse(data);
    displayMenu();
})

//////////////////// Display Main Menu ///////////////////
function displayMenu(){
    console.clear();
    console.log("****************************");
    console.log("Who Wants To Be A Pointaire?");
    console.log("****************************");
    console.log("1: Play");
    console.log("2: Top 5 Scores");
    console.log("3: Quit");
    gameInterface.question("Please Select an Option \n", menuSelection );
    console.log("****************************")
}

//////////////////// Selection Handling //////////////////
function menuSelection(option){
    switch(option){
        case "1":
            playGame();
            break;
        case "2":
            displayScores();
            break;
        case "3":
            console.log("Goodbye!");
            gameInterface.close();
            break;
        default:
            console.log('Please Select a Valid Option');
            displayMenu();            
    }
}
//////////////////// Get the player's name ///////////////
function askName(){
    gameInterface.question('Please enter your name: ', function(name){
        playerName = name.trim();
        if(playerName){
            console.log(`Hello, ${playerName}. Let's Play!`);
            askQuestion();   
        }
        else{
            console.log('Field cannot be empty');
            askName();
        }
    });
}
//////////////////// Ask the Next Question ///////////////
function askQuestion(){
    if(questionNum < questions.length){
        const thisQuestion = questions[questionNum];
        console.clear();
        // Show the current question
        console.log(`Question ${questionNum+1}: ${thisQuestion.question}`);
        // Show the potential anwers
        thisQuestion.content.forEach(function(option, index){
            console.log(`${String.fromCharCode(97+index)}. ${option}`); // ASCII codes for letters starting with "a"
        });
        console.log('Type "lifeline" for help ');
        
        // Player selects answer
        gameInterface.question('Enter your answer: ', function(answer){
            const myAnswer = answer.toLowerCase().trim();
            // Call lifeline menu if asked
            if(myAnswer === 'lifeline'){
                lifeLineMenu();
            }
            // Check if selection matches the correct answer
            else if(["a", "b", "c", "d"].includes(myAnswer)){
                if(myAnswer === thisQuestion.correct){
                    console.log('Correct Answer!');
                    score++;
                    // Brief pause
                    setTimeout(function(){
                        questionNum++;
                        askQuestion();
                    }, 1500);
                    
                }
                else{
                    console.log(`Sorry, the correct answer was ${thisQuestion.correct.toUpperCase()}. `);
                    console.log('Game Over!');
                    console.log(`Your Score is: ${score}`);

                    // Save the score
                    saveScores(playerName, score);
                    
                    // Brief pause
                    setTimeout(function(){
                        gameInterface.question('Press Enter to return to the menu ', function(){
                            displayMenu();
                        })
                    }, 2500);
                    
                }
                
            }
            else{
                console.log('Invalid input. Enter a, b, c or d.');
                // Brief Pause
                setTimeout(function(){  
                    askQuestion();
                }, 2000);
                
            }
        });    
    }
    else{
        console.log(`Congrats! You answered all questions correctly with a final score of ${score}`);
        saveScores(playerName, score);
        gameInterface.question('Press Enter to return to the menu', function(){
            displayMenu();
        });
        
        
        
    }
}

//////////////////// Playing the Game ////////////////////
function playGame(){ 
    askName();
}

//////////////////// Save Scores to scores.json //////////
function saveScores(name, score){
    const scores = loadScores();
    scores.push({name: name, score: score});
    // Sort scores by highest
    scores.sort((a,b) => b.score - a.score);
    // Isolate the top 5
    const highScores = scores.slice(0, 5);
    // Save the scores to scores.json
    fs.writeFile('scores.json', JSON.stringify({scores: highScores}, null, 2), function(err){
        if(err){
            console.error('Couldn\'t save scores: ', err);
        }
        else{
            console.log('Score saved');
            
        }
    });
}

//////////////////// Displayy Top 5 Scores ///////////////
function displayScores(){
    const scores = loadScores();
    console.clear();
    console.log('Top 5 Scores');
    scores.forEach(function(scoreItem, index){
        console.log(`${index+1}: ${scoreItem.name} ---> ${scoreItem.score}`);
    });
    console.log('Press Enter to return to menu');
    gameInterface.question('', function(){
        displayMenu();
    });
}

//////////////////// Lifeline Menu ///////////////////////
function lifeLineMenu(){
    console.clear();
    console.log('Your Options are...');
    // Check Flags
    if(!lifeLineUsed.fiftyfifty) console.log('1: 50/50 ');
    if(!lifeLineUsed.askAudience) console.log('2: Ask the Audience ');
    if(!lifeLineUsed.callFriend) console.log('3: Call a Friend ');
    console.log('4: Go Back');
    
    gameInterface.question('What is your decision? ', function(decision){
        switch(decision){
            case "1":
                if(!lifeLineUsed.fiftyfifty){
                    lifeLineUsed.fiftyfifty = true; // Change Flag to True
                    choiceFiftyFifty();
                }
                break;
            case "2":
                if (!lifeLineUsed.askAudience){
                    lifeLineUsed.askAudience = true; // Change Flag to True
                    choiceAudience();
                }
                break;
            case "3":
                if(!lifeLineUsed.callFriend){
                    lifeLineUsed.callFriend = true; // Change Flag to True
                    choiceFriend();
                }
                break;
            case "4":
                askQuestion();
                break;
            default:
                console.log('Please enter 1, 2, 3 for a lifeline or enter 4 to go back to the question ');
                setTimeout(function(){
                    lifeLineMenu();
                }, 2000);
        }
    })
    
}

//////////////////// LifeLines ///////////////////////////

// 50/50
function choiceFiftyFifty() {
    const thisQuestion = questions[questionNum]; // Get the current question
    const correctAnswer = thisQuestion.content[thisQuestion.correct.charCodeAt(0) - 97]; // Get the actual correct answer
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

    // Set Flag to True
    lifeLineUsed.fiftyfifty = true;

    // Display remaining options
    console.clear();
    console.log('50/50 Lifeline Used! The remaining options are:');
    console.log(`a. ${correctAnswer}`);
    console.log(`b. ${wrongAnswerToKeep}`);

    // Ask the player for their choice
    gameInterface.question('What is your decision? ', function(decision) {
        const playerAnswer = decision.toLowerCase().trim();

        // Check if the answer is valid
        if (['a', 'b'].includes(playerAnswer)) {
            
            // Validate answr
            let chosenAnswer;
            if (playerAnswer === 'a') {
                chosenAnswer = correctAnswer;
            } else {
                chosenAnswer = wrongAnswerToKeep;
            }
            
            // Check if the chosen answer is correct
            if (chosenAnswer === correctAnswer) {
                console.log('Correct!');
                score++;
                // Brief pause 
                setTimeout(function() {
                    questionNum++;
                    askQuestion(); 
                }, 1500);
            } else {
                console.log(`Sorry, the correct answer was ${correctAnswer.toUpperCase()}.`);
                console.log('Game Over!');
                console.log(`Your Score is: ${score}`);

                // Save the score
                saveScores(playerName, score);

                // Brief pause 
                setTimeout(function() {
                    gameInterface.question('Press Enter to return to the menu', function() {
                        displayMenu();
                    });
                }, 2500);
            }
        } else {
            console.log('Invalid input. Enter a or b.');
            // Brief pause 
            setTimeout(function() {
                choiceFiftyFifty(); 
            }, 2000);
        }
    });
}

// Call a Friend
