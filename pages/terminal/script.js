const CUSTOM_COMMANDS = {
  hello: {
    msg: "Hello :)",
  },
  /* niestandardowe komendy */
  niestandardowa_komenda: {
    msg: "Not standard",
  },
};

const BUILT_IN_COMMANDS = {
  clear: function () {
    const terminalDiv = document.querySelector(
      ".terminal > div > div:last-child > div"
    );

    while (terminalDiv.firstChild) {
      terminalDiv.removeChild(terminalDiv.firstChild);
    }
  },
  help: function () {
    const result = Object.keys(ALL_COMMANDS).join("\t");

    makeTerminalLog("help", result);
  },
  quote: async function () {
    const controller = new AbortController();

    await fetch("https://dummyjson.com/quotes/random", {
      signal: controller.signal,
    })
      .then((response) => {
        if (response.ok === false) {
          const reason = response.status + " " + response.statusText;

          controller.abort(reason);
        }

        return response.json();
      })
      .then(({ quote }) => {
        makeTerminalLog("quote", quote);
      })
      .catch((error) => {
        makeTerminalLog("quote", error);
      });
  },
  double: function (args) {
    const result = args[1] * 2;

    if (typeof result !== "number" || Number.isNaN(result)) {
      makeTerminalLog(args.join(" "), "Only number arguments are supported!");

      return;
    }

    makeTerminalLog("double", result);
  },
};

const ALL_COMMANDS = {
  ...CUSTOM_COMMANDS,
  ...BUILT_IN_COMMANDS,
};

function addTerminalOutput(log) {
  const terminalDiv = document.querySelector(
    ".terminal > div > div:last-child > div"
  );
  const textPre = document.createElement("pre");
  textPre.textContent = log;

  terminalDiv.appendChild(textPre);

  // Keep bottom view to see new output immidiately
  terminalDiv.scrollTop = terminalDiv.scrollHeight;
}

function makeTerminalLog(input, output) {
  addTerminalOutput(`you: ${input}`);
  addTerminalOutput(`terminal: ${output}`);
}

async function executeCommand(commandQueue) {
  const initialValue = commandQueue[0];
  const args = initialValue.split(" ");
  const command = args[0];

  if (ALL_COMMANDS.hasOwnProperty(command)) {
    if (typeof ALL_COMMANDS[command] === "function") {
      if (ALL_COMMANDS[command].length === args.length - 1) {
        if (ALL_COMMANDS[command].constructor.name === "AsyncFunction") {
          await ALL_COMMANDS[command](args);
        } else {
          ALL_COMMANDS[command](args);
        }
      } else {
        makeTerminalLog(initialValue, "number of arguments does not match");
      }
    } else if (initialValue === command) {
      makeTerminalLog(initialValue, ALL_COMMANDS[command]["msg"]);
    } else {
      makeTerminalLog(
        initialValue,
        `Command '${command}' does not support arguments`
      );
    }
  } else {
    makeTerminalLog(
      initialValue,
      "Command not found. Type 'help' for a list of available commands"
    );
  }

  commandQueue.shift();

  while (commandQueue.length) {
    await executeCommand(commandQueue);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  addTerminalOutput(`Last login: ${new Date().toUTCString()}`);

  const commandInput = document.querySelector(
    ".terminal > div > div:last-child > input"
  );
  const commandQueue = [];
  const commandHistory = [];
  let historyIndex = -1;

  commandInput.addEventListener("keydown", (event) => {
    switch (event.key) {
      // Show up command hints
      case "Tab":
        event.preventDefault();

        const inputText = commandInput.value.trim();

        if (inputText) {
          const filteredCommands = Object.keys(ALL_COMMANDS).filter((command) =>
            command.startsWith(inputText)
          );

          if (filteredCommands.length > 1) {
            addTerminalOutput(filteredCommands.join("\t"));
          } else if (filteredCommands.length === 1) {
            commandInput.value = `${filteredCommands[0]} `;
          }
        }

        break;
      // Pass the command
      case "Enter":
        event.preventDefault();

        commandHistory.push(commandInput.value);
        historyIndex = -1;
        commandQueue.push(commandInput.value.trim());
        commandInput.value = "";

        if (commandQueue.length === 1) {
          executeCommand(commandQueue);
        }

        break;
      // Navigate up in command history
      case "ArrowUp":
        event.preventDefault();

        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;

          commandInput.value =
            commandHistory[commandHistory.length - 1 - historyIndex];
        }

        break;
      // Navigate down in command history
      case "ArrowDown":
        event.preventDefault();

        if (historyIndex > 0) {
          historyIndex--;

          commandInput.value =
            commandHistory[commandHistory.length - 1 - historyIndex];
        } else {
          historyIndex = -1;

          commandInput.value = "";
        }

        break;
    }
  });
});
