# Maester Luwin

Maester Luwin is a Discord bot that will post the Oracle text or image of a _Game of Thrones: LCG_ card to your text channels when a card name is referenced. The Maester Luwin bot is a modified version of the excellent bot Servo found at 
https://github.com/scryfall/servo


## Data Import

The cards data _must_ be imported by running `node run import`. It will pull the the entire cards data set from [ThronesDB's][https://thronesdb.com] public API, transform it, and save it to the `/data` directory as file.

See this [article](https://devcenter.heroku.com/articles/scheduler) on how to reimport the data as a scheduled job.

## Usage

You must have the _Manage Server_ permission to add Servo to your Discord server.

The bot will appear as a user and join your text channels. If your Discord server restricts users from chatting by default, you will also need to grant the bot a role that allows it to speak.

## Features

While chatting, surround a AGoT card names with brackets (`[[` and `]]`) and prepend with an optional token. Servo will print out the text of that card or its image:

| Command               | Function                                        |
|-----------------------|-------------------------------------------------|
| `[[!Maester Luwin]]`  | Show a text representation of Maester Luuwin.   |
| `[[Old Nan]]`         | Show a picture of Old Nan.                      |

_example usuage to be added_

Work in progress: Maester Luwin will also handle misspellings and partial card names, as long as there is a clear match:

_example of misspelling to be added here_
