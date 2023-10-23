window.onload = function () {
  const menuContainer = document.getElementById("menucontainer");

  /* Data */
  let menuData = [];
  let miscMenuData = [];
  let navigationStack = [];

  /* Tooltips */
  let tooltipDiv = document.createElement("div");
  tooltipDiv.classList.add("tooltipDiv");
  document.body.appendChild(tooltipDiv);

  /* Animations */
  menuContainer.addEventListener("animationend", function () {
    menuContainer.classList.remove("menu-animation-enter");
    menuContainer.classList.remove("menu-animation-exit");
  });

  let inForm = false;

  // Create a content container inside menucontainer
  const contentContainer = document.createElement("div");
  contentContainer.id = "contentcontainer";
  menuContainer.appendChild(contentContainer);

  // Create title element inside the content container
  const menuTitle = document.createElement("div");
  menuTitle.id = "menutitle";
  contentContainer.appendChild(menuTitle);

  const menuTitleContainer = document.createElement("div");
  menuTitleContainer.id = "menuTitleContainer";
  menuTitle.appendChild(menuTitleContainer);

  const divider = document.createElement("div");
  divider.className = "divider";
  contentContainer.appendChild(divider);

  // Buttons container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.id = "buttonscontainer";
  contentContainer.appendChild(buttonsContainer);
  buttonsContainer.scrollTop = 0; // Set the scroll position to the top

  const searchBar = document.createElement("input");
  searchBar.type = "text";
  searchBar.placeholder = "Search...";
  searchBar.id = "searchBar";
  searchBar.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const buttons = buttonsContainer.querySelectorAll(".button");

    buttons.forEach((button) => {
      const buttonText = button
        .querySelector(".button-text")
        .innerText.toLowerCase();
      if (buttonText.includes(query)) {
        button.style.display = "flex";
      } else {
        button.style.display = "none";
      }
    });
  });

  searchBar.onmouseover = function () {
    // Check if the button has been hovered over
    if (this.dataset.hovered !== "true") {
      this.dataset.hovered = "true"; // Mark the button as hovered
      sendToLua({ type: "buttonHover" });
    }

    searchBar.onmouseleave = function () {
      this.dataset.hovered = "false"; // Reset the hover state
    };
  };

  contentContainer.appendChild(searchBar);

  const divider2 = document.createElement("div");
  divider2.className = "divider";
  contentContainer.appendChild(divider2);

  const craftingIcons = document.createElement("div");
  craftingIcons.className = "crafting-icons";
  contentContainer.appendChild(craftingIcons);

  const divider3 = document.createElement("div");
  divider3.className = "divider";
  contentContainer.appendChild(divider3);

  const informationDiv = document.createElement("div");
  informationDiv.className = "information-div";
  contentContainer.appendChild(informationDiv);

  function createRequirementDiv(requirement) {
    const reqDiv = document.createElement("div");
    reqDiv.classList.add("requirement-div");

    const reqImg = document.createElement("div");

    let imageUrl;
    if (requirement.image.includes("http")) {
      imageUrl = requirement.image; // Use the provided URL directly
    } else {
      // If the image URL does not start with "http", reroute it using the NUI path
      imageUrl = `nui://wrp_inventory/web/images/${requirement.image}`;
    }

    reqImg.style.backgroundImage = `url(${imageUrl})`;
    reqDiv.appendChild(reqImg);

    const reqAmount = document.createElement("span");
    reqAmount.innerText = "x" + requirement.amount;
    reqDiv.appendChild(reqAmount);

    return reqDiv;
  }

  // Create close button

  let backbuttoncurrentid = "";
  const backButton = document.createElement("button");
  backButton.id = "backButton";
  backButton.innerText = "Back";
  contentContainer.appendChild(backButton);

  backButton.onclick = function () {
    if (navigationStack.length > 1) {
      navigationStack.pop();
      let previousMenu = navigationStack[navigationStack.length - 1];
      displayMenu(previousMenu);

      searchBar.value = ""; // Clear the search bar

      if (inForm) {
        searchBar.style.display = "flex";
        inForm = false;
      }

      const buttons = buttonsContainer.querySelectorAll(".button");
      buttons.forEach((button) => {
        button.style.display = "flex";
      });
      clearDivBelow();
      $.post(
        "http://wrp_menu/backButtonClick",
        JSON.stringify({ id: backbuttoncurrentid })
      );
    }
  };

  backButton.onmouseover = function () {
    // Check if the button has been hovered over
    if (this.dataset.hovered !== "true") {
      this.dataset.hovered = "true"; // Mark the button as hovered
      sendToLua({ type: "buttonHover" });
    }

    backButton.onmouseleave = function () {
      this.dataset.hovered = "false"; // Reset the hover state
    };
  };

  const closeButton = document.createElement("button");
  closeButton.id = "closeButton";
  closeButton.innerText = "Close";
  contentContainer.appendChild(closeButton);

  closeButton.onclick = function () {
    $.post("http://wrp_menu/close", JSON.stringify({}));
  };

  closeButton.onmouseover = function () {
    // Check if the button has been hovered over
    if (this.dataset.hovered !== "true") {
      this.dataset.hovered = "true"; // Mark the button as hovered
      sendToLua({ type: "buttonHover" });
    }

    closeButton.onmouseleave = function () {
      this.dataset.hovered = "false"; // Reset the hover state
    };
  };

  function setTitle(title) {
    menuTitleContainer.innerText = title;
  }

  function adjustTitleFontSize() {
    const titleElem = document.getElementById("menuTitleContainer");
    let fontSize = 5; // base font size in vw
    titleElem.style.fontSize = `${fontSize}vw`;

    while (titleElem.scrollWidth > titleElem.offsetWidth) {
      fontSize -= 0.3; // decrease the size by 0.1vw
      titleElem.style.fontSize = `${fontSize}vw`;
    }

    fontSize -= 0.5; // decrease the size by 0.1vw
    titleElem.style.fontSize = `${fontSize}vw`;
  }

  function displayMenu(menu) {
    buttonsContainer.innerHTML = ""; // Clear existing buttons
    buttonsContainer.scrollTop = 0; // Set the scroll position to the top

    menu.forEach((item) => {
      let button = createButton(item);

      buttonsContainer.appendChild(button);
    });

    // Back button handling
    let backButton = document.getElementById("backButton");
    let closeButton = document.getElementById("closeButton");
    if (navigationStack.length > 1) {
      if ((backButton.style.display = "none")) {
        backButton.style.display = "flex";

        // Edits the CSS of the closebutton to remove margin-top
        if (miscMenuData.closeButton) {
          closeButton.style.marginTop = "0px";
        }
      }
    } else if ((backButton.style.display = "flex")) {
      backButton.style.display = "none";

      if (miscMenuData.closeButton) {
        closeButton.style.marginTop = "auto";
      }
    }

    // For initial animation
    if (miscMenuData.align === "left") {
      menuContainer.classList.add("menu-animation-enter");
      menuContainer.style.animationName = "slideInFromLeft";
    } else if (miscMenuData.align === "right") {
      menuContainer.classList.add("menu-animation-enter");
      menuContainer.style.animationName = "slideInFromRight";
    } else {
      menuContainer.classList.add("menu-animation-enter");
      menuContainer.style.animationName = "slideInFromBottom";
    }
  }

  function displayForm(buttonId, formData) {
    // Clear existing form and buttons
    buttonsContainer.innerHTML = "";

    const formDataObj = {};

    const form = document.createElement("form");
    form.id = "dynamicForm";

    function isImgurURL(url) {
      return /^https?:\/\/i\.imgur\.com\/[\w-]+(\.(jpg|jpeg|png|gif))?$/i.test(
        url
      );
    }

    formData.form.forEach((field) => {
      const formDiv = document.createElement("div");
      formDiv.id = "formDiv";
      const label = document.createElement("label");
      label.classList.add("labelForm");
      label.innerText = field.label;
      form.appendChild(formDiv);

      let inputElement;

      switch (field.type) {
        case "short-text":
          inputElement = document.createElement("input");
          inputElement.classList.add("shortInput");
          inputElement.type = "text";
          if (field.placeholder) inputElement.placeholder = field.placeholder;

          if (field.readonly) inputElement.readOnly = true;

          inputElement.onmouseover = function () {
            // Check if the button has been hovered over
            if (this.dataset.hovered !== "true") {
              this.dataset.hovered = "true"; // Mark the button as hovered
              sendToLua({ type: "buttonHover" });
            }

            inputElement.onmouseleave = function () {
              this.dataset.hovered = "false"; // Reset the hover state
            };
          };

          if (field.autofill) inputElement.value = field.autofill;

          formDiv.appendChild(label);
          formDiv.appendChild(inputElement);
          break;
        case "number":
          inputElement = document.createElement("input");
          inputElement.classList.add("shortInput");
          inputElement.type = "number";
          inputElement.step = "any";
          if (field.placeholder) inputElement.placeholder = field.placeholder;

          if (field.readonly) inputElement.readOnly = true;

          if (field.min && field.max) {
            inputElement.addEventListener("input", function () {
              if (this.value < field.min) {
                this.value = field.min;
              } else if (this.value > field.max) {
                this.value = field.max;
              }
            });
          }

          inputElement.onmouseover = function () {
            // Check if the button has been hovered over
            if (this.dataset.hovered !== "true") {
              this.dataset.hovered = "true"; // Mark the button as hovered
              sendToLua({ type: "buttonHover" });
            }

            inputElement.onmouseleave = function () {
              this.dataset.hovered = "false"; // Reset the hover state
            };
          };

          if (field.autofill) inputElement.value = field.autofill;

          formDiv.appendChild(label);
          formDiv.appendChild(inputElement);
          break;
        case "options":
          if (field.searchbar) {
            // Create search input
            inputElement = document.createElement("input");
            inputElement.setAttribute("type", "text");
            inputElement.placeholder = "Search...";
            inputElement.classList.add("results-searchbar");

            const resultsContainer = document.createElement("div");
            resultsContainer.classList.add("results");

            // Function to display options based on a filter
            const displayOptions = (filterFunc) => {
              resultsContainer.innerHTML = ""; // Clear previous results

              const filteredOptions = field.options.filter(filterFunc);

              filteredOptions.forEach((opt) => {
                const resultOption = document.createElement("div");
                resultOption.innerText = opt.label;
                resultOption.classList.add("result-option");

                // On clicking a result
                resultOption.addEventListener("click", function () {
                  inputElement.value = opt.label;
                  inputElement.dataset.validOption = opt.value; // store the valid option's value
                  resultsContainer.innerHTML = "";
                });

                // The existing hover code
                resultOption.onmouseover = function () {
                  if (this.dataset.hovered !== "true") {
                    this.dataset.hovered = "true";
                    sendToLua({ type: "buttonHover" });
                  }

                  resultOption.onmouseleave = function () {
                    this.dataset.hovered = "false";
                  };
                };

                resultOption.onclick = function () {
                  sendToLua({ type: "buttonClick" });
                };

                resultsContainer.appendChild(resultOption);
              });
            };

            // Display all options by default
            displayOptions(() => true); // No filtering, always true

            // On typing in the search bar
            inputElement.addEventListener("input", function () {
              const searchVal = this.value.toLowerCase();
              displayOptions((opt) =>
                opt.label.toLowerCase().includes(searchVal)
              );
            });

            inputElement.onclick = function () {
              sendToLua({ type: "buttonClick" });
            };

            // The existing hover code
            inputElement.onmouseover = function () {
              if (this.dataset.hovered !== "true") {
                this.dataset.hovered = "true";
                sendToLua({ type: "buttonHover" });
              }

              inputElement.onmouseleave = function () {
                this.dataset.hovered = "false";
              };
            };

            formDiv.appendChild(label);
            formDiv.appendChild(inputElement);
            formDiv.appendChild(resultsContainer);
          } else {
            // Existing code for dropdown select option
            inputElement = document.createElement("select");
            field.options.forEach((opt) => {
              const option = document.createElement("option");
              option.value = opt.value;
              option.innerText = opt.label;
              inputElement.appendChild(option);
            });
            inputElement.classList.add("options");

            // The existing hover code
            inputElement.onmouseover = function () {
              if (this.dataset.hovered !== "true") {
                this.dataset.hovered = "true";
                sendToLua({ type: "buttonHover" });
              }

              inputElement.onmouseleave = function () {
                this.dataset.hovered = "false";
              };
            };

            formDiv.appendChild(label);
            formDiv.appendChild(inputElement);
          }
          break;
        case "long-text":
          inputElement = document.createElement("textarea");
          inputElement.classList.add("textarea");
          if (field.placeholder) inputElement.placeholder = field.placeholder;

          if (field.readonly) inputElement.readOnly = true;

          inputElement.addEventListener("paste", function (event) {
            event.stopPropagation();

            var clipboardData = event.clipboardData || window.clipboardData;
            var pastedData = clipboardData.getData("text");

            if (isImgurURL(pastedData)) {
              event.preventDefault();
              var imageUrl = pastedData.trim();

              var currentValue = inputElement.value;
              var updatedValue =
                currentValue +
                "\n" +
                imageUrl +
                "\n(Images need to be single-line and isolated)";
              inputElement.value = updatedValue;
            }
          });

          inputElement.onmouseover = function () {
            // Check if the button has been hovered over
            if (this.dataset.hovered !== "true") {
              this.dataset.hovered = "true"; // Mark the button as hovered
              sendToLua({ type: "buttonHover" });
            }

            inputElement.onmouseleave = function () {
              this.dataset.hovered = "false"; // Reset the hover state
            };
          };

          if (field.autofill) inputElement.value = field.autofill;

          formDiv.appendChild(label);
          formDiv.appendChild(inputElement);
          break;
        case "prompt":
          const promptContainer = document.createElement("div");
          promptContainer.classList.add("promptButtonContainer");

          // So these buttons can be referenced outside of the click event
          var yesButton;
          var noButton;

          // Creating the first (Yes/True) button
          yesButton = document.createElement("button");
          yesButton.innerText = field.yesLabel || "Yes";
          yesButton.classList.add("promptButton");
          yesButton.addEventListener("click", function (event) {
            event.preventDefault();
            inputElement.value = true;
            yesButton.classList.add("promptButtonSelected");
            noButton.classList.remove("promptButtonSelected");
          });

          // Creating the second (No/False) button
          noButton = document.createElement("button");
          noButton.innerText = field.noLabel || "No";
          noButton.classList.add("promptButton");
          noButton.addEventListener("click", function (event) {
            event.preventDefault();
            inputElement.value = false;
            noButton.classList.add("promptButtonSelected");
            yesButton.classList.remove("promptButtonSelected");
          });

          noButton.classList.add("promptButtonSelected");

          // A hidden input to hold the true/false value
          inputElement = document.createElement("input");
          inputElement.type = "hidden";
          inputElement.value = false; // False initially, until a button is pressed

          if (field.default) {
            inputElement.value = field.default; // If a default value is set, use that instead

            if (field.default == true) {
              yesButton.classList.add("promptButtonSelected");
              noButton.classList.remove("promptButtonSelected");
            }
          }

          // Adding the buttons to the container because inputElement is hidden
          // because it's a horizontal column and not vertical so we need two divs instead of one
          let titlediv = document.createElement("div");
          titlediv.classList.add("titlediv");
          titlediv.appendChild(label);

          promptContainer.appendChild(titlediv);

          let buttonPrompts = document.createElement("div");
          buttonPrompts.classList.add("buttonPrompts");

          buttonPrompts.appendChild(yesButton);
          buttonPrompts.appendChild(noButton);

          promptContainer.appendChild(titlediv);
          promptContainer.appendChild(buttonPrompts);

          formDiv.appendChild(promptContainer);
          formDiv.appendChild(inputElement);

          yesButton.onmouseover = function () {
            // Check if the button has been hovered over
            if (this.dataset.hovered !== "true") {
              this.dataset.hovered = "true"; // Mark the button as hovered
              sendToLua({ type: "buttonHover" });
            }

            yesButton.onmouseleave = function () {
              this.dataset.hovered = "false"; // Reset the hover state
            };
          };

          yesButton.onclick = function () {
            sendToLua({ type: "buttonClick" });
          };

          noButton.onmouseover = function () {
            // Check if the button has been hovered over
            if (this.dataset.hovered !== "true") {
              this.dataset.hovered = "true"; // Mark the button as hovered
              sendToLua({ type: "buttonHover" });
            }

            noButton.onmouseleave = function () {
              this.dataset.hovered = "false"; // Reset the hover state
            };
          };

          noButton.onclick = function () {
            sendToLua({ type: "buttonClick" });
          };

          break;
        case "entries":
          inputElement = document.createElement("div");
          inputElement.classList.add("multipleEntryContainer");

          // Assuming 'field.entries' is an array of options for this field
          field.entries.forEach((entry) => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = entry.value;
            checkbox.id = entry.value + "-checkbox"; // unique id
            checkbox.style.display = "none"; // Hide the default checkbox

            const checkboxlabel = document.createElement("label");
            checkboxlabel.htmlFor = checkbox.id;
            checkboxlabel.innerText = entry.label;

            const checkboxDiv = document.createElement("div");
            checkboxDiv.classList.add("checkboxDiv");

            const imageDiv = document.createElement("div");
            imageDiv.classList.add("imageDiv");

            const tickBoxImage = document.createElement("img");
            tickBoxImage.src =
              "http://femga.com/images/samples/ui_textures_no_bg/generic_textures/tick_box.png";

            const tickImage = document.createElement("img");
            tickImage.src =
              "http://femga.com/images/samples/ui_textures_no_bg/generic_textures/tick.png";
            tickImage.style.display = "none"; // Hide the tick image by default

            imageDiv.appendChild(tickBoxImage);
            imageDiv.appendChild(tickImage);
            checkboxDiv.appendChild(imageDiv);
            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(checkboxlabel);

            checkboxDiv.addEventListener("click", function () {
              checkbox.checked = !checkbox.checked; // Toggle the checkbox state
              tickImage.style.display = checkbox.checked ? "block" : "none"; // Display tickImage based on checkbox state
              sendToLua({ type: "buttonClick" });
            });

            checkboxDiv.onmouseover = function () {
              // Check if the button has been hovered over
              if (this.dataset.hovered !== "true") {
                this.dataset.hovered = "true"; // Mark the button as hovered
                sendToLua({ type: "buttonHover" });
              }

              checkboxDiv.onmouseleave = function () {
                this.dataset.hovered = "false"; // Reset the hover state
              };
            };

            inputElement.appendChild(checkboxDiv);
          });

          formDiv.appendChild(label);
          formDiv.appendChild(inputElement);
          break;
        case "slider":
          inputElement = document.createElement("input");
          inputElement.classList.add("sliderInput");
          inputElement.type = "range";
          inputElement.min = 1; // Start from 1
          inputElement.max = field.slideroptions.length; // Adjusted max
          inputElement.value = field.default || 1; // Start from 1

          let sliderTitle = document.createElement("div");
          sliderTitle.innerText = field.label;
          sliderTitle.classList.add("labelForm");

          let slidernumber = document.createElement("input");
          slidernumber.classList.add("shortInput");
          slidernumber.type = "number";
          slidernumber.value = field.default || 1; // Start from 1

          slidernumber.addEventListener("input", function () {
            if (this.value < 1) {
              // Minimum is 1
              this.value = 1;
              inputElement.value = this.value;
            } else if (this.value > field.slideroptions.length) {
              this.value = field.slideroptions.length;
              inputElement.value = this.value;
            } else {
              inputElement.value = this.value;
            }

            const selectedOption = field.slideroptions[inputElement.value - 1]; // Adjusted index

            // Determine the correct ID to send to Lua
            let sliderActionId;
            if (field.generalFunction) {
              // Use the unique ID for the general function
              sliderActionId = field.id + "_slider";
              sendToLua({
                type: "sliderChange",
                id: sliderActionId,
                sliderid: inputElement.value, // Pass the current slider value
              });
            } else {
              // Use the specific slider option's ID
              sliderActionId = selectedOption.sliderid + "_slider";
              sendToLua({
                type: "sliderChange",
                id: sliderActionId,
              });
            }
          });

          formDiv.appendChild(sliderTitle);
          formDiv.appendChild(inputElement);
          formDiv.appendChild(slidernumber);

          inputElement.addEventListener("input", function () {
            const selectedOption = field.slideroptions[inputElement.value - 1];
            slidernumber.value = inputElement.value;

            // Determine the correct ID to send to Lua
            let sliderActionId;
            if (field.generalFunction) {
              // Use the unique ID for the general function
              sliderActionId = field.id + "_slider";
              sendToLua({
                type: "sliderChange",
                id: sliderActionId,
                sliderid: inputElement.value, // Pass the current slider value
              });
            } else {
              // Use the specific slider option's ID
              sliderActionId = selectedOption.sliderid + "_slider";
              sendToLua({
                type: "sliderChange",
                id: sliderActionId,
              });
            }
          });
          break;
        case "divider":
          inputElement = document.createElement("div");
          inputElement.classList.add("divider");
          formDiv.appendChild(inputElement);
          break;
        case "text":
          inputElement = document.createElement("label");
          inputElement.innerText = field.label;
          inputElement.classList.add("labelForm");

          formDiv.appendChild(inputElement);
          break;
        case "image":
          inputElement = document.createElement("img");
          let imageUrl;
          if (field.image.includes("http")) {
            imageUrl = field.image; // Use the provided URL directly
          } else {
            // If the image URL does not start with "http", reroute it using the NUI path
            imageUrl = `nui://wrp_inventory/web/images/${field.image}`;
          }

          inputElement.src = imageUrl;

          inputElement.classList.add("imageForm");

          formDiv.appendChild(inputElement);
          break;
        case "button":
          inputElement = document.createElement("button");
          inputElement.innerText = field.label;
          inputElement.type = "button";
          inputElement.classList.add("submitButton");

          inputElement.onmouseover = function () {
            // Check if the button has been hovered over
            if (this.dataset.hovered !== "true") {
              this.dataset.hovered = "true"; // Mark the button as hovered
              sendToLua({ type: "buttonHover", id: field.id + "_hover" });
            }

            if (field.context) {
              tooltipDiv.innerHTML = field.context.replace(/\n/g, "<br/>");
              tooltipDiv.style.display = "block";
              tooltipDiv.style.left = event.pageX + "px";
              tooltipDiv.style.top = event.pageY + "px";
            }

            inputElement.onmouseleave = function () {
              this.dataset.hovered = "false"; // Reset the hover state

              if (field.context) {
                tooltipDiv.style.display = "none";
              }
            };
          };

          inputElement.onclick = function () {
            submitFormData(false, field.id + "_click");
          };

          formDiv.appendChild(inputElement);
          break;
      }

      // Assign an ID to the created input element
      if (field.id) inputElement.id = field.id;

      form.appendChild(formDiv);
    });

    if (formData.submitLabel) {
      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.classList.add("submitButton");
      submitButton.innerText = formData.submitLabel || "Submit";
      form.appendChild(submitButton);

      submitButton.onmouseover = function () {
        // Check if the button has been hovered over
        if (this.dataset.hovered !== "true") {
          this.dataset.hovered = "true"; // Mark the button as hovered
          sendToLua({ type: "buttonHover" });
        }

        submitButton.onmouseleave = function () {
          this.dataset.hovered = "false"; // Reset the hover state
        };
      };

      form.onsubmit = function (event) {
        event.preventDefault();

        submitFormData(true, buttonId);
      };
    }

    function submitFormData(submit, submittedButtonId) {
      formData.form.forEach((field) => {
        const inputElement = document.getElementById(field.id);
        switch (field.type) {
          case "short-text":
            formDataObj[field.id] = inputElement.value;
            break;
          case "number":
            formDataObj[field.id] = parseFloat(inputElement.value) || false;
            break;
          case "long-text":
            formDataObj[field.id] = inputElement.value;
            break;
          case "options":
            if (field.searchbar) {
              // If validOption is set in the dataset, use that. Otherwise, set to false.
              formDataObj[field.id] = inputElement.dataset.validOption || false;
            } else {
              formDataObj[field.id] =
                inputElement.options[inputElement.selectedIndex].value;
            }
            break;
          case "prompt":
            formDataObj[field.id] =
              (inputElement.value === "true" && true) || false;
            break;
          case "entries":
            const checkboxes = inputElement.querySelectorAll(
              "input[type='checkbox']"
            );
            const checkedValues = [];

            checkboxes.forEach((checkbox) => {
              if (checkbox.checked) {
                checkedValues.push(checkbox.value);
              }
            });

            formDataObj[field.id] = checkedValues;
            break;
          case "slider":
            formDataObj[field.id] = parseInt(inputElement.value, 10);
            break;
        }
      });

      if (submit) {
        sendToLua({
          type: "submitForm",
          id: submittedButtonId,
          formData: formDataObj,
        });
      } else {
        sendToLua({
          type: "buttonClick",
          id: submittedButtonId,
          formData: formDataObj,
        });
      }
    }

    buttonsContainer.appendChild(form);

    let backButton = document.getElementById("backButton");
    let closeButton = document.getElementById("closeButton");
    if (navigationStack.length > 1) {
      if ((backButton.style.display = "none")) {
        backButton.style.display = "flex";

        // Edits the CSS of the closebutton to remove margin-top
        if (miscMenuData.closeButton) {
          closeButton.style.marginTop = "0px";
        }
      }
    } else if ((backButton.style.display = "flex")) {
      backButton.style.display = "none";

      if (miscMenuData.closeButton) {
        closeButton.style.marginTop = "auto";
      }
    }
  }

  document.addEventListener("change", function (e) {
    if (e.target && e.target.matches("input[type='checkbox']")) {
      const checkboxDiv = e.target.closest(".checkboxDiv");
      if (checkboxDiv) {
        const imageDiv = checkboxDiv.querySelector(".imageDiv");
        const tickImage = imageDiv
          ? imageDiv.querySelector("img:nth-child(2)")
          : null;

        if (tickImage) {
          if (e.target.checked) {
            tickImage.style.display = "block";
          } else {
            tickImage.style.display = "none";
          }
        }
      }
    }
  });

  let showButtonShit = false;
  let showTooltip = false;
  function createButton(item) {
    const button = document.createElement("button");
    button.classList.add("button");

    if (item.image) {
      const imgDiv = document.createElement("div");
      imgDiv.classList.add("button-img");
      let imageUrl;
      if (item.image.includes("http")) {
        imageUrl = item.image; // Use the provided URL directly
      } else {
        // If the image URL does not start with "http", reroute it using the NUI path
        imageUrl = `nui://wrp_inventory/web/images/${item.image}`;
      }

      imgDiv.style.backgroundImage = `url(${imageUrl})`;
      imgDiv.style.backgroundSize = "contain";
      imgDiv.style.backgroundPosition = "center";
      imgDiv.style.backgroundRepeat = "no-repeat";

      button.appendChild(imgDiv); // Add the image div to the button
    }

    const textDiv = document.createElement("div");
    textDiv.classList.add("button-text");
    textDiv.innerText = item.name;
    button.appendChild(textDiv); // Add the text div to the button

    if (item.subMenu && item.subMenu.length > 0) {
      button.onclick = function () {
        navigationStack.push(item.subMenu);
        displayMenu(item.subMenu);
        backbuttoncurrentid = item.id + "_back";
        sendToLua({ type: "buttonClick", id: item.id });
        searchBar.value = ""; // Clear the search bar

        const buttons = buttonsContainer.querySelectorAll(".button");
        buttons.forEach((button) => {
          button.style.display = "flex";
        });

        if (showButtonShit) {
          clearDivBelow();
          showButtonShit = false;
        }

        if (showTooltip) {
          tooltipDiv.style.display = "none";
          showTooltip = false;
        }
      };
    } else if (item.form) {
      button.onclick = function () {
        navigationStack.push(item.form);
        displayForm(item.id, item);
        backbuttoncurrentid = item.id + "_back";
        sendToLua({ type: "buttonClick", id: item.id });

        searchBar.value = ""; // Clear the search bar
        searchBar.style.display = "none";
        inForm = true;

        const buttons = buttonsContainer.querySelectorAll(".button");
        buttons.forEach((button) => {
          button.style.display = "flex";
        });

        if (showButtonShit) {
          clearDivBelow();
          showButtonShit = false;
        }

        if (showTooltip) {
          tooltipDiv.style.display = "none";
          showTooltip = false;
        }
      };
    } else {
      button.onclick = function () {
        sendToLua({ type: "buttonClick", id: item.id });

        if (showTooltip) {
          tooltipDiv.style.display = "none";
          showTooltip = false;
        }
      };
    }

    button.onmouseover = function (event) {
      if (this.dataset.hovered !== "true") {
        this.dataset.hovered = "true"; // Mark the button as hovered
        clearDivBelow();
        if (item.requirements && Array.isArray(item.requirements)) {
          // If the item has requirements, display them for the currently hovered item only

          item.requirements.forEach((requirement) => {
            const reqDiv = createRequirementDiv(requirement);
            craftingIcons.appendChild(reqDiv);
          });

          showButtonShit = true;
        }

        // Show the tooltip
        if (item.context) {
          tooltipDiv.innerHTML = item.context.replace(/\n/g, "<br/>");
          tooltipDiv.style.display = "block";
          showTooltip = true;

          button.onmousemove = function (event) {
            // Update the tooltip's position
            tooltipDiv.style.left = event.pageX + 20 + "px";
            tooltipDiv.style.top = event.pageY + 20 + "px";
          };
        }

        if (item.information && item.requirements) {
          divider3.style.display = "flex";
        } else {
          divider3.style.display = "none";
        }

        if (item.information) {
          // If the item has information, display it
          informationDiv.innerHTML = item.information;
          showButtonShit = true;
        }

        sendToLua({ type: "buttonHover", id: item.id + "_hover" });
      }

      button.onmouseleave = function () {
        this.dataset.hovered = "false"; // Reset the hover state

        if (item.context) {
          tooltipDiv.style.display = "none";
          showTooltip = false;
        }

        if (showButtonShit) {
          /* clearDivBelow() */

          showButtonShit = false;
        }
      };
    };

    /* setFontSize(button); */

    return button;
  }

  function clearDivBelow() {
    craftingIcons.innerHTML = "";
    informationDiv.innerHTML = "";

    divider3.style.display = "none";
  }

  function sendToLua(data) {
    $.post("http://wrp_menu/" + data.type, JSON.stringify(data));
  }

  /* Actual LUA <-> JS */
  window.addEventListener("message", function (event) {
    switch (event.data.type) {
      case "DISPLAY":
        if (event.data.toggle) {
          menuContainer.style.visibility = "visible";
          displayMenu(menuData);
        } else {
          if (miscMenuData.align === "left") {
            menuContainer.classList.add("menu-animation-exit");
            menuContainer.style.animationName = "slideOutToLeft";
          } else if (miscMenuData.align === "right") {
            menuContainer.classList.add("menu-animation-exit");
            menuContainer.style.animationName = "slideOutToRight";
          } else {
            menuContainer.classList.add("menu-animation-exit");
            menuContainer.style.animationName = "slideOutToBottom";
          }

          // Set visibility to hidden after the animation completes
          menuContainer.addEventListener(
            "animationend",
            function () {
              menuContainer.style.visibility = "hidden";
              menuContainer.style.animation = ""; // Reset animation
              menuContainer.style.transform = ""; // Reset transform
              menuData = [];
              miscMenuData = [];
              navigationStack = [];
              clearDivBelow();
            },
            { once: true }
          );
        }
        break;
      case "SET_MENUDATA":
        menuData = event.data.menuData;
        miscMenuData = event.data.miscData;
        setTitle(miscMenuData.title);
        adjustTitleFontSize();

        if (miscMenuData.closeButton) {
          closeButton.style.display = "block";
        } else {
          closeButton.style.display = "none";
        }

        if (miscMenuData.searchBar) {
          searchBar.style.display = "flex";
        } else {
          searchBar.style.display = "none";
        }

        if (miscMenuData.align) {
          menuContainer.style.removeProperty("transform");
          menuContainer.style.removeProperty("left");
          menuContainer.style.removeProperty("right");
          if (miscMenuData.align === "left") {
            menuContainer.style.left = "0px";
          } else if (miscMenuData.align === "right") {
            menuContainer.style.right = "0px";
          } else if (miscMenuData.align === "center") {
            menuContainer.style.left = "50%";
            menuContainer.style.transform = "translateX(-50%)";
          }
        }

        divider3.style.display = "none";

        navigationStack = [menuData];
        displayMenu(menuData);
        break;
    }
  });
};
