import {Command} from 'commander';
import select, {Separator} from '@inquirer/select';
import checkbox from '@inquirer/checkbox';
import input from '@inquirer/input';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {getWallet} from '../helpers';
import {createVerificationController} from '@docknetwork/wallet-sdk-core/src/verification-controller';
import {WalletEvents} from '@docknetwork/wallet-sdk-wasm/src/modules/wallet';
import clipboardy from 'clipboardy';
const verificationCommands = new Command('verification');

verificationCommands
  .command('start')
  .option('-t, --template <template>', 'Verification template')
  .description('Start wallet verification flow')
  .action(async options => {
    const wallet: IWallet = await getWallet();

    await wallet.waitForEvent(WalletEvents.networkConnected);

    const controller = createVerificationController({
      wallet,
    });

    let template = options.template;

    if (!template) {
      template = await input({
        message:
          'Enter the proof request template URL (leave it empty to copy a JSON from clipboard)',
      });

      if (!template) {
        template = await clipboardy.read();
      }
    }

    console.log('Got template', template);

    console.log('Starting verification flow...');
    await controller.start({
      template,
    });

    console.log('Proof Request Template JSON:');
    console.log(JSON.stringify(controller.getTemplateJSON(), null, 2));

    const filteredCredentials = await controller.getFilteredCredentials();
    console.log('Credentials filtered');

    if (!filteredCredentials.length) {
      console.log('No credentials found for this proof request template');
      return;
    }

    const credentialId = await select({
      message: 'Select a credential',
      choices: await Promise.all(
        filteredCredentials.map(async item => {
          const isBBS = await controller.isBBSPlusCredential(item);
          return {
            name: `Name: ${item.name}\n  Is BBS: ${
              isBBS ? 'Yes' : 'No'
            }\n  Type: ${JSON.stringify(item.type)}`,
            value: item.id,
            description: `Subject: ${JSON.stringify(item.credentialSubject)}`,
          };
        }),
      ),
    });

    const credential = filteredCredentials.find(
      item => item.id === credentialId,
    );
    console.log(`Credential selected: ${credentialId}`);

    let attributesToReveal = [];

    // check if bbs
    if (await controller.isBBSPlusCredential(credential)) {
      const availableAttributes = Object.keys(credential.credentialSubject);

      attributesToReveal = await checkbox({
        message: 'Select the attributes to reveal',
        choices: availableAttributes.map(key => {
          return {
            name: `${key}: ${credential.credentialSubject[key]}`,
            value: `credentialSubject.${key}`,
          };
        }),
      });

      console.log(`Attributes selected: ${attributesToReveal.join(', ')}`);
    }

    controller.selectedCredentials.set(credentialId, {
      credential: filteredCredentials.find(item => item.id === credentialId),
      attributesToReveal,
    });

    console.log('Generating presentation...');

    const presentation = await controller.createPresentation();

    console.log('Presentation generated:');
    console.log(JSON.stringify(presentation, null, 2));
    console.log('Verifying presentation...');

    const result = await controller.evaluatePresentation(presentation);

    if (result.isValid) {
      console.log('Verification successful!');
    } else {
      console.log('Verification result:');
      console.log(JSON.stringify(result, null, 2));
    }
  });

verificationCommands
  .command('check-presentation')
  .option('-t, --template <template>', 'Verification template')
  .description('Check presentation JSON using a proof request template')
  .action(async (options) => {
    const wallet: IWallet = await getWallet();

    let template = options.template;

    if (!template) {
      template = await input({
        message:
          'Enter the proof request template URL (leave it empty to copy a JSON from clipboard)',
      });

      if (!template) {
        template = await clipboardy.read();
      }
    }

    let presentation = options.presentation;

    if (!presentation) {
      presentation = await input({
        message:
          'Enter the presentation JSON (leave it empty to copy a JSON from clipboard)',
      });

      if (!presentation) {
        presentation = await clipboardy.read();
      }

      presentation = JSON.parse(presentation);
    }

    console.log('Got template', template);

    // await wallet.waitForEvent(WalletEvents.networkConnected);

    const controller = createVerificationController({
      wallet,
    });

    await controller.start({
      template,
    });

    const result = await controller.evaluatePresentation(presentation);

    console.log(result);

    if (result.isValid) {
      console.log('Verification successful!');
    } else {
      console.log('Verification result:');
      console.log(JSON.stringify(result, null, 2));
    }
  });

export {verificationCommands};
