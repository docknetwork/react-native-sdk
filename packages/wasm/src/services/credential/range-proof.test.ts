import {createRangeProofPresentation} from "./range-proof";
import {utilCryptoService} from "../util-crypto";

describe('Test range proofs', () => {
  it('expect presentation to be created', async () => {
    const result = await createRangeProofPresentation();
    expect(result).toBe(true);
  });
});
