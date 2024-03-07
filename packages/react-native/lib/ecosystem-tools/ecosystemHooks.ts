import { useEffect, useState } from "react";
import { getEcosystems } from "./helpers";

export function useEcosystems({issuer, credential}) {
  const [ecosystems, setEcosystems] = useState([]);

  useEffect(() => {
    getEcosystems({issuerDID: issuer, schemaId: credential?.credentialSchema.id}).then(
      result => {
        setEcosystems(result || []);
      },
    );
  }, [issuer, credential]);

  return {ecosystems};
}
