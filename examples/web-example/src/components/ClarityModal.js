import React, { useState, useRef, useEffect } from "react";
import { Box, Button, IconButton, Typography, Modal, CircularProgress, TextField, Checkbox, FormControlLabel } from "@mui/material";

// ===== SHARED STYLES =====
const styles = {
  modalStyle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 2,
  },
  bulletPointStyle: {
    display: "flex",
    alignItems: "center",
    marginBottom: 2,
  },
  iconStyle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 1,
  },
  stepTextStyle: {
    fontSize: 14,
    textAlign: "center",
    color: "#1A1A1E",
  },
  videoContainerStyle: {
    width: "100%",
    paddingTop: 4,
    paddingBottom: 4,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    borderRadius: "5px",
    margin: "0 auto",
    marginBottom: "20px",
    backgroundColor: "#26272B",
  },
  videoLoadingStyle: {
    width: "240px",
    height: "240px",
    borderRadius: "100vh",
    padding: "3px", 
    backgroundColor: "#26272B", 
    boxSizing: "border-box",
    outline: "none",
    boxShadow: "0 0 0 1px #fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  videoStyle: {
    width: "240px",
    height: "240px",
    borderRadius: "100vh",
    padding: "3px", 
    backgroundColor: "#26272B", 
    boxSizing: "border-box",
    outline: "none",
    boxShadow: "0 0 0 1px #fff",
    transform: "scaleX(-1)",
  },
  emailIconStyle: {
    marginBottom: 1,
    fontSize: '32px',
  },
  recoveryCodeStyle: {
    fontSize: "16px",
    padding: "16px",
    borderRadius: "4px",
    border: "1px solid #E4E7EC",
    wordBreak: "break-all",
    margin: "16px 0",
    textAlign: "center",
  },
  actionButtonsStyle: {
    display: "flex",
    justifyContent: "space-between",
    gap: '16px',
  },
  cancelButtonStyle: {
    backgroundColor: "#F4F4F5",
    border: 0,
    borderRadius: "20px",
    flex: 1,
    color: '#51525C',
  },
  continueButtonStyle: {
    backgroundColor: "#0066ff",
    borderRadius: "20px",
    flex: 1,
  },
};

// Quotient Logo Component
const QuotientLogo = () => {
  return (
    <Box>
      <img
        src="/quotient-logo.png"
        alt="Quotient Logo"
        style={{
          width: "52px",
          height: "52px",
          marginBottom: '16px'
        }}
      />
    </Box>
  );
};

const PoweredByClarityHeader = ({ onClose }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, px: 2, borderBottom: '1px solid #E4E7EC' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img
          src="/powered-by.png"
          alt="Clarity Logo"
          style={{
            height: "32px",
            marginRight: '8px'
          }}
        />
      </Box>
      <IconButton onClick={onClose} sx={{ color: '#1A1A1E' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.364 5.636L5.636 18.364" stroke="#1A1A1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.636 5.636L18.364 18.364" stroke="#1A1A1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </IconButton>
    </Box>
  );
};

const ProtectiveMaskIcon = () => (
  <svg width="40" height="41" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30.6196 26.4613C29.8437 24.4122 29.4688 22.1626 29.5703 19.8375L27.1697 19.2386C22.47 18.0383 17.5229 18.0383 12.8232 19.2386L10.4226 19.8375C10.5241 22.1626 10.1492 24.4122 9.37329 26.4613L8.92285 27.6122L9.04783 27.7606C11.7739 30.9371 15.6717 32.9107 19.9964 32.9107C24.3212 32.9107 28.219 30.9371 30.9451 27.7606L31.07 27.6122L30.6196 26.4613Z" fill="white"/>
    <path d="M31.069 27.6118L30.6186 26.461C29.4183 23.287 29.1683 19.6627 30.1447 16.0383C30.3947 15.088 30.7175 14.1897 31.0925 13.3383C31.8684 11.6146 34.4434 11.9635 34.7429 13.8147C34.8939 14.7391 34.9668 15.6894 34.9668 16.6632C34.9668 25.6356 28.244 32.9104 19.9694 32.9104C11.6974 32.9104 4.99805 25.6356 4.99805 16.6632C4.99805 15.6894 5.07355 14.7391 5.22197 13.8147C5.524 11.9401 8.09647 11.6146 8.87237 13.3383C9.24731 14.1897 9.57277 15.088 9.82273 16.0383C10.2471 17.5875 10.4216 19.1628 10.4216 20.6885C10.3981 22.7116 10.0466 24.6878 9.34625 26.487L8.89841 27.6352" stroke="#1A1A1E" stroke-width="1.49974" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M29.5696 19.8375L27.169 19.2386C22.4693 18.0383 17.5222 18.0383 12.8225 19.2386L10.4219 19.8375" stroke="#1A1A1E" stroke-width="1.49974" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path opacity="0.8" d="M26.7457 23.7874C22.2725 23.113 17.7212 23.113 13.248 23.7874" stroke="#0063F7" stroke-width="1.49974" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path opacity="0.8" d="M27.4945 27.6621C22.5214 28.4875 17.4702 28.4875 12.4971 27.6621" stroke="#0063F7" stroke-width="1.49974" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

const GlassesIcon = () => (
  <svg width="40" height="41" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M36.4311 23.3087L27.126 9.666C27.126 9.666 27.126 9.63862 27.0987 9.63862C25.2585 7.16859 22.0244 6.1417 19.1847 7.14121C18.7657 7.30004 18.5549 7.74639 18.7137 8.14072C18.8698 8.53505 19.3162 8.77055 19.7105 8.61446C21.8683 7.85045 24.3904 8.63911 25.8116 10.5587L33.145 21.3124C30.2807 19.8391 24.8915 20.05 22.7337 21.9422C22.5502 22.101 22.3667 22.2845 22.2353 22.468C21.526 22.2051 20.6059 22.1531 20.0281 22.1531C19.4229 22.1531 18.5028 22.2051 17.8183 22.468C17.6622 22.2845 17.5033 22.101 17.3199 21.9422C15.7152 20.5484 12.3771 20.0746 9.58939 20.4963L16.5312 14.9484C18.24 13.5819 20.4991 13.1876 22.4461 13.8722C22.5502 13.8968 22.6296 13.9516 22.7337 13.9762C23.128 14.1351 23.6017 13.9516 23.7606 13.5573C23.9166 13.1629 23.7332 12.6892 23.3388 12.5304C23.2074 12.4783 23.1033 12.4263 22.9719 12.3989C20.4991 11.5308 17.6622 12.032 15.5317 13.7407L3.75389 23.1252C3.491 23.336 3.38694 23.6783 3.491 23.9933C3.5978 24.3082 3.91271 24.519 4.22763 24.519H4.5179C4.49051 24.7025 4.49051 24.8613 4.49051 25.0448V25.1762C4.49051 29.1715 7.7492 32.537 11.5884 32.537C15.4276 32.537 18.6863 29.1715 18.6863 25.1762V25.0448C18.6863 24.6505 18.6343 24.2561 18.5028 23.8865C19.2121 23.6783 20.762 23.6783 21.474 23.8865C21.3672 24.2561 21.2878 24.6505 21.2878 25.0448V25.1762C21.2878 29.1715 24.5492 32.537 28.3857 32.537C32.2249 32.537 35.4836 29.1715 35.4836 25.1762V25.0448C35.4836 24.8613 35.459 24.7025 35.459 24.519H35.7465C36.0368 24.519 36.2996 24.3602 36.4585 24.0973C36.6146 23.8618 36.5899 23.5469 36.4311 23.3087Z" fill="#1A1A1E"/>
    <path d="M7.90758 29.0674C7.67208 29.0674 7.43384 28.9606 7.27775 28.7497C6.51374 27.7256 6.06738 26.4632 6.06738 25.2008V25.0693C6.06738 24.3354 6.3823 23.6235 6.93545 23.1525C7.25037 22.8622 7.74875 22.8896 8.03902 23.2291C8.32929 23.5468 8.30191 24.0452 7.95961 24.3354C7.74875 24.5189 7.61731 24.7818 7.61731 25.0693V25.2008C7.61731 26.1209 7.93496 27.041 8.48538 27.805C8.74827 28.1473 8.66885 28.6457 8.32929 28.9086C8.24988 29.0126 8.09105 29.0674 7.90758 29.0674Z" fill="white"/>
    <path d="M23.8647 25.1243C23.7606 25.1243 23.6538 25.0969 23.5498 25.0449C23.1554 24.8614 22.972 24.3876 23.1554 23.9933C23.3143 23.651 23.5224 23.3607 23.8127 23.1252C24.6533 22.416 26.4689 21.9423 28.4652 21.9423C28.9115 21.9423 29.2538 22.2846 29.2538 22.7309C29.2538 23.1773 28.9115 23.5196 28.4652 23.5196C26.4935 23.5196 25.2311 23.9933 24.8642 24.3356C24.7601 24.4123 24.6807 24.5437 24.6287 24.6505C24.4425 24.9381 24.155 25.1243 23.8647 25.1243Z" fill="white"/>
    <path d="M12.4045 22.7309C12.4045 23.1663 12.0512 23.5196 11.6158 23.5196C11.1804 23.5196 10.8271 23.1663 10.8271 22.7309C10.8271 22.2955 11.1804 21.9423 11.6158 21.9423C12.0512 21.9423 12.4045 22.2955 12.4045 22.7309Z" fill="white"/>
  </svg>
);

const LightBulbIcon = () => (
  <svg width="40" height="41" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path opacity="0.1" d="M20 9.58919C12.8904 9.58919 7.125 15.3279 7.125 22.4078C7.125 29.4877 12.8904 35.2264 20 35.2264C27.1096 35.2264 32.875 29.4877 32.875 22.4078C32.875 15.3279 27.1096 9.58919 20 9.58919Z" fill="#0063F7"/>
    <path d="M22.6204 13.8352V14.2892H17.2941V13.9183C17.2941 15.4019 16.668 16.8262 15.5553 17.8232C14.0746 19.1318 13.1933 21.0991 13.3625 23.2622C13.6206 26.5114 16.2971 29.1582 19.573 29.36C23.4482 29.6152 26.638 26.5381 26.638 22.7489C26.638 20.7846 25.7835 19.0457 24.4156 17.8232C23.3058 16.7965 22.6204 15.3723 22.6204 13.8352Z" fill="white"/>
    <path d="M19.9997 30.2146C19.8276 30.2146 19.6851 30.2146 19.516 30.1849C15.8128 29.9564 12.7922 26.9951 12.5073 23.2919C12.3382 20.9567 13.2491 18.7045 14.985 17.1378C15.8989 16.3129 16.4093 15.1438 16.4093 13.8619C16.4093 13.3783 16.7802 13.0073 17.2638 13.0073C17.5487 13.0073 17.8068 13.1498 17.976 13.3783H21.8512C21.9937 13.1231 22.2785 12.9213 22.5931 12.9213C23.0767 12.9213 23.4476 13.2922 23.4476 13.7759C23.4476 15.031 24.0173 16.2565 24.9847 17.1378C26.5811 18.5621 27.492 20.5858 27.492 22.6925C27.492 24.6865 26.7235 26.5678 25.2992 27.9921C23.8749 29.4431 21.9937 30.2146 19.9997 30.2146ZM18.0353 15.1438C17.7772 16.4256 17.1214 17.5947 16.1541 18.476C14.7862 19.6748 14.1037 21.4107 14.2461 23.2355C14.4746 26.0841 16.7802 28.363 19.6287 28.5321C21.3379 28.6478 22.9343 28.0188 24.1004 26.8526C25.1835 25.7696 25.8096 24.3156 25.8096 22.7786C25.8096 21.1555 25.0974 19.5888 23.8749 18.476C22.8779 17.5947 22.1925 16.3989 21.9076 15.1438H18.0353Z" fill="#1A1A1E"/>
    <path opacity="0.6" d="M22.6202 14.2893H17.2939V11.6395C17.2939 10.1885 18.4898 8.99268 19.9437 8.99268C21.3947 8.99268 22.5935 10.1885 22.5935 11.6395V14.2893H22.6202Z" fill="#0063F7"/>
    <path d="M22.6203 15.1439H17.294C16.8104 15.1439 16.4395 14.773 16.4395 14.2893V11.6396C16.4395 9.7049 18.0062 8.13818 19.9438 8.13818C21.8814 8.13818 23.4749 9.7049 23.4749 11.6396V14.2893C23.4749 14.7463 23.0772 15.1439 22.6203 15.1439ZM18.1486 13.4348H21.7657V11.6396C21.7657 10.6426 20.9675 9.84733 19.9705 9.84733C18.9735 9.84733 18.1486 10.6426 18.1486 11.6396V13.4348Z" fill="#1A1A1E"/>
    <path d="M20.0003 35.5115C19.5166 35.5115 19.1457 35.1406 19.1457 34.6569V33.3484C19.1457 32.8617 19.5166 32.4938 20.0003 32.4938C20.4839 32.4938 20.8548 32.8617 20.8548 33.3484V34.6569C20.8548 35.1406 20.4839 35.5115 20.0003 35.5115ZM28.46 32.0368C28.2315 32.0368 28.0327 31.9508 27.8635 31.7816L26.9229 30.841C26.5817 30.4998 26.5817 29.9568 26.9229 29.6452C27.2641 29.301 27.8042 29.301 28.1187 29.6452L29.0593 30.5829C29.4006 30.9271 29.4006 31.4671 29.0593 31.7816C28.8872 31.9508 28.6884 32.0368 28.46 32.0368ZM31.9643 23.6038H30.6261C30.1424 23.6038 29.7715 23.2359 29.7715 22.7493C29.7715 22.2656 30.1424 21.8947 30.6261 21.8947H31.9643C32.448 21.8947 32.8189 22.2656 32.8189 22.7493C32.8189 23.2359 32.448 23.6038 31.9643 23.6038ZM9.37446 23.6038H8.03622C7.55255 23.6038 7.18164 23.2359 7.18164 22.7493C7.18164 22.2656 7.55255 21.8947 8.03622 21.8947H9.37446C9.85812 21.8947 10.229 22.2656 10.229 22.7493C10.229 23.2359 9.83142 23.6038 9.37446 23.6038ZM11.5406 32.0368C11.3121 32.0368 11.1133 31.9508 10.9412 31.7816C10.5999 31.4374 10.5999 30.8974 10.9412 30.5829L11.8818 29.6452C12.223 29.301 12.766 29.301 13.0776 29.6452C13.4188 29.9864 13.4188 30.5265 13.0776 30.841L12.137 31.7816C11.9679 31.9508 11.769 32.0368 11.5406 32.0368Z" fill="#1A1A1E"/>
    <path d="M19.9434 9.84736C19.4598 9.84736 19.0889 9.47645 19.0889 8.99278V6.34301C19.0889 5.85934 19.4598 5.48843 19.9434 5.48843C20.4271 5.48843 20.798 5.85934 20.798 6.34301V8.99278C20.798 9.44678 20.4271 9.84736 19.9434 9.84736Z" fill="#1A1A1E"/>
  </svg>
);

const LockIcon = () => (
  <svg width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 24.3313C0 11.0765 10.7452 0.331337 24 0.331337C37.2548 0.331337 48 11.0765 48 24.3313C48 37.5862 37.2548 48.3313 24 48.3313C10.7452 48.3313 0 37.5862 0 24.3313Z" fill="#EFF4FF"/>
    <g clip-path="url(#clip0_5434_6359)">
    <path d="M16 34.3313V20.3313H19V18.3313C19 16.948 19.4833 15.773 20.45 14.8063C21.4333 13.823 22.6167 13.3313 24 13.3313C25.3833 13.3313 26.5583 13.823 27.525 14.8063C28.5083 15.773 29 16.948 29 18.3313V20.3313H32V34.3313H16ZM18 32.3313H30V22.3313H18V32.3313ZM24 29.3313C24.55 29.3313 25.0167 29.1397 25.4 28.7563C25.8 28.3563 26 27.8813 26 27.3313C26 26.7813 25.8 26.3147 25.4 25.9313C25.0167 25.5313 24.55 25.3313 24 25.3313C23.45 25.3313 22.975 25.5313 22.575 25.9313C22.1917 26.3147 22 26.7813 22 27.3313C22 27.8813 22.1917 28.3563 22.575 28.7563C22.975 29.1397 23.45 29.3313 24 29.3313ZM21 20.3313H27V18.3313C27 17.498 26.7083 16.7897 26.125 16.2063C25.5417 15.623 24.8333 15.3313 24 15.3313C23.1667 15.3313 22.4583 15.623 21.875 16.2063C21.2917 16.7897 21 17.498 21 18.3313V20.3313ZM18 32.3313V22.3313V32.3313Z" fill="#004EEB"/>
    </g>
    <defs>
    <clipPath id="clip0_5434_6359">
    <rect width="24" height="24" fill="white" transform="translate(12 12.3313)"/>
    </clipPath>
    </defs>
  </svg>
);

const InstructionsStep = ({ onContinue, onClose }) => {
  return (
    <>
      <QuotientLogo />
      <Typography component="h2" sx={{ fontWeight: 700, fontSize: '20px' }}>
        Create a Clarity account
      </Typography>

      <Typography sx={{ mb: 3, fontWeight: 400, fontSize: '14px' }}>
        To continue with Quotient, take a quick selfie to verify it's you.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box sx={styles.bulletPointStyle}>
          <Box sx={styles.iconStyle}>
            <ProtectiveMaskIcon />
          </Box>
          <Typography variant="body2">Remove any face coverings</Typography>
        </Box>

        <Box sx={styles.bulletPointStyle}>
          <Box sx={styles.iconStyle}>
            <GlassesIcon />
          </Box>
          <Typography variant="body2">Remove glasses to avoid glare</Typography>
        </Box>

        <Box sx={styles.bulletPointStyle}>
          <Box sx={styles.iconStyle}>
            <LightBulbIcon />
          </Box>
          <Typography variant="body2">Choose a well-lit area for your selfie</Typography>
        </Box>
      </Box>

      {/* Action buttons */}
      <Box sx={styles.actionButtonsStyle}>
        <Button variant="outlined" onClick={onClose} sx={styles.cancelButtonStyle}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onContinue} sx={styles.continueButtonStyle}>
          Continue
        </Button>
      </Box>
    </>
  );
};

const EmailVerificationStep = ({ email, setEmail, onContinue }) => {
  const [emailError, setEmailError] = useState("");

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle send magic link (email verification)
  const onSendMagicLink = () => {
    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // In a real app, you would send a verification email or magic link
    // For now, just move to the next step
    setEmailError("");
    onContinue();
  };

  return (
    <>
      <Box sx={styles.emailIconStyle}>
        <span role="img" aria-label="email">✉️</span>
      </Box>

      <Typography component="h2" sx={{ mb: 1, fontWeight: 700, fontSize: '20px' }}>
        Verify your email address
      </Typography>

      <Typography sx={{ mb: 2, fontSize: '14px', fontWeight: 400 }}>
        Enter your email to receive a magic link for verification. This email will be used to receive your credentials.
      </Typography>

      <Box>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
          Email address
        </Typography>
        <TextField
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!emailError}
          helperText={emailError}
          placeholder="Enter your email address"
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={onSendMagicLink}
          fullWidth
          sx={styles.continueButtonStyle}
        >
          Send magic link
        </Button>
      </Box>
    </>
  );
};

const CameraSelfieStep = ({ onBack, onContinue }) => {
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef(null);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 720 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });

      setCameraStream(stream);
      setIsCameraReady(true);
      setCameraError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError(`Camera access error: ${error.message}`);
      setIsCameraReady(false);
    }
  };

  const onTakePhoto = () => {
    if (!videoRef.current || !isCameraReady) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/png');

    onContinue();
    stopCamera();

    return imageDataUrl;
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraReady(false);
  };

  useEffect(() => {
    if (!videoRef.current || !isCameraReady) {
      initializeCamera();
    }

    return () => {
      if (isCameraReady) {
        stopCamera();
      }
    };
  }, [isCameraReady]);

  return (
    <>
      <Box sx={styles.videoContainerStyle}>
        {!isCameraReady && !cameraError && (
          <Box sx={styles.videoLoadingStyle}>
            <CircularProgress />
          </Box>
        )}

        {isCameraReady && (<video
          ref={videoRef}
          style={styles.videoStyle}
          autoPlay
          playsInline
        />)}

        {cameraError && (
          <Typography color="error" variant="body2">
            {cameraError}
          </Typography>
        )}
      </Box>

      <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 700, fontSize: '20px' }}>
        Align your face within the frame
      </Typography>

      <Typography variant="caption" sx={{ display: "block", textAlign: "center", mb: 3, fontSize: '14px' }}>
        Keep your face still
      </Typography>

      <Box sx={styles.actionButtonsStyle}>
        <Button variant="outlined" onClick={onBack} sx={styles.cancelButtonStyle}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={onTakePhoto}
          disabled={!isCameraReady}
          sx={styles.continueButtonStyle}
        >
          Take Photo
        </Button>
      </Box>
    </>
  );
};

const ProcessingStep = ({ onContinue }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <>
      <Box sx={{ textAlign: "center" }}>
        <Box sx={styles.videoContainerStyle}>
          <Box sx={styles.videoLoadingStyle}>
            <CircularProgress />
          </Box>
        </Box>

        <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 700, fontSize: '20px' }}>
          ...
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 700, fontSize: '20px' }}>
          Verifying your identity
        </Typography>

        <Typography variant="caption" sx={{ display: "block", textAlign: "center", mb: 3, fontSize: '14px' }}>
          Please wait a moment
        </Typography>
      </Box>
    </>
  );
};

// Step 5: Recovery code introduction component
const RecoveryIntroStep = ({ onContinue }) => {
  const [recoveryCodeAcknowledged, setRecoveryCodeAcknowledged] = useState(false);

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <LockIcon />
        <Typography component="h2" sx={{ fontWeight: 700, fontSize: '20px' }}>
          Secure your account with recovery codes
        </Typography>

        <Typography variant="body2" sx={{ fontSize: '14px' }}>
          Recovery codes ensure you can always access your account, even if you lose your device or can't use online login. Only you can recover your account, so keep them safe.
        </Typography>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={recoveryCodeAcknowledged}
            onChange={(e) => setRecoveryCodeAcknowledged(e.target.checked)}
          />
        }
        label="I understand and acknowledge."
      />

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          variant="contained"
          onClick={onContinue}
          disabled={!recoveryCodeAcknowledged}
          fullWidth
          sx={styles.continueButtonStyle}
        >
          Generate recovery code
        </Button>
      </Box>
    </>
  );
};

// Step 6: Show recovery code component
const RecoveryCodeDisplayStep = ({ recoveryCode, setRecoveryCode, onContinue }) => {
  const onCopyCode = async () => {
    try {
      // Copy recovery code to clipboard
      await navigator.clipboard.writeText(recoveryCode);
      alert("Recovery code copied to clipboard!");
    } catch (error) {
      console.error("Error copying recovery code:", error);
    }
  };

  // Generate a mock recovery code
  useEffect(() => {
    if (!recoveryCode) {
      setRecoveryCode("1R9fc-j92T-EXNV-dBAr-MC5h-ZN05-609E-SEVA-XKXF-X6XM-5XWZ-Y2VW-VS3Z-H4IQ");
    }
  }, [recoveryCode]);

  return (
    <>
      <Typography component="h2" sx={{ mb: 1, fontWeight: 700, fontSize: '20px' }}>
        Your recovery code
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, fontSize: '14px' }}>
        Save this code in a safe place. You'll need to re-enter it on the next screen.
      </Typography>

      <Box sx={styles.recoveryCodeStyle}>
        <Box sx={{ paddingBottom: 2, borderBottom: '1px solid #E0E0E0' }}>
          {recoveryCode}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            sx={styles.cancelButtonStyle}
            disabled
          >
            Print
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onCopyCode}
            sx={styles.cancelButtonStyle}
          >
            Copy
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={styles.cancelButtonStyle}
            disabled
          >
            Save
          </Button>
        </Box>
      </Box>

      <Button
        variant="contained"
        onClick={onContinue}
        fullWidth
        sx={{
          backgroundColor: '#0066ff',
          borderRadius: '20px',
          py: 1
        }}
      >
        Continue
      </Button>
    </>
  );
};

const RecoveryCodeConfirmStep = ({ recoveryCode, onClose, onBack, onComplete }) => {
  const [confirmRecoveryCode, setConfirmRecoveryCode] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const onConfirm = () => {
    if (confirmRecoveryCode.trim() === recoveryCode.trim()) {
      onComplete && onComplete(recoveryCode);
      onClose();
    } else {
      setConfirmError("Recovery code doesn't match. Please try again.");
    }
  };

  return (
    <>
      <Typography component="h2" sx={{ mb: 1, fontWeight: 700, fontSize: '20px' }}>
        Confirm your recovery code
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1, fontSize: '14px' }}>
          Enter your recovery code
        </Typography>
        <TextField
          fullWidth
          value={confirmRecoveryCode}
          onChange={(e) => setConfirmRecoveryCode(e.target.value)}
          error={!!confirmError}
          helperText={confirmError}
          placeholder="Enter your recovery code"
          sx={{ mb: 2 }}
        />

        <Box sx={styles.actionButtonsStyle}>
          <Button
            variant="outlined"
            onClick={onBack}
            sx={styles.cancelButtonStyle}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            sx={styles.continueButtonStyle}
          >
            Confirm
          </Button>
        </Box>
      </Box>
    </>
  );
};

function ClarityModal({ open, onClose, onComplete }) {
  // Steps:
  // 1: Instructions
  // 2: Email Verification
  // 3: Camera
  // 4: Processing
  // 5: Recovery Code Introduction
  // 6: Show Recovery Code
  // 7: Confirm Recovery Code
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");

  // Clean up when the modal closes
  const handleClose = () => {
    setStep(1);
    setEmail("");
    setRecoveryCode("");
    onClose();
  };

  const handleContinue = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <InstructionsStep
            onContinue={handleContinue}
            onClose={handleClose}
          />
        );

      case 2:
        return (
          <EmailVerificationStep
            email={email}
            setEmail={setEmail}
            onContinue={handleContinue}
          />
        );

      case 3:
        return (
          <CameraSelfieStep
            onBack={() => setStep(2)}
            onContinue={handleContinue}
          />
        );

      case 4:
        return <ProcessingStep onContinue={handleContinue} />;

      case 5:
        return (
          <RecoveryIntroStep
            onClose={handleClose}
            onContinue={handleContinue}
          />
        );

      case 6:
        return (
          <RecoveryCodeDisplayStep
            recoveryCode={recoveryCode}
            setRecoveryCode={setRecoveryCode}
            onClose={handleClose}
            onContinue={handleContinue}
          />
        );

      case 7:
        return (
          <RecoveryCodeConfirmStep
            onClose={handleClose}
            onBack={() => setStep(6)}
            onComplete={onComplete}
            recoveryCode={recoveryCode}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>

      <Box sx={styles.modalStyle}>
        {step !== 1 && (
          <PoweredByClarityHeader />
        )}
        <Box sx={{ p: 3 }}>
          {renderCurrentStep()}
        </Box>

      </Box>
    </Modal>
  );
}

export default ClarityModal;
