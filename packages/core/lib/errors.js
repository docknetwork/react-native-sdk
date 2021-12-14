/* eslint-disable max-classes-per-file */

export class SdkError extends Error {
    constructor(message?: string) {
       super(message);
       Object.setPrototypeOf(this, SdkError.prototype);
    }
}

export const Errors = {
    accountAlreadyExists: 'Account already exists',
}
