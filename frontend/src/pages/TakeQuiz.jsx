<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Auto Checking Quiz System</title>

<style>
    body {
        font-family: Arial;
        background: #f4f4f4;
        padding: 20px;
    }

    .container {
        max-width: 500px;
        margin: auto;
        background: white;
        padding: 20px;
        border-radius: 10px;
    }

    h2 {
        text-align: center;
    }

    input {
        width: 100%;
        padding: 8px;
        margin-top: 5px;
        margin-bottom: 10px;
    }

    button {
        width: 100%;
        padding: 10px;
        background: green;
        color: white;
        border: none;
        border-radius: 5px;
    }

    .result {
        margin-top: 15px;
        font-weight: bold;
    }
</style>
</head>

<body>

<div class="container">
    <h2>Auto Checking Quiz</h2>

    <p>1. Capital of France?</p>
    <input type="text" id="q1">

    <p>2. 2 + 2?</p>
    <input type="text" id="q2">

    <p>3. Color of the sky?</p>
    <input type="text" id="q3">

    <button onclick="checkQuiz()">Submit Answers</button>

    <div class="result" id="result"></div>
</div>

<script>
function checkQuiz() {

    // Correct answers
    const correctAnswers = ["paris", "4", "blue"];

    // Get user answers
    const userAnswers = [
        document.getElementById("q1").value.trim().toLowerCase(),
        document.getElementById("q2").value.trim().toLowerCase(),
        document.getElementById("q3").value.trim().toLowerCase()
    ];

    let score = 0;
    let feedback = "";

    // Auto-checking logic
    for (let i = 0; i < correctAnswers.length; i++) {

        if (userAnswers[i] === correctAnswers[i]) {
            score++;
            feedback += "Question " + (i + 1) + ": ✅ Correct<br>";
        } else {
            feedback += "Question " + (i + 1) + ": ❌ Wrong<br>";
        }

    }

    // Display result
    document.getElementById("result").innerHTML =
        "Score: " + score + " / " + correctAnswers.length +
        "<br><br>" + feedback;
}
</script>

</body>
</html>