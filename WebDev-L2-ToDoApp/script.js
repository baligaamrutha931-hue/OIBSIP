/* DOM ELEMENTS */

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");

const pendingTasksContainer =
    document.getElementById("pendingTasks");

const completedTasksContainer =
    document.getElementById("completedTasks");

const pendingCount =
    document.getElementById("pendingCount");

const completedCount =
    document.getElementById("completedCount");

const pendingEmpty =
    document.getElementById("pendingEmpty");

const completedEmpty =
    document.getElementById("completedEmpty");


/* TASK DATA */

// Load existing tasks from localStorage
let tasks = loadTasks();


/* ADD TASK */

function addTask() {

    const taskText = taskInput.value.trim();

    // Prevent empty tasks
    if (taskText === "") {
        alert("Please enter a task.");
        taskInput.focus();
        return;
    }

    // Create a new task object
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    // Add task to the beginning of the array
    tasks.unshift(newTask);

    // Save the updated tasks
    saveTasks();

    // Clear input
    taskInput.value = "";

    // Display updated tasks
    renderTasks();

    // Put cursor back in input
    taskInput.focus();
}


/* RENDER TASKS */

function renderTasks() {

    // Clear current lists
    pendingTasksContainer.innerHTML = "";
    completedTasksContainer.innerHTML = "";

    // Separate pending and completed tasks
    const pendingTasks =
        tasks.filter(task => !task.completed);

    const completedTasks =
        tasks.filter(task => task.completed);


    /* PENDING TASKS */

    pendingTasks.forEach(task => {

        const taskElement =
            createTaskElement(task);

        pendingTasksContainer.appendChild(taskElement);
    });


    /* COMPLETED TASKS */

    completedTasks.forEach(task => {

        const taskElement =
            createTaskElement(task);

        completedTasksContainer.appendChild(taskElement);
    });


    // Update counters
    updateCounts();

    // Update empty state messages
    updateEmptyStates();
}


/* CREATE TASK ELEMENT  */

function createTaskElement(task) {

    // Main task container
    const taskItem = document.createElement("article");

    taskItem.className = "task-item";

    if (task.completed) {
        taskItem.classList.add("completed-task");
    }


    /* TASK CONTENT */

    const taskContent =
        document.createElement("div");

    taskContent.className = "task-content";


    const taskText =
        document.createElement("div");

    taskText.className = "task-text";

    taskText.textContent = task.text;


    const taskTime =
        document.createElement("small");

    taskTime.className = "task-time";


    if (task.completed && task.completedAt) {

        taskTime.textContent =
            "Added: " +
            formatDate(task.createdAt) +
            " • Completed: " +
            formatDate(task.completedAt);

    } else {

        taskTime.textContent =
            "Added: " +
            formatDate(task.createdAt);
    }


    taskContent.appendChild(taskText);
    taskContent.appendChild(taskTime);


    /* BUTTONS */

    const taskActions =
        document.createElement("div");

    taskActions.className = "task-actions";


    // Complete / Restore button

    const completeButton =
        document.createElement("button");

    completeButton.type = "button";
    completeButton.className = "task-btn";


    if (task.completed) {

        completeButton.textContent =
            "↩ Pending";

        completeButton.classList.add("restore-btn");

        completeButton.setAttribute(
            "aria-label",
            "Move task back to pending"
        );

    } else {

        completeButton.textContent =
            "✓ Complete";

        completeButton.classList.add("complete-btn");

        completeButton.setAttribute(
            "aria-label",
            "Mark task as complete"
        );
    }


    completeButton.addEventListener(
        "click",
        () => toggleComplete(task.id)
    );


    // Edit button

    const editButton =
        document.createElement("button");

    editButton.type = "button";

    editButton.className =
        "task-btn edit-btn";

    editButton.textContent = "Edit";

    editButton.setAttribute(
        "aria-label",
        "Edit task"
    );

    editButton.addEventListener(
        "click",
        () => editTask(task.id)
    );


    // Delete button

    const deleteButton =
        document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className =
        "task-btn delete-btn";

    deleteButton.textContent = "Delete";

    deleteButton.setAttribute(
        "aria-label",
        "Delete task"
    );

    deleteButton.addEventListener(
        "click",
        () => deleteTask(task.id)
    );


    taskActions.appendChild(completeButton);
    taskActions.appendChild(editButton);
    taskActions.appendChild(deleteButton);


    /* FINAL TASK ELEMENT */

    taskItem.appendChild(taskContent);
    taskItem.appendChild(taskActions);

    return taskItem;
}


/* EDIT TASK */

function editTask(taskId) {

    const task = tasks.find(
        task => task.id === taskId
    );

    if (!task) {
        return;
    }


    // Find the task element
    const taskElements =
        document.querySelectorAll(".task-item");


    taskElements.forEach(taskElement => {

        const textElement =
            taskElement.querySelector(".task-text");

        if (
            textElement &&
            textElement.textContent === task.text
        ) {

            // Create edit input
            const editInput =
                document.createElement("input");

            editInput.type = "text";

            editInput.className =
                "edit-input";

            editInput.value = task.text;

            editInput.setAttribute(
                "aria-label",
                "Edit task text"
            );


            // Create Save button
            const saveButton =
                document.createElement("button");

            saveButton.type = "button";

            saveButton.className =
                "task-btn save-btn";

            saveButton.textContent = "Save";


            // Create Cancel button
            const cancelButton =
                document.createElement("button");

            cancelButton.type = "button";

            cancelButton.className =
                "task-btn cancel-btn";

            cancelButton.textContent = "Cancel";


            // Replace task text with input
            textElement.innerHTML = "";

            textElement.appendChild(editInput);


            // Replace buttons
            const actions =
                taskElement.querySelector(".task-actions");

            actions.innerHTML = "";

            actions.appendChild(saveButton);
            actions.appendChild(cancelButton);


            editInput.focus();

            editInput.select();


            // Save edited task
            saveButton.addEventListener(
                "click",
                () => {

                    const newText =
                        editInput.value.trim();

                    if (newText === "") {

                        alert(
                            "Task cannot be empty."
                        );

                        editInput.focus();

                        return;
                    }

                    task.text = newText;

                    saveTasks();

                    renderTasks();
                }
            );


            // Cancel editing
            cancelButton.addEventListener(
                "click",
                () => {
                    renderTasks();
                }
            );


            // Save using Enter
            editInput.addEventListener(
                "keydown",
                event => {

                    if (event.key === "Enter") {
                        saveButton.click();
                    }

                    if (event.key === "Escape") {
                        cancelButton.click();
                    }
                }
            );
        }
    });
}


/* TOGGLE COMPLETE */

function toggleComplete(taskId) {

    const task = tasks.find(
        task => task.id === taskId
    );

    if (!task) {
        return;
    }


    task.completed = !task.completed;


    if (task.completed) {

        // Store completion time
        task.completedAt =
            new Date().toISOString();

    } else {

        // Remove completion time
        task.completedAt = null;
    }


    saveTasks();

    renderTasks();
}


/*DELETE TASK*/

function deleteTask(taskId) {

    const task = tasks.find(
        task => task.id === taskId
    );

    if (!task) {
        return;
    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmDelete) {
        return;
    }


    tasks = tasks.filter(
        task => task.id !== taskId
    );


    saveTasks();

    renderTasks();
}


/*UPDATE COUNTS*/

function updateCounts() {

    const pending =
        tasks.filter(
            task => !task.completed
        ).length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    pendingCount.textContent =
        `${pending} pending`;


    completedCount.textContent =
        `${completed} completed`;
}


/* EMPTY STATES*/

function updateEmptyStates() {

    const pending =
        tasks.filter(
            task => !task.completed
        ).length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    if (pending === 0) {

        pendingEmpty.style.display =
            "block";

    } else {

        pendingEmpty.style.display =
            "none";
    }


    if (completed === 0) {

        completedEmpty.style.display =
            "block";

    } else {

        completedEmpty.style.display =
            "none";
    }
}


/* LOCAL STORAGE */

function saveTasks() {

    localStorage.setItem(
        "todoTasks",
        JSON.stringify(tasks)
    );
}


function loadTasks() {

    const savedTasks =
        localStorage.getItem("todoTasks");


    if (!savedTasks) {
        return [];
    }


    try {

        return JSON.parse(savedTasks);

    } catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );

        return [];
    }
}


/* FORMAT DATE */

function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


/* EVENT LISTENERS*/

// Add task when button is clicked
addTaskBtn.addEventListener(
    "click",
    addTask
);


// Add task when Enter is pressed
taskInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            addTask();
        }
    }
);


/* INITIAL LOAD*/

// Display saved tasks when page opens
renderTasks();