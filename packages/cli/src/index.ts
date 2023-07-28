import {Command} from 'commander';
import {didsCommand} from './commands/dids';
import {credentialsCommand} from './commands/credentials';
import {documentsCommand} from './commands/documents';
import {verificationCommands} from './commands/verification';
import {messagesCommand} from './commands/messages';

const program = new Command();

program.addCommand(didsCommand);
program.addCommand(credentialsCommand);
program.addCommand(documentsCommand);
program.addCommand(verificationCommands);
program.addCommand(messagesCommand);

program.parse();
