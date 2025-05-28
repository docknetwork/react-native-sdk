import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Modal, TextField } from "@mui/material";
import "./App.css";
import { createVerificationController } from "@docknetwork/wallet-sdk-core/lib/verification-controller";
import { getVCData } from "@docknetwork/prettyvc";
import axios from "axios";
import { setLocalStorageImpl } from "@docknetwork/wallet-sdk-data-store-web/lib/localStorageJSON";
import { edvService } from "@docknetwork/wallet-sdk-wasm/lib/services/edv";

import useCloudWallet from './hooks/useCloudWallet';

setLocalStorageImpl(global.localStorage);

function App() {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [formattedCredentials, setFormattedCredentials] = useState([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [credentialUrl, setCredentialUrl] = useState("");
  const [proofRequestUrl, setProofRequestUrl] = useState();
  const [verifyStep, setVerifyStep] = useState(1);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [walletKeys, setWalletKeys] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Styles for the modals
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };

  useEffect(() => {
    try {
      const keys = localStorage.getItem("keys");
      if (keys) {
        setWalletKeys(JSON.parse(keys));
      }
    } catch (err) {
      console.error("Error fetching wallet keys:", err);
    }
  }, []);

  const {
    loading: cloudWalletLoading,
    cloudWallet,
    wallet,
    credentialProvider,
    didProvider,
    defaultDID,
    messageProvider,
    provisionNewWallet,
  } = useCloudWallet(walletKeys);


  const handleImportCredential = async () => {
    if (!credentialProvider) {
      return
    }

    await credentialProvider.importCredentialFromURI({
      uri: credentialUrl,
      didProvider,
    });

    refreshDocuments();
    setImportModalOpen(false);
    setCredentialUrl("");
  };

  const refreshDocuments = useCallback(async () => {
    if (!credentialProvider) {
      return;
    }

    const creds = await credentialProvider.getCredentials();
    setFormattedCredentials(
      await Promise.all(
        creds.map((c) =>
          getVCData(c, {
            generateImages: false,
            generateQRImage: false,
          }).catch((err) => c)
        )
      )
    );
    setDocuments(creds);
  }, [credentialProvider]);

  useEffect(() => {
    if (credentialProvider) {
      refreshDocuments();
    }
  }, [credentialProvider, refreshDocuments]);

  useEffect(() => {
    if (!messageProvider || !credentialProvider) {
      return;
    }

    const unsubscribe = messageProvider.addMessageListener(async (message) => {
      console.log("Message received", message);

      if (message.body.credentials) {
        console.log("adding credential to the wallet");
        message.body.credentials.forEach(async (credential) => {
          await credentialProvider.addCredential(credential);
          refreshDocuments();
        });
      }
    });

    return () => unsubscribe && unsubscribe();
  }, [messageProvider, credentialProvider, refreshDocuments]);

  const handleVerifyCredential = async () => {
    if (!wallet || !credentialProvider || !didProvider) {
      return;
    }

    setLoading(true);
    const { data: proofRequest } = await axios.get(proofRequestUrl);
    const controller = createVerificationController({
      wallet,
      credentialProvider,
      didProvider,
    });

    const credential = selectedCredential;

    await controller.start({ template: proofRequest });

    const attributesToReveal = ["credentialSubject.name"];

    controller.selectedCredentials.set(credential.id, {
      credential,
      attributesToReveal,
    });

    const presentation = await controller.createPresentation();

    console.log(presentation);

    try {
      const { data: verificationResult } = await axios
        .post(proofRequest.response_url, presentation)
        .then((res) => res.data);

      console.log("Verification sent", {
        verificationResult,
      });

      alert("Verification sent successfully");
    } catch (err) {
      console.error("Error sending verification", err);
      alert("Error sending verification: " + err.response.data.error);
    }

    setLoading(false);
    setVerifyModalOpen(false);
    setVerifyStep(1);
    setProofRequestUrl("");
    setSelectedCredential(null);
  };

  const handleWalletKeyUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const keys = JSON.parse(e.target.result);
          localStorage.setItem("keys", JSON.stringify(keys));
          setWalletKeys(keys);
          setLoading(false);
        } catch (error) {
          console.error("Error parsing wallet keys:", error);
          setUploadError("Invalid wallet key file.");
          setLoading(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCreateWallet = async () => {
    setLoading(true);
    try {
      const newKeys = await edvService.generateKeys();
      console.log("generated new keys for the wallet");
      localStorage.setItem("keys", JSON.stringify(newKeys));
      setWalletKeys(newKeys);
    } catch (err) {
      console.error("Error generating keys", err);
    }
    setLoading(false);
  };

  console.log({
    walletKeys,
    loading,
    cloudWalletLoading,
    documents,
    formattedCredentials,
  });

  if (cloudWalletLoading || loading) {
    return (
      <div className="App">
        <Box className="App-header" p={5}>
          Loading...
        </Box>
      </div>
    );
  }

  if (!walletKeys) {
    return (
      <div className="App">
        <Box className="App-header" p={5}>
          <h2>Welcome to the Wallet App</h2>
          <p>Please upload your wallet key file or create a new wallet.</p>
          {uploadError && <p style={{ color: "red" }}>{uploadError}</p>}
          <Button variant="contained" component="label" sx={{ m: 1 }}>
            Upload Wallet Key File
            <input
              type="file"
              accept=".json"
              hidden
              onChange={handleWalletKeyUpload}
            />
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateWallet}
            sx={{ m: 1 }}
          >
            Create New Wallet
          </Button>
        </Box>
      </div>
    );
  }

  return (
    <div className="App">
      <Box className="App-header" p={5}>
        Documents
      </Box>
      <Box display="flex" gap={2} justifyContent="center" m={2}>
        <Button
          variant="contained"
          onClick={() => {
            setImportModalOpen(true);
            setCredentialUrl("");
          }}
        >
          Import Credential
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setVerifyModalOpen(true);
            setVerifyStep(1);
            setProofRequestUrl("");
            setSelectedCredential(null);
          }}
        >
          Verify Credential
        </Button>

        <Button
          variant="contained"
          onClick={() => {
            refreshDocuments();
          }}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            const currentKeys = localStorage.getItem("keys");
            localStorage.clear();
            localStorage.setItem("keys", currentKeys);
            window.location.reload();
          }}
        >
          Clear Wallet
        </Button>
        {cloudWallet && (
          <Button
            variant="contained"
            onClick={() => cloudWallet.clearEdvDocuments()}
          >
            Clear EDV
          </Button>
        )}
      </Box>
      {!defaultDID ? (
        <Button
          variant="contained"
          onClick={() => provisionNewWallet()}
        >
          Create Default DID
        </Button>
      ) : (
        <Box display="flex" gap={2} justifyContent="center" alignItems="center">
          <b>Default DID:</b>
          {defaultDID}
          <Button
            variant="contained"
            onClick={() => {
              navigator.clipboard.writeText(defaultDID);
            }}
          >
            Copy
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              await messageProvider.fetchMessages();
              await messageProvider.processDIDCommMessages();
            }}
          >
            Fetch Messages
          </Button>
        </Box>
      )}
      <div>
        {formattedCredentials.map((document) => (
          <Box key={document.id} bgcolor="#ccc" p={2} m={2}>
            <div>{document.id}</div>
            <div>{document.humanizedType}</div>
            <div>{JSON.stringify(document?.credentialSubject)}</div>
          </Box>
        ))}
      </div>

      {/* Import Credential Modal */}
      <Modal open={importModalOpen} onClose={() => setImportModalOpen(false)}>
        <Box sx={modalStyle}>
          <h2>Import Credential</h2>
          <TextField
            label="Credential Offer URL"
            fullWidth
            value={credentialUrl}
            onChange={(e) => setCredentialUrl(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleImportCredential}
            sx={{ mt: 2 }}
          >
            Import
          </Button>
        </Box>
      </Modal>

      {/* Verify Credential Modal */}
      <Modal
        open={verifyModalOpen}
        onClose={() => {
          setVerifyModalOpen(false);
          setVerifyStep(1);
          setProofRequestUrl("");
          setSelectedCredential(null);
        }}
      >
        <Box sx={modalStyle}>
          {verifyStep === 1 && (
            <>
              <h2>Verify Credential</h2>
              <TextField
                label="Proof Request URL"
                fullWidth
                value={proofRequestUrl}
                onChange={(e) => setProofRequestUrl(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={() => setVerifyStep(2)}
                sx={{ mt: 2 }}
                disabled={!proofRequestUrl}
              >
                Next
              </Button>
            </>
          )}
          {verifyStep === 2 && (
            <>
              <h2>Select Credential to Present</h2>
              <div>
                {formattedCredentials.map((document, idx) => (
                  <Box
                    key={document.id}
                    bgcolor={
                      selectedCredential?.id === document.id ? "#aaa" : "#ccc"
                    }
                    overflow={"hidden"}
                    p={2}
                    m={2}
                    onClick={() => setSelectedCredential(documents[idx])}
                    sx={{ cursor: "pointer" }}
                  >
                    <div>{document.humanizedType}</div>
                    <div>
                      {JSON.stringify(document.credentialSubject, null, 4)}
                    </div>
                  </Box>
                ))}
              </div>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button variant="outlined" onClick={() => setVerifyStep(1)}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleVerifyCredential}
                  disabled={!selectedCredential}
                >
                  Verify
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}

export default App;
