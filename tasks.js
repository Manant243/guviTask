// Mock API endpoint
const apiUrl = 'https://65a8cafe219bfa371867996c.mockapi.io/users';

const header = document.createElement('div');
header.id = 'head';

function createInput(id, type, placeholder) {
    const input = document.createElement('input');
    input.id = id;
    input.type = type;
    input.placeholder = placeholder;

    header.appendChild(input);
    return input;
}

// Function to create a button
function createButton(text, clickHandler, type) {
    const button = document.createElement('button');
    button.id = 'btn';
    button.innerText = text;
    
    button.addEventListener('click', clickHandler);
    button.setAttribute('data-button-type', type);

    header.appendChild(button);
    return button;
}

// Function to fetch tasks from the API
async function fetchTasks() {
    try {
        const response = await fetch(apiUrl);
        const tasks = await response.json();
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
}

// Function to add a task to the DOM
function addTaskToDOM(task) {
    const taskList = document.getElementById('taskList');
    const taskElement = document.createElement('div');
    taskElement.className = 'task';

    taskElement.setAttribute('data-task-id', task.id);
    
    // Task title
    const taskTitle = document.createElement('p');
    taskTitle.className = 'card-text';
    taskTitle.innerText = task.title;

    const imgElement = document.createElement('img');
    imgElement.id = 'image';
    imgElement.src = task.avatar;

    const firstdiv = document.createElement('div');
    firstdiv.id = 'firstdiv';
    
    // Edit button
    const editButton = createButton('Edit', () => openEditModal(task.id, task.title));
    editButton.id = 'edit';

    // Delete button
    const deleteButton = createButton('Delete', () => confirmDelete(task.id));
    deleteButton.id = 'delete';

    // Append elements to the task container
    firstdiv.appendChild(imgElement);
    firstdiv.appendChild(taskTitle);

    const temp = document.createElement('div');
    temp.appendChild(editButton);
    temp.appendChild(deleteButton);
    taskElement.appendChild(firstdiv);
    taskElement.appendChild(temp);

    // Append task container to the task list
    taskList.appendChild(taskElement);
}

// Function to add a new task
async function addTask() {
    const taskInput = document.getElementById('input');
    const taskText = taskInput.value.trim();

    if (taskText !== '') {
        try {
            // Mock API POST request to add task
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify({
                    title: taskText,
                    completed: false
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            const newTask = await response.json();
            addTaskToDOM(newTask);
            taskInput.value = '';
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }
}

// Function to delete a task from the API
async function deleteTask(taskId) {
    try {
        const response = await fetch(`${apiUrl}/${taskId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Failed to delete task with ID ${taskId}`);
        }

        // Return the task ID for later DOM removal
        return taskId;
    } catch (error) {
        console.error('Error deleting task:', error);
        return null;
    }
}

// Function to confirm deletion of a task
async function confirmDelete(taskId) {
    const confirmation = window.confirm('Are you sure you want to delete this task?');

    if (confirmation) {
        try {
            // Attempt to delete the task from the API
            const deletedTaskId = await deleteTask(taskId);

            // If deletion was successful, remove the task from the DOM
            if (deletedTaskId !== null) {
                
                const taskElements = document.querySelectorAll('.task');
                const taskElement = Array.from(taskElements).find(element => {
                    return element.getAttribute('data-task-id') === deletedTaskId.toString();
                });
                console.log(taskElement);

                if (taskElement) {        
                    taskElement.remove();
                } else {
                    console.error(`Task element with ID ${deletedTaskId} not found in the DOM.`);
                }
            }
        } catch (error) {
            console.error('Error confirming deletion:', error);
        }
    }
}

function createEditModal() {
    const editModal = document.createElement('div');
    editModal.id = 'editModal';
    editModal.style.display = 'none';

    const editInput = createInput('editInput', 'text', 'Edit task');
    const saveButton = createButton('Save', saveEditedTask);
    saveButton.id = 'save';
    const cancelButton = createButton('Cancel', closeEditModal);
    cancelButton.id = 'cancel';

    const buttonModal = document.createElement('div');
    buttonModal.id = 'buttonModal';

    editModal.appendChild(editInput);
    buttonModal.appendChild(saveButton);
    buttonModal.appendChild(cancelButton);
    editModal.appendChild(buttonModal);

    const editOverlay = document.createElement('div');
    editOverlay.id = 'editOverlay';
    editOverlay.style.display = 'none';

    document.body.appendChild(editModal);
    document.body.appendChild(editOverlay);
}

// Initialize the edit modal
createEditModal();

function openEditModal(taskId, currentTitle) {
    const editInput = document.getElementById('editInput');
    editInput.value = currentTitle;

    const editModal = document.getElementById('editModal');
    editModal.style.display = 'block';

    // Store the task ID in a data attribute for later reference
    editModal.setAttribute('data-edit-task-id', taskId);

    const editOverlay = document.getElementById('editOverlay');
    editOverlay.style.display = 'block';
}

async function saveEditedTask() {
    const editInput = document.getElementById('editInput');
    const editedTitle = editInput.value;

    const editModal = document.getElementById('editModal');
    const taskId = editModal.getAttribute('data-edit-task-id');

    try {
        // Implement the logic to update the task on the API
        const response = await fetch(`${apiUrl}/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify({
                title: editedTitle,
                completed: false,  // Assuming your task model includes a 'completed' property
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to update task with ID ${taskId}`);
        }

        // Update the task title in the DOM
        const taskTitleElement = document.querySelector(`.task[data-task-id="${taskId}"] p`);
        if (taskTitleElement) {
            taskTitleElement.innerText = editedTitle;
        }

        // Close the edit modal
        closeEditModal();
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

function closeEditModal() {
    const editModal = document.getElementById('editModal');
    editModal.style.display = 'none';

    const editOverlay = document.getElementById('editOverlay');
    editOverlay.style.display = 'none';
}

async function init() {
    // Create input field
    const input1 = createInput('input', 'text', 'Enter User');

    // Create "Add" button   
    const input2 = createButton('Add', addTask);

    // Create task list container
    const taskListContainer = document.createElement('div');
    taskListContainer.id = 'taskList';

    // Append elements to the body
    document.body.appendChild(header);
    document.body.appendChild(taskListContainer);

    // Fetch tasks from the API on page load
    try {
        const tasks = await fetchTasks();
        tasks.forEach(task => {
            addTaskToDOM(task);
        });
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}

init();
