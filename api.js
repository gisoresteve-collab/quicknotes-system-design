"use strict";

const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");
const statusElement = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

let notes = [];
let isLoading = false;
let isCreating = false;
const deletingIds = new Set();

function setStatus(message, type = "") {
  statusElement.textContent = message;
  statusElement.className = type ? `status ${type}` : "status";
}

function updateButtons() {
  loadButton.disabled = isLoading || isCreating || deletingIds.size > 0;
  submitButton.disabled = isLoading || isCreating || deletingIds.size > 0;

  notesList.querySelectorAll(".delete-btn").forEach((button) => {
    const id = Number(button.dataset.id);
    button.disabled =
      isLoading ||
      isCreating ||
      deletingIds.size > 0 ||
      deletingIds.has(id);
  });
}

function renderNotes() {
  // Build elements with DOM methods and textContent, never user-controlled HTML.
  notesList.replaceChildren();

  if (notes.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "No notes to display. Load notes or create one.";
    notesList.append(emptyItem);
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    item.className = "note-card";

    const heading = document.createElement("h3");
    heading.textContent = note.title || "Untitled note";

    const body = document.createElement("p");
    body.textContent = note.body || "No body provided.";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = deletingIds.has(note.id)
      ? "Deleting..."
      : "Delete";
    deleteButton.dataset.id = String(note.id);
    deleteButton.addEventListener("click", () => deleteNote(note.id));

    item.append(heading, body, deleteButton);
    notesList.append(item);
  });

  updateButtons();
}

// Reusable request helper: checks HTTP status and parses JSON when available.
async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  // DELETE responses may have no body.
  if (response.status === 204) {
    return { data: null, status: response.status };
  }

  const data = await response.json();
  return { data, status: response.status };
}

function showRequestError(action, error) {
  console.error(`${action} failed:`, error);

  if (error instanceof TypeError) {
    setStatus(
      `Unable to ${action.toLowerCase()}. Check your internet connection and try again.`,
      "error"
    );
  } else {
    setStatus(
      `Unable to ${action.toLowerCase()} (HTTP ${error.status || "unknown"}). Please try again.`,
      "error"
    );
  }
}

async function loadNotes() {
  if (isLoading || isCreating || deletingIds.size > 0) return;

  isLoading = true;
  updateButtons();
  setStatus("Loading notes...", "loading");

  try {
    const { data } = await request(`${API_URL}?_limit=10`);

    if (!Array.isArray(data)) {
      throw new Error("The server returned an unexpected response.");
    }

    notes = data;

    if (notes.length === 0) {
      renderNotes();
      setStatus("No notes were found.", "empty");
    } else {
      renderNotes();
      setStatus(`Loaded ${notes.length} notes from the server.`, "success");
    }
  } catch (error) {
    showRequestError("load notes", error);
  } finally {
    isLoading = false;
    updateButtons();
  }
}

async function createNote(event) {
  event.preventDefault();

  if (isLoading || isCreating || deletingIds.size > 0) return;

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus("Please enter a title.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    setStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  isCreating = true;
  updateButtons();
  setStatus("Creating note...", "loading");

  try {
    const { data, status } = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        body,
        userId: 1
      })
    });

    if (!data || data.id === undefined) {
      throw new Error("The server returned an invalid note.");
    }

    // JSONPlaceholder simulates creation but does not permanently save posts.
    // Keep the returned note in local UI state so the user can see the result.
    const createdNote = {
      id: data.id,
      title: data.title ?? title,
      body: data.body ?? body,
      userId: data.userId ?? 1
    };

    notes = [createdNote, ...notes];
    renderNotes();
    noteForm.reset();

    setStatus(
      `Note created (status ${status}, id ${createdNote.id}). Note: the practice API does not permanently save it.`,
      "success"
    );
  } catch (error) {
    showRequestError("create note", error);
  } finally {
    isCreating = false;
    updateButtons();
  }
}

async function deleteNote(id) {
  if (isLoading || isCreating || deletingIds.size > 0) return;

  deletingIds.add(id);
  renderNotes();
  updateButtons();
  setStatus("Deleting note...", "loading");

  try {
    await request(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    // JSONPlaceholder simulates deletion; remove it from this page's local state.
    notes = notes.filter((note) => note.id !== id);
    renderNotes();

    if (notes.length === 0) {
      setStatus("Note deleted. No notes remain in the list.", "success");
    } else {
      setStatus("Note deleted successfully.", "success");
    }
  } catch (error) {
    showRequestError("delete note", error);
  } finally {
    deletingIds.delete(id);
    renderNotes();
    updateButtons();
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);

// Render a helpful empty state on the first page load.
renderNotes();