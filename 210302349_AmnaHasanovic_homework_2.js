const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to load questions from a JSON file
function LoadQuestionsFromFile() {
    const jsonFilePath = 'questions.json';
    try {
        const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');
        const questions = JSON.parse(jsonContent);
        return questions;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Error: ${jsonFilePath} not found.`);
        } else {
            console.error(`Error reading ${jsonFilePath}: ${error.message}`);
        }
        return [];
    }
}

// Function to load configuration from a JSON file
function LoadConfig() {
    const jsonFilePath = 'config.json';
    try {
        const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');
        const config = JSON.parse(jsonContent);
        return config;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Error: ${jsonFilePath} not found. Using default values.`);
        } else {
            console.error(`Error reading ${jsonFilePath}: ${error.message}`);
        }
        // Return default values in case of an error
        return { questionTimer: 3, totalQuizTime: 60 };
    }
}

// Function to shuffle questions
function shuffleQuestions(questions) {
    return [...questions].sort(() => Math.random() - 0.5);
}

// Function to ask questions and evaluate user responses
function AskQuestions() {
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let currentQuestionIndex = 0;
    let timerInterval;
    let questions;

    // Function to ask the next question
    // Function to ask the next question
    function AskNextQuestion() {
        const question = questions[currentQuestionIndex];
    
        console.log(`\nQuestion ${currentQuestionIndex + 1}: ${question.prompt}`);
    
        if (question.choices) {
            for (let j = 0; j < question.choices.length; j++) {
                console.log(`${j + 1}. ${question.choices[j]}`);
            }
        }
    
        // Set initial timer to questionTimer + 1
        let timer = config.questionTimer + 1;
        // Assign the setInterval to the outer variable
        timerInterval = setInterval(() => {
            timer--;
    
            if (timer >= 0) {
                console.log(`Time remaining: ${timer} seconds`);
            }
    
            if (timer === 0) {
                clearInterval(timerInterval);
                console.log("Time's up!");
                incorrectAnswers++;
                currentQuestionIndex++;
                if (currentQuestionIndex < questions.length) {
                    AskNextQuestion();
                } else {
                    GenerateReport(correctAnswers, incorrectAnswers);
                    rl.close();
                }
            }
        }, 1000);
    
        rl.question('Enter the number of your answer: ', (userAnswer) => {
            clearInterval(timerInterval);
    
            if (question.choices) {
                if (isCorrectAnswer(userAnswer, question.answer, question.choices)) {
                    console.log('Correct!');
                    correctAnswers++;
                } else {
                    console.log(`Incorrect! The correct answer is: ${question.answer}`);
                    incorrectAnswers++;
                }
            } else {
                // For fill-in-the-blank questions
                if (userAnswer.trim().toLowerCase() === question.answer.toLowerCase()) {
                    console.log('Correct!');
                    correctAnswers++;
                } else {
                    console.log(`Incorrect! The correct answer is: ${question.answer}`);
                    incorrectAnswers++;
                }
            }
    
            console.log(`Current Score: ${correctAnswers}/${currentQuestionIndex + 1}`);
    
            currentQuestionIndex++;
    
            if (currentQuestionIndex < questions.length) {
                AskNextQuestion();
            } else {
                GenerateReport(correctAnswers, incorrectAnswers);
                rl.close();
            }
        });
    }
    


    // Function to check if the user's answer is correct
    function isCorrectAnswer(userChoice, correctAnswer, choices) {
        return choices[userChoice - 1] === correctAnswer;
    }

    // Function to generate and display the quiz report
    function GenerateReport(correctAnswers, incorrectAnswers) {
        console.log(`\nQuiz Results:\nCorrect Answers: ${correctAnswers}\nIncorrect Answers: ${incorrectAnswers}`);
    }

    // Function to choose difficulty level and start the quiz
    function ChooseDifficulty() {
        rl.question('Choose difficulty level (1) Starter, (2) Advanced: ', (userDifficulty) => {
            const difficulty = userDifficulty === '1' ? 'starter' : 'advanced';

            // Filter questions based on difficulty
            questions = LoadQuestionsFromFile().filter(q => q.difficulty === difficulty);

            // Shuffle the filtered questions
            const shuffledQuestions = shuffleQuestions(questions);

            // Start asking questions for the chosen difficulty
            AskNextQuestion();
        });
    }

    // Load questions and start the quiz
    const config = LoadConfig();
    ChooseDifficulty();
}

// Start the quiz
AskQuestions();

