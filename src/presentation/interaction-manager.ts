const readline = require("node:readline");
const { stdin: input, stdout: output } = require("node:process");

export interface AskOptions {
  defaultAnswer?: string | undefined;
  validator?: ((s: string) => boolean) | undefined;
}

export interface Choice {
  label: string;
  value: string;
}

export const openInteractionManager = () => {
  const rl = readline.createInterface({ input, output });
  const ask: (
    question: string,
    options?: AskOptions,
  ) => Promise<string | undefined> = async (
    question: string,
    options?: AskOptions,
  ) => {
    const { defaultAnswer, validator } = options || {};
    return new Promise((resolve) => {
      rl.question(
        question + `${defaultAnswer ? "(" + defaultAnswer + ")" : ""}`,
        (answer: string) => {
          if (validator && !validator(answer)) {
            console.log("Invalid");
            resolve(ask(question, { defaultAnswer, validator }));
          }
          resolve(answer || defaultAnswer);
        },
      );
    });
  };
  const choose: (
    question: string,
    choices: Choice[],
    optional?: boolean,
  ) => Promise<Choice | undefined> = async (
    question: string,
    choices: Choice[],
    optional,
  ) => {
    console.log(question);
    choices.forEach((choice) => {
      console.log(`${choice.value}. ${choice.label}`);
    });
    const choice = await ask("Please your choice", {
      validator: (input) => {
        if (optional && input.trim() === "") {
          return true;
        }
        return choices.some((choice) => choice.value === input);
      },
    });
    return choices!.find((c) => c.value === choice);
  };

  const close = () => {
    rl.close();
  };
  return {
    ask,
    choose,
    close,
  };
};

// const run = async () => {
//   console.log(
//     "---------------WELCOME TO SPLIT EXPENSE DASHBOARD------------------",
//   );
//   while (true) {
//     const prompt =
//       "\n Options:\n\t1. Add New friend\n\t2. Show my friends\n\t3. Exit\nYour choice: ";
//     const choice = await ask(prompt, {
//       defaultAnswer: undefined,
//       validator: undefined,
//     });

//     switch (choice) {
//       case "1":
//         // await AddFriend();
//         break;
//       case "2":
//         // showFriends();
//         break;
//       case "3":
//         console.log("Thank you, Goodbye!");
//         rl.close();
//         return;
//     }
//   }
// };

// run();
