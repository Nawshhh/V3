// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function showLogIn() {
  document.querySelector(".popup-login-content").style.display = "block";
  document.querySelector(".popup-login").style.display = "flex";
  document.querySelector(".options").style.display = "none";
}

function closeLogIn() {
  document.querySelector(".popup-login-content").style.display = "none";
  document.querySelector(".popup-login").style.display = "none";

  document.querySelector(".options").style.display = "block";
  return false; // Prevent default form submission
}

function showSignup() {
  document.querySelector(".popup-signup-content").style.display = "block";
  document.querySelector(".popup-signup").style.display = "flex";
  document.querySelector(".options").style.display = "none";
}

function closeSignup() {
  document.querySelector(".popup-signup-content").style.display = "none";
  document.querySelector(".popup-signup").style.display = "none";

  let email = document.getElementsByName("email1");
  email.value = "";

  let username = document.getElementsByName("sign2");
  username.value = "";

  let password = document.getElementsByName("firstpass");
  password.value = "";

  let v_password = document.getElementById("verify-password-signup");
  v_password.value = "";

  document.querySelector(".options").style.display = "block";

  return false; // Prevent default form submission
}
// Adjusted function in user-profile.js for profile updates
function updateProfile(event) {
  event.preventDefault(); // Prevent default form submission

  // Use FormData to automatically capture form data, including files
  const formData = new FormData(document.getElementById("editProfileForm"));

  // Since you're uploading a file, you should not set 'Content-Type' header manually.
  // The browser will set it to 'multipart/form-data' with the correct boundary.
  fetch("/update-profile", {
    method: "POST",
    body: formData, // Send FormData directly
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Profile updated successfully!");
        window.location.href = "/userProfile";
      } else {
        alert(data.message || "Failed to update profile. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Adjusted to ensure the form submit event is correctly bound to the updateProfile function
document
  .getElementById("editProfileForm")
  .addEventListener("submit", updateProfile);

document
  .getElementById("deleteAccountBtn")
  .addEventListener("click", function () {
    var confirmDeletion = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (confirmDeletion) {
      fetch("/delete-account", {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Account deleted successfully.");
            // Redirect based on the response from the server
            window.location.href = data.redirectTo;
          } else {
            alert("Failed to delete account. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred. Please try again.");
        });
    }
  });

function addModalHandlers(buttonClass, modalClass, closeClass, saveClass) {
  const buttons = document.querySelectorAll(buttonClass);
  const modals = document.querySelectorAll(modalClass);
  const closeButtons = document.querySelectorAll(closeClass);
  const saveButtons = document.querySelectorAll(saveClass);

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      modals[index].showModal();
    });
  });

  closeButtons.forEach((closeButton, index) => {
    closeButton.addEventListener("click", () => {
      modals[index].close();
    });
  });

  if (saveClass) {
    saveButtons.forEach((saveButton, index) => {
      saveButton.addEventListener("click", () => {
        modals[index].close();
      });
    });
  }
}

// For the first set of modals
addModalHandlers(
  ".edit-button",
  ".edit-popup-container",
  ".edit-popup-close-button",
  "save-post-popup-edit"
);
addModalHandlers(
  ".del-button",
  ".delete-popup-container",
  ".confirm-del-button",
  ".cancel-del-button"
);
addModalHandlers(
  ".owner-reply-button",
  ".owner-reply-container",
  ".owner-popup-close-button",
  ".owner-save-post-popup"
);

// Object to store the latest ratings for each type
let latestRatings = {};

// Function to send data to the server
function sendDataToServer(formData) {
  // Example URL where you want to send the data
  const url = "/update-comment";

  // Fetch API to send data to the server
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      // Handle response from the server if needed
      console.log("Data sent successfully.");
    })
    .catch((error) => {
      // Handle error if the request fails
      console.error("Error sending data:", error);
    });
}

function handleSubmit(event) {
  event.preventDefault(); // Prevent default form submission

  const modals = document.querySelectorAll(".edit-popup-container"); // get the number of edits

  // Get form data
  const formData = new FormData(event.target);

  // Construct object with only id, title, and desc
  const data = {
    id: formData.get("id"),
    title: formData.get("title"),
    desc: formData.get("desc"),
  };

  // Check if all ratings are provided
  const requiredRatings = ["food", "service", "ambiance", "overall"];
  const suffixes = [...Array(modals.length).keys()];

  console.log(suffixes);
  for (const ratingType of requiredRatings) {
    let ratingProvided = false;
    for (const suffix of suffixes) {
      if (latestRatings.hasOwnProperty(`${ratingType}-${suffix}`)) {
        ratingProvided = true;
        break;
      }
    }
    if (!ratingProvided) {
      alert(`Please provide a ${ratingType} rating.`);
      return; // Prevent further execution
    }
  }

  // Merge form data and latest ratings
  const mergedData = { ...data, ...latestRatings };

  // Send data to the server
  sendDataToServer(mergedData);

  // Close the modal associated with the form

  const form = event.target;
  const modalId = form.dataset.modalId; // Retrieve the modal ID from the data attribute
  console.log("MODAL ID: ", modalId);
  modals[modalId].close();
}

// Function to handle star click
function handleStarClick(stars, index, ratingType) {
  stars.forEach((star, index2) => {
    index >= index2
      ? star.classList.add("active")
      : star.classList.remove("active");
  });

  // Get the rating value (index + 1 because index is 0-based)
  const ratingValue = index + 1;

  // Update the latest rating for the corresponding type
  latestRatings[ratingType] = ratingValue;

  // Log the latest rating
  console.log(`Latest ${ratingType} Rating:`, ratingValue);
}

// Initialize listeners for each set of stars
document.querySelectorAll(".stars").forEach((starsContainer) => {
  const stars = starsContainer.querySelectorAll(".fa-solid.fa-star");
  const ratingType = starsContainer.id.replace("-stars", ""); // Get the type of rating
  stars.forEach((star, index1) => {
    star.addEventListener("click", () => {
      const starsInContainer = document.querySelectorAll(
        `#${starsContainer.id} .fa-solid.fa-star`
      );
      handleStarClick(starsInContainer, index1, ratingType);
    });
  });
});

// Get all forms with class 'update-comment' and add submit event listener to each
const forms = document.querySelectorAll('form[name="update-comment"]');
forms.forEach((form) => {
  form.addEventListener("submit", handleSubmit);
});


//======================= VOTE ========================
var thumbsUpClicked = false;
var thumbsDownClicked = false;

// Function to handle thumbs-up button click
document.querySelector(".thumbs-up-btn").addEventListener("click", function () {
  var likeCountElement = document.getElementById("count-like");
  var likeCount = parseInt(likeCountElement.textContent);

  if (!thumbsUpClicked && !thumbsDownClicked) {
    likeCount++;
    thumbsUpClicked = true; 
  } else if (thumbsUpClicked) {
    // If thumbs-up button is already clicked, decrement like count
    likeCount--;
    thumbsUpClicked = false; // Update state to unclicked
  }

  likeCountElement.textContent = likeCount;
});

// Function to handle thumbs-down button click
document
  .querySelector(".thumbs-down-btn")
  .addEventListener("click", function () {
    var dislikeCountElement = document.getElementById("count-dislike");
    var dislikeCount = parseInt(dislikeCountElement.textContent);

    if (!thumbsDownClicked && !thumbsUpClicked) {
      dislikeCount++;
      thumbsDownClicked = true;
    } else if (thumbsDownClicked) {
      dislikeCount--;
      thumbsDownClicked = false; 
    }

    dislikeCountElement.textContent = dislikeCount;
  });
